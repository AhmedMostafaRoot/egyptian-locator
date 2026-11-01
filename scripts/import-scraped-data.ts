import fs from "fs";
import path from "path";
import { db } from "../src/db";
import { businesses, categories, locations } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function importScrapedData() {
  const jsonPath = path.resolve(process.cwd(), "src/data/cairo_scraped_businesses.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ ملف البيانات غير موجود:", jsonPath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📥 جاري استيراد ${data.length} نشاط تجاري مستخرج إلى قاعدة البيانات...`);

  const allCategories = await db.select().from(categories);
  const allLocations = await db.select().from(locations);

  const catMap = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));
  const locMap = Object.fromEntries(
    allLocations.map((l) => [`${l.citySlug}-${l.districtSlug}`, l.id])
  );

  let insertedCount = 0;

  for (const item of data) {
    const categoryId = catMap[item.categorySlug];
    const locationId = locMap[`${item.citySlug}-${item.districtSlug}`];

    if (!categoryId || !locationId) {
      console.warn(`⚠️ تعذر العثور على المعرف للتصنيف أو الموقع: ${item.categorySlug} / ${item.districtSlug}`);
      continue;
    }

    // التحقق مما إذا كان النشاط موجوداً بالفعل
    const existing = await db
      .select()
      .from(businesses)
      .where(eq(businesses.slug, item.slug))
      .limit(1);

    if (existing.length > 0) {
      continue;
    }

    await db.insert(businesses).values({
      nameAr: item.nameAr,
      slug: item.slug,
      phone: item.phone,
      whatsappNumber: item.whatsappNumber,
      address: item.address,
      rating: item.rating,
      reviewCount: item.reviewCount,
      verifiedStatus: item.verifiedStatus,
      featuredTier: item.featuredTier,
      categoryId,
      locationId,
      description: item.description,
      workingHoursAr: "يومياً من 9:00 ص حتى 10:00 م عدا الجمعة",
    });

    insertedCount++;
  }

  console.log(`✅ تم إدراج ${insertedCount} نشاط تجاري جديد في قاعدة بيانات SQLite بنجاح!`);
}

importScrapedData().catch((err) => {
  console.error("❌ خطأ أثناء استيراد البيانات:", err);
  process.exit(1);
});

