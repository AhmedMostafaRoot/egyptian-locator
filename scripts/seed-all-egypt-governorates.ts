import { db } from "../src/db";
import { locations } from "../src/db/schema";
import { eq } from "drizzle-orm";

const ALL_EGYPT_GOVERNORATES = [
  // 1. القاهرة
  { cityAr: "القاهرة", citySlug: "cairo", districtAr: "مدينة نصر", districtSlug: "nasr-city", isPopular: true },
  { cityAr: "القاهرة", citySlug: "cairo", districtAr: "التجمع الخامس والقاهرة الجديدة", districtSlug: "new-cairo", isPopular: true },
  { cityAr: "القاهرة", citySlug: "cairo", districtAr: "المعادي", districtSlug: "maadi", isPopular: true },
  { cityAr: "القاهرة", citySlug: "cairo", districtAr: "مصر الجديدة", districtSlug: "heliopolis", isPopular: true },
  { cityAr: "القاهرة", citySlug: "cairo", districtAr: "وسط البلد", districtSlug: "downtown", isPopular: false },

  // 2. الجيزة
  { cityAr: "الجيزة", citySlug: "giza", districtAr: "الشيخ زايد", districtSlug: "sheikh-zayed", isPopular: true },
  { cityAr: "الجيزة", citySlug: "giza", districtAr: "السادس من أكتوبر", districtSlug: "6th-of-october", isPopular: true },
  { cityAr: "الجيزة", citySlug: "giza", districtAr: "الدقي والمهندسين", districtSlug: "dokki", isPopular: true },
  { cityAr: "الجيزة", citySlug: "giza", districtAr: "الهرم وفيصل", districtSlug: "haram", isPopular: false },

  // 3. الإسكندرية
  { cityAr: "الإسكندرية", citySlug: "alexandria", districtAr: "سموحة", districtSlug: "smouha", isPopular: true },
  { cityAr: "الإسكندرية", citySlug: "alexandria", districtAr: "سيدي جابر ولوران", districtSlug: "sidi-gaber", isPopular: true },
  { cityAr: "الإسكندرية", citySlug: "alexandria", districtAr: "محرم بك", districtSlug: "moharam-bek", isPopular: false },

  // 4. الدقهلية
  { cityAr: "الدقهلية", citySlug: "dakahlia", districtAr: "المنصورة", districtSlug: "mansoura", isPopular: true },
  { cityAr: "الدقهلية", citySlug: "dakahlia", districtAr: "ميت غمر", districtSlug: "mit-ghamr", isPopular: false },

  // 5. الشرقية
  { cityAr: "الشرقية", citySlug: "sharqia", districtAr: "الزقازيق", districtSlug: "zagazig", isPopular: true },
  { cityAr: "الشرقية", citySlug: "sharqia", districtAr: "العاشر من رمضان", districtSlug: "10th-of-ramadan", isPopular: true },

  // 6. الغربية
  { cityAr: "الغربية", citySlug: "gharbia", districtAr: "طنطا", districtSlug: "tanta", isPopular: true },
  { cityAr: "الغربية", citySlug: "gharbia", districtAr: "المحلة الكبرى", districtSlug: "el-mahalla", isPopular: true },

  // 7. القليوبية
  { cityAr: "القليوبية", citySlug: "qalyubia", districtAr: "بنها", districtSlug: "banha", isPopular: false },
  { cityAr: "القليوبية", citySlug: "qalyubia", districtAr: "شبرا الخيمة", districtSlug: "shubra", isPopular: false },

  // 8. المنوفية
  { cityAr: "المنوفية", citySlug: "monufia", districtAr: "شبين الكوم", districtSlug: "shebin-el-kom", isPopular: false },
  { cityAr: "المنوفية", citySlug: "monufia", districtAr: "قويسنا", districtSlug: "quesna", isPopular: false },

  // 9. البحيرة
  { cityAr: "البحيرة", citySlug: "beheira", districtAr: "دمنهور", districtSlug: "damanhour", isPopular: false },
  { cityAr: "البحيرة", citySlug: "beheira", districtAr: "كفر الدوار", districtSlug: "kafr-el-dawar", isPopular: false },

  // 10. دمياط
  { cityAr: "دمياط", citySlug: "damietta", districtAr: "مدينة دمياط", districtSlug: "damietta-city", isPopular: true },
  { cityAr: "دمياط", citySlug: "damietta", districtAr: "رأس البر", districtSlug: "ras-el-bar", isPopular: true },

  // 11. كفر الشيخ
  { cityAr: "كفر الشيخ", citySlug: "kafr-el-sheikh", districtAr: "كفر الشيخ", districtSlug: "kafr-city", isPopular: false },
  { cityAr: "كفر الشيخ", citySlug: "kafr-el-sheikh", districtAr: "دسوق", districtSlug: "desouk", isPopular: false },

  // 12. بورسعيد
  { cityAr: "بورسعيد", citySlug: "port-said", districtAr: "حي الشرق والميناء", districtSlug: "port-said-east", isPopular: true },
  { cityAr: "بورسعيد", citySlug: "port-said", districtAr: "حي الزهور", districtSlug: "el-zohoor", isPopular: false },

  // 13. الإسماعيلية
  { cityAr: "الإسماعيلية", citySlug: "ismailia", districtAr: "مدينة الإسماعيلية", districtSlug: "ismailia-city", isPopular: false },

  // 14. السويس
  { cityAr: "السويس", citySlug: "suez", districtAr: "مدينة السويس", districtSlug: "suez-city", isPopular: false },
  { cityAr: "السويس", citySlug: "suez", districtAr: "العين السخنة", districtSlug: "ain-sokhna", isPopular: true },

  // 15. البحر الأحمر
  { cityAr: "البحر الأحمر", citySlug: "red-sea", districtAr: "الغردقة", districtSlug: "hurghada", isPopular: true },
  { cityAr: "البحر الأحمر", citySlug: "red-sea", districtAr: "الجونة", districtSlug: "el-gouna", isPopular: true },

  // 16. جنوب سيناء
  { cityAr: "جنوب سيناء", citySlug: "south-sinai", districtAr: "شرم الشيخ", districtSlug: "sharm-el-sheikh", isPopular: true },
  { cityAr: "جنوب سيناء", citySlug: "south-sinai", districtAr: "دهب", districtSlug: "dahab", isPopular: true },

  // 17. شمال سيناء
  { cityAr: "شمال سيناء", citySlug: "north-sinai", districtAr: "العريش", districtSlug: "el-arish", isPopular: false },

  // 18. مطروح
  { cityAr: "مطروح", citySlug: "matrouh", districtAr: "مرسى مطروح", districtSlug: "marsa-matrouh", isPopular: true },
  { cityAr: "مطروح", citySlug: "matrouh", districtAr: "العلمين الجديدة والساحل", districtSlug: "new-alamein", isPopular: true },

  // 19. الفيوم
  { cityAr: "الفيوم", citySlug: "fayoum", districtAr: "مدينة الفيوم", districtSlug: "fayoum-city", isPopular: false },

  // 20. بني سويف
  { cityAr: "بني سويف", citySlug: "beni-suef", districtAr: "مدينة بني سويف", districtSlug: "beni-suef-city", isPopular: false },

  // 21. المنيا
  { cityAr: "المنيا", citySlug: "minya", districtAr: "مدينة المنيا", districtSlug: "minya-city", isPopular: false },
  { cityAr: "المنيا", citySlug: "minya", districtAr: "ملوي", districtSlug: "mallawi", isPopular: false },

  // 22. أسيوط
  { cityAr: "أسيوط", citySlug: "asyut", districtAr: "مدينة أسيوط", districtSlug: "asyut-city", isPopular: false },

  // 23. سوهاج
  { cityAr: "سوهاج", citySlug: "sohag", districtAr: "مدينة سوهاج", districtSlug: "sohag-city", isPopular: false },

  // 24. قنا
  { cityAr: "قنا", citySlug: "qena", districtAr: "مدينة قنا", districtSlug: "qena-city", isPopular: false },
  { cityAr: "قنا", citySlug: "qena", districtAr: "نجع حمادي", districtSlug: "nagaa-hammadi", isPopular: false },

  // 25. الأقصر
  { cityAr: "الأقصر", citySlug: "luxor", districtAr: "مدينة الأقصر", districtSlug: "luxor-city", isPopular: true },

  // 26. أسوان
  { cityAr: "أسوان", citySlug: "aswan", districtAr: "مدينة أسوان", districtSlug: "aswan-city", isPopular: true },
  { cityAr: "أسوان", citySlug: "aswan", districtAr: "كوم أمبو", districtSlug: "kom-ombo", isPopular: false },

  // 27. الوادي الجديد
  { cityAr: "الوادي الجديد", citySlug: "new-valley", districtAr: "مدينة الخارجة", districtSlug: "el-kharga", isPopular: false },
];

async function seedAllGovernorates() {
  console.log("🇪🇬 جاري تغذية محافظات جمهورية مصر العربية الـ 27 وأحيائها الرئيسية...");

  const existingLocs = await db.select().from(locations);
  const existingSlugs = new Set(existingLocs.map((l) => `${l.citySlug}-${l.districtSlug}`));

  let insertedCount = 0;

  for (const item of ALL_EGYPT_GOVERNORATES) {
    const slug = `${item.citySlug}-${item.districtSlug}`;
    if (!existingSlugs.has(slug)) {
      await db.insert(locations).values({
        cityAr: item.cityAr,
        citySlug: item.citySlug,
        districtAr: item.districtAr,
        districtSlug: item.districtSlug,
        slug,
        isPopular: item.isPopular,
      });
      insertedCount++;
    }
  }

  console.log(`✅ تم إدراج ${insertedCount} موقع جديد في قاعدة البيانات بنجاح!`);
  const finalTotal = await db.select().from(locations);
  console.log(`📊 إجمالي المواقع والأحياء المسجلة في مصر الآن: ${finalTotal.length} موقع تغطي كافة المحافظات.`);
}

seedAllGovernorates().catch((err) => {
  console.error("Error seeding governorates:", err);
  process.exit(1);
});

