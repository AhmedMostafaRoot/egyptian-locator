import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { businesses, categories, locations, businessClaims } from "@/db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

const execAsync = promisify(exec);

const ALLOWED_COMMANDS: Record<string, { cmd: string; labelAr: string }> = {
  scrape_all: {
    cmd: "npx tsx scripts/scrape-businesses.ts --city=all",
    labelAr: "استخراج كافة المحافظات الـ 27 في مصر",
  },
  scrape_cairo: {
    cmd: "npx tsx scripts/scrape-businesses.ts --city=cairo",
    labelAr: "استخراج أنشطة القاهرة (التجمع، نصر، المعادي)",
  },
  scrape_giza: {
    cmd: "npx tsx scripts/scrape-businesses.ts --city=giza",
    labelAr: "استخراج أنشطة الجيزة (الشيخ زايد، 6 أكتوبر، الدقي)",
  },
  scrape_alex: {
    cmd: "npx tsx scripts/scrape-businesses.ts --city=alexandria",
    labelAr: "استخراج أنشطة الإسكندرية (سموحة، لوران)",
  },
  import: {
    cmd: "npx tsx scripts/import-scraped-data.ts",
    labelAr: "استيراد البيانات المستخرجة لقاعدة البيانات (Import)",
  },
  verify: {
    cmd: "npx tsx scripts/verify-whatsapp-links.ts",
    labelAr: "فحص التحقق الآلي من أرقام واتساب (WhatsApp Cron)",
  },
  seed: {
    cmd: "npx tsx src/db/seed.ts",
    labelAr: "إعادة تهيئة وتغذية البيانات الأولية (Reset Seed)",
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8"));
    const searchQuery = searchParams.get("search")?.trim() || "";

    const totalBiz = await db.select({ count: sql<number>`count(*)` }).from(businesses);
    const verifiedBiz = await db
      .select({ count: sql<number>`count(*)` })
      .from(businesses)
      .where(eq(businesses.verifiedStatus, true));
    const totalCats = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const totalLocs = await db.select({ count: sql<number>`count(*)` }).from(locations);

    const allCatsList = await db.select({ id: categories.id, nameAr: categories.nameAr, slug: categories.slug }).from(categories);
    const allLocsList = await db.select({ id: locations.id, cityAr: locations.cityAr, districtAr: locations.districtAr, citySlug: locations.citySlug, districtSlug: locations.districtSlug }).from(locations);

    const claims = await db
      .select({
        id: businessClaims.id,
        businessId: businessClaims.businessId,
        businessName: businesses.nameAr,
        claimantName: businessClaims.claimantName,
        claimantPhone: businessClaims.claimantPhone,
        requestedTier: businessClaims.requestedTier,
        status: businessClaims.status,
        createdAt: businessClaims.createdAt,
      })
      .from(businessClaims)
      .leftJoin(businesses, eq(businessClaims.businessId, businesses.id))
      .orderBy(desc(businessClaims.createdAt))
      .limit(20);

    // استعلام الأنشطة مع الترقيم والبحث
    let businessesQuery = db
      .select({
        id: businesses.id,
        nameAr: businesses.nameAr,
        slug: businesses.slug,
        phone: businesses.phone,
        whatsappNumber: businesses.whatsappNumber,
        address: businesses.address,
        rating: businesses.rating,
        verifiedStatus: businesses.verifiedStatus,
        featuredTier: businesses.featuredTier,
        createdAt: businesses.createdAt,
        categoryName: categories.nameAr,
        cityAr: locations.cityAr,
        districtAr: locations.districtAr,
      })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(locations, eq(businesses.locationId, locations.id))
      .$dynamic();

    if (searchQuery) {
      businessesQuery = businessesQuery.where(
        or(
          like(businesses.nameAr, `%${searchQuery}%`),
          like(businesses.phone, `%${searchQuery}%`),
          like(businesses.whatsappNumber, `%${searchQuery}%`),
          like(businesses.address, `%${searchQuery}%`),
          like(locations.cityAr, `%${searchQuery}%`),
          like(locations.districtAr, `%${searchQuery}%`)
        )
      );
    }

    const offset = (page - 1) * limit;
    const paginatedBusinesses = await businessesQuery
      .orderBy(desc(businesses.id))
      .limit(limit)
      .offset(offset);

    // حساب إجمالي النتائج المفلترة للترقيم
    let totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(businesses)
      .innerJoin(categories, eq(businesses.categoryId, categories.id))
      .innerJoin(locations, eq(businesses.locationId, locations.id))
      .$dynamic();

    if (searchQuery) {
      totalCountQuery = totalCountQuery.where(
        or(
          like(businesses.nameAr, `%${searchQuery}%`),
          like(businesses.phone, `%${searchQuery}%`),
          like(businesses.whatsappNumber, `%${searchQuery}%`),
          like(businesses.address, `%${searchQuery}%`),
          like(locations.cityAr, `%${searchQuery}%`),
          like(locations.districtAr, `%${searchQuery}%`)
        )
      );
    }

    const totalCountRes = await totalCountQuery;
    const totalFiltered = totalCountRes[0]?.count || 0;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    // ملفات التحقق والاستخراج المؤقت
    const scrapedPath = path.resolve(process.cwd(), "src/data/cairo_scraped_businesses.json");
    let stagedItems: any[] = [];
    if (fs.existsSync(scrapedPath)) {
      try {
        stagedItems = JSON.parse(fs.readFileSync(scrapedPath, "utf-8"));
      } catch {}
    }

    const logPath = path.resolve(process.cwd(), "src/data/whatsapp_verification_log.json");
    let verificationLog: any[] = [];
    if (fs.existsSync(logPath)) {
      try {
        verificationLog = JSON.parse(fs.readFileSync(logPath, "utf-8"));
      } catch {}
    }

    return NextResponse.json({
      stats: {
        totalBusinesses: totalBiz[0]?.count || 0,
        verifiedBusinesses: verifiedBiz[0]?.count || 0,
        unverifiedBusinesses: (totalBiz[0]?.count || 0) - (verifiedBiz[0]?.count || 0),
        totalCategories: totalCats[0]?.count || 0,
        totalLocations: totalLocs[0]?.count || 0,
        pendingClaimsCount: claims.filter((c) => c.status === "pending").length,
        scrapedQueueCount: stagedItems.length,
      },
      categories: allCatsList,
      locations: allLocsList,
      stagedBusinesses: stagedItems,
      recentClaims: claims,
      recentVerifications: verificationLog,
      paginatedBusinesses: {
        items: paginatedBusinesses,
        page,
        limit,
        totalFiltered,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error("Admin API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { action, citySlug, governorateName } = body;

    let cmdToRun = "";
    let labelToDisplay = "";

    if (action === "scrape_governorate" && citySlug) {
      const sanitizedSlug = String(citySlug).toLowerCase().replace(/[^a-z0-9-]/g, "");
      cmdToRun = `npx tsx scripts/scrape-businesses.ts --city=${sanitizedSlug}`;
      labelToDisplay = `استخراج بيانات محافظة: ${governorateName || sanitizedSlug}`;
    } else if (action && ALLOWED_COMMANDS[action]) {
      cmdToRun = ALLOWED_COMMANDS[action].cmd;
      labelToDisplay = ALLOWED_COMMANDS[action].labelAr;
    } else {
      return NextResponse.json(
        { error: "أمر غير مصرح به أو غير معروف" },
        { status: 400 }
      );
    }

    console.log(`🚀 [Admin Control] تشغيل الأمر: ${labelToDisplay} (${cmdToRun})`);

    const { stdout, stderr } = await execAsync(cmdToRun, {
      cwd: process.cwd(),
      timeout: 180000,
      maxBuffer: 1024 * 1024 * 5,
    });

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      action,
      labelAr: labelToDisplay,
      output: stdout || stderr,
      durationMs,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error("Command Execution Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        output: err.stdout || err.stderr || err.message,
        durationMs,
      },
      { status: 500 }
    );
  }
}
