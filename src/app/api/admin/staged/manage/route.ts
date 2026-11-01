import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { businesses, categories, locations } from "@/db/schema";
import { eq } from "drizzle-orm";

const STAGED_FILE = path.resolve(process.cwd(), "src/data/cairo_scraped_businesses.json");

function getStagedList(): any[] {
  if (!fs.existsSync(STAGED_FILE)) return [];
  try {
    const raw = fs.readFileSync(STAGED_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStagedList(list: any[]) {
  const dir = path.dirname(STAGED_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STAGED_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function GET() {
  try {
    const staged = getStagedList();
    return NextResponse.json({ success: true, count: staged.length, items: staged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, slug } = body;
    let staged = getStagedList();

    const allCats = await db.select().from(categories);
    const allLocs = await db.select().from(locations);
    const catMap = Object.fromEntries(allCats.map((c) => [c.slug, c.id]));
    const locMap = Object.fromEntries(allLocs.map((l) => [`${l.citySlug}-${l.districtSlug}`, l.id]));

    if (action === "approve_single") {
      const item = staged.find((b) => b.slug === slug);
      if (!item) {
        return NextResponse.json({ error: "النشاط المطلوب غير موجود في قائمة الانتظار" }, { status: 404 });
      }

      const categoryId = catMap[item.categorySlug] || allCats[0]?.id || 1;
      let locationId = locMap[`${item.citySlug}-${item.districtSlug}`];
      if (!locationId) {
        locationId = allLocs.find((l) => l.citySlug === item.citySlug)?.id || allLocs[0]?.id || 1;
      }

      // إدراج أو تحديث النشاط في قاعدة البيانات
      const existing = await db.select().from(businesses).where(eq(businesses.slug, item.slug)).limit(1);
      if (existing.length === 0) {
        await db.insert(businesses).values({
          nameAr: item.nameAr,
          slug: item.slug,
          phone: item.phone,
          whatsappNumber: item.whatsappNumber,
          address: item.address || "العنوان بالتفصيل متاح عبر واتساب",
          rating: item.rating || 4.8,
          reviewCount: item.reviewCount || 10,
          verifiedStatus: true,
          featuredTier: item.featuredTier || "free",
          categoryId,
          locationId,
          description: item.description,
          workingHoursAr: "يومياً من 9:00 ص حتى 10:00 م عدا الجمعة",
        });
      }

      // إزالته من قائمة الانتظار
      staged = staged.filter((b) => b.slug !== slug);
      saveStagedList(staged);

      return NextResponse.json({
        success: true,
        message: `تم اعتماد النشاط "${item.nameAr}" وإدراجه في الدليل الحي بنجاح!`,
        remainingCount: staged.length,
      });
    }

    if (action === "approve_all") {
      let importedCount = 0;
      for (const item of staged) {
        const categoryId = catMap[item.categorySlug] || allCats[0]?.id || 1;
        let locationId = locMap[`${item.citySlug}-${item.districtSlug}`];
        if (!locationId) {
          locationId = allLocs.find((l) => l.citySlug === item.citySlug)?.id || allLocs[0]?.id || 1;
        }

        const existing = await db.select().from(businesses).where(eq(businesses.slug, item.slug)).limit(1);
        if (existing.length === 0) {
          await db.insert(businesses).values({
            nameAr: item.nameAr,
            slug: item.slug,
            phone: item.phone,
            whatsappNumber: item.whatsappNumber,
            address: item.address,
            rating: item.rating || 4.7,
            reviewCount: item.reviewCount || 15,
            verifiedStatus: true,
            featuredTier: item.featuredTier || "free",
            categoryId,
            locationId,
            description: item.description,
            workingHoursAr: "يومياً من 9:00 ص حتى 10:00 م عدا الجمعة",
          });
          importedCount++;
        }
      }

      // إفراغ قائمة الانتظار بعد الدمج الشامل
      saveStagedList([]);

      return NextResponse.json({
        success: true,
        message: `تم بنجاح دمج واعتماد كافة الأنشطة المستخرجة (${importedCount} نشاط) في قاعدة بيانات الدليل!`,
        remainingCount: 0,
      });
    }

    if (action === "reject_single") {
      const item = staged.find((b) => b.slug === slug);
      staged = staged.filter((b) => b.slug !== slug);
      saveStagedList(staged);
      return NextResponse.json({
        success: true,
        message: `تم استبعاد وحذف "${item?.nameAr || slug}" من قائمة الانتظار.`,
        remainingCount: staged.length,
      });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (err: any) {
    console.error("Error managing staged businesses:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

