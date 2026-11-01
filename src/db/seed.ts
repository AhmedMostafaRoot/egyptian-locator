import { db } from "./index";
import { categories, locations, businesses } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 جاري تهيئة جداول قاعدة البيانات وتغذية البيانات التجريبية...");

  // إنشاء الجداول يدوياً للـ SQLite/LibSQL إن لم تكن موجودة
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT 'Briefcase',
      meta_title_template_ar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_ar TEXT NOT NULL,
      city_slug TEXT NOT NULL,
      district_ar TEXT NOT NULL,
      district_slug TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      is_popular INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      rating REAL DEFAULT 0.0,
      review_count INTEGER DEFAULT 0,
      verified_status INTEGER DEFAULT 0,
      featured_tier TEXT DEFAULT 'free',
      category_id INTEGER NOT NULL REFERENCES categories(id),
      location_id INTEGER NOT NULL REFERENCES locations(id),
      description TEXT,
      working_hours_ar TEXT,
      image_url TEXT,
      website_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS business_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      claimant_name TEXT NOT NULL,
      claimant_phone TEXT NOT NULL,
      national_id_or_cr TEXT,
      requested_tier TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ تم تجهيز الجداول بنجاح.");

  // تنظيف البيانات السابقة لتجنب التكرار أثناء الـ Seed
  await db.run(sql`DELETE FROM businesses;`);
  await db.run(sql`DELETE FROM locations;`);
  await db.run(sql`DELETE FROM categories;`);

  // 1. إدراج التصنيفات الأكثر بحثاً في مصر
  const seedCategories = [
    {
      nameAr: "ديكور وتشطيبات",
      slug: "interior-design",
      icon: "PaintBucket",
      metaTitleTemplateAr: "أفضل شركات ومكاتب ديكور وتشطيبات في {district}، {city}",
    },
    {
      nameAr: "أطباء أسنان",
      slug: "dentists",
      icon: "Stethoscope",
      metaTitleTemplateAr: "أفضل دكتور أسنان وعيادات أسنان في {district}، {city}",
    },
    {
      nameAr: "مكاتب محاماة واستشارات قانونية",
      slug: "lawyers",
      icon: "Scale",
      metaTitleTemplateAr: "أفضل مكاتب محامين ومستشارين قانونيين في {district}، {city}",
    },
    {
      nameAr: "صيانة وتعديل سيارات",
      slug: "car-repair",
      icon: "Wrench",
      metaTitleTemplateAr: "أفضل مراكز صيانة وخدمة سيارات في {district}، {city}",
    },
    {
      nameAr: "عيادات بيطرية",
      slug: "veterinary",
      icon: "HeartPulse",
      metaTitleTemplateAr: "أفضل عيادات بيطرية لرعاية الحيوانات في {district}، {city}",
    },
  ];

  const insertedCategories = await db.insert(categories).values(seedCategories).returning();
  console.log(`✅ تم إدراج ${insertedCategories.length} تصنيف.`);

  // 2. إدراج المحافظات والأحياء المصرية
  const seedLocations = [
    // القاهرة (Cairo)
    {
      cityAr: "القاهرة",
      citySlug: "cairo",
      districtAr: "مدينة نصر",
      districtSlug: "nasr-city",
      slug: "cairo-nasr-city",
      isPopular: true,
    },
    {
      cityAr: "القاهرة",
      citySlug: "cairo",
      districtAr: "التجمع الخامس والقاهرة الجديدة",
      districtSlug: "new-cairo",
      slug: "cairo-new-cairo",
      isPopular: true,
    },
    {
      cityAr: "القاهرة",
      citySlug: "cairo",
      districtAr: "المعادي",
      districtSlug: "maadi",
      slug: "cairo-maadi",
      isPopular: true,
    },
    {
      cityAr: "القاهرة",
      citySlug: "cairo",
      districtAr: "مصر الجديدة",
      districtSlug: "heliopolis",
      slug: "cairo-heliopolis",
      isPopular: true,
    },
    // الجيزة (Giza)
    {
      cityAr: "الجيزة",
      citySlug: "giza",
      districtAr: "الشيخ زايد",
      districtSlug: "sheikh-zayed",
      slug: "giza-sheikh-zayed",
      isPopular: true,
    },
    {
      cityAr: "الجيزة",
      citySlug: "giza",
      districtAr: "السادس من أكتوبر",
      districtSlug: "6th-of-october",
      slug: "giza-6th-of-october",
      isPopular: true,
    },
    {
      cityAr: "الجيزة",
      citySlug: "giza",
      districtAr: "الدقي والمهندسين",
      districtSlug: "dokki",
      slug: "giza-dokki",
      isPopular: true,
    },
    // الإسكندرية (Alexandria)
    {
      cityAr: "الإسكندرية",
      citySlug: "alexandria",
      districtAr: "سموحة",
      districtSlug: "smouha",
      slug: "alexandria-smouha",
      isPopular: true,
    },
  ];

  const insertedLocations = await db.insert(locations).values(seedLocations).returning();
  console.log(`✅ تم إدراج ${insertedLocations.length} موقع وحي سكني.`);

  // خريطة لتسهيل الربط
  const catMap = Object.fromEntries(insertedCategories.map(c => [c.slug, c.id]));
  const locMap = Object.fromEntries(insertedLocations.map(l => [l.slug, l.id]));

  // 3. إدراج أنشطة تجارية محلية واقعية
  const seedBusinesses = [
    // أطباء أسنان - مدينة نصر (Cairo / Nasr City)
    {
      nameAr: "مركز الأندلس التخصصي لطب وجراحة الأسنان",
      slug: "al-andalus-dental-center-nasr-city",
      phone: "01007718787",
      whatsappNumber: "201007718787",
      address: "شارع عباس العقاد، بجوار الجامعة العمالية، مدينة نصر، القاهرة",
      rating: 4.9,
      reviewCount: 142,
      verifiedStatus: true,
      featuredTier: "elite" as const,
      categoryId: catMap["dentists"],
      locationId: locMap["cairo-nasr-city"],
      description: "نخبة من استشاريي زراعة وتجميل وتقويم الأسنان بأحدث أجهزة الليزر والميكروسكوب في مدينة نصر. تعقيم فندقي وخدمات طوارئ 24 ساعة.",
      workingHoursAr: "السبت - الخميس: 10:00 ص - 11:00 م | الجمعة: 2:00 م - 10:00 م",
      imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    },
    {
      nameAr: "عيادات سمايل كير (د. أحمد الشربيني)",
      slug: "smile-care-clinics-nasr-city",
      phone: "01099887766",
      whatsappNumber: "201099887766",
      address: "شارع مكرم عبيد، تقاطع طريق النصر، مدينة نصر، القاهرة",
      rating: 4.7,
      reviewCount: 88,
      verifiedStatus: true,
      featuredTier: "pro" as const,
      categoryId: catMap["dentists"],
      locationId: locMap["cairo-nasr-city"],
      description: "تصميم الابتسامة الرقمية (هوليوود سمايل) وعلاج الجذور بجلسة واحدة بدون ألم. متوفر خطط تقسيط مريحة.",
      workingHoursAr: "يومياً من 1:00 م إلى 10:00 م عدا الجمعة",
    },
    {
      nameAr: "عيادة د. ميادة فاروق لطب أسنان الأطفال",
      slug: "dr-mayada-farouk-pediatric-dentistry",
      phone: "01234567890",
      whatsappNumber: "201234567890",
      address: "الحي السابع، بالقرب من مستشفى الشرطة، مدينة نصر، القاهرة",
      rating: 4.8,
      reviewCount: 65,
      verifiedStatus: false,
      featuredTier: "free" as const,
      categoryId: catMap["dentists"],
      locationId: locMap["cairo-nasr-city"],
      description: "عيادة متخصصة لطب أسنان الأطفال وذوي الهمم في بيئة ترفيهية خالية من الخوف والقلق باستخدام تقنيات الغاز الضاحك.",
      workingHoursAr: "من 12:00 ظهراً حتى 8:00 مساءً",
    },

    // ديكور وتشطيبات - القاهرة الجديدة والتجمع (Cairo / New Cairo)
    {
      nameAr: "مجموعة ديزاين آرت للهندسة المعمارية والتشطيبات الفاخرة",
      slug: "design-art-decor-new-cairo",
      phone: "0228123456",
      whatsappNumber: "201122334455",
      address: "مجمع البنوك، شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
      rating: 4.9,
      reviewCount: 110,
      verifiedStatus: true,
      featuredTier: "elite" as const,
      categoryId: catMap["interior-design"],
      locationId: locMap["cairo-new-cairo"],
      description: "تصميم وتنفيذ متكامل لكبرى الفيلات والشقق والوحدات الإدارية في التجمع والعاصمة الإدارية. تسليم مفتاح ومطابقة للمواصفات العالمية وضمان 10 سنوات.",
      workingHoursAr: "الأحد - الخميس: 9:00 ص - 6:00 م",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    },
    {
      nameAr: "فينش هاوس للمقاولات والديكور الحديث",
      slug: "finish-house-new-cairo",
      phone: "01001122334",
      whatsappNumber: "201001122334",
      address: "مول كونكورد بلازا، شارع التسعين الجنوبي، التجمع الخامس",
      rating: 4.6,
      reviewCount: 47,
      verifiedStatus: true,
      featuredTier: "pro" as const,
      categoryId: catMap["interior-design"],
      locationId: locMap["cairo-new-cairo"],
      description: "حلول تشطيب متكاملة وباقات سمارت هوم تناسب جميع الميزانيات مع جداول زمنية دقيقة وغرامة تأخير تعاقدية.",
      workingHoursAr: "السبت - الخميس: 10:00 ص - 7:00 م",
    },

    // ديكور وتشطيبات - القاهرة (Cairo / Nasr City)
    {
      nameAr: "إيوان للديكور والتصميم الداخلي",
      slug: "iwan-interior-design-nasr-city",
      phone: "01144556677",
      whatsappNumber: "201144556677",
      address: "أول شارع الطيران، بجوار فندق سونستا، مدينة نصر، القاهرة",
      rating: 4.7,
      reviewCount: 52,
      verifiedStatus: true,
      featuredTier: "pro" as const,
      categoryId: catMap["interior-design"],
      locationId: locMap["cairo-nasr-city"],
      description: "تصاميم كلاسيك ومودرن للشقق السكنية والمحلات التجارية والمطاعم بأعلى معايير الجودة والتنسيق اللوني.",
      workingHoursAr: "يومياً من 11:00 ص إلى 8:00 م",
    },

    // الشيخ زايد - صيانة سيارات (Giza / Sheikh Zayed)
    {
      nameAr: "المركز الألماني لصيانة السيارات الأوروبية (Zayed Garage)",
      slug: "german-car-care-sheikh-zayed",
      phone: "01055667788",
      whatsappNumber: "201055667788",
      address: "المنطقة الصناعية الثانية، مدخل زايد 4، الشيخ زايد، الجيزة",
      rating: 4.8,
      reviewCount: 93,
      verifiedStatus: true,
      featuredTier: "elite" as const,
      categoryId: catMap["car-repair"],
      locationId: locMap["giza-sheikh-zayed"],
      description: "كشف كمبيوتر وتصليح أعطال الميكانيكا والكهرباء والتكييف لسيارات مرسيدس، بي إم دبليو، وأودي مع قطع غيار أصلية وضمان معتمد.",
      workingHoursAr: "السبت - الخميس: 9:00 ص - 8:00 م",
      imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    },

    // المعادي - محاماة واستشارات قانونية (Cairo / Maadi)
    {
      nameAr: "مؤسسة النيل الدولية للمحاماة والاستشارات القانونية",
      slug: "nile-law-firm-maadi",
      phone: "0225191122",
      whatsappNumber: "201099112233",
      address: "شارع 9، ثكنات المعادي، القاهرة",
      rating: 4.9,
      reviewCount: 78,
      verifiedStatus: true,
      featuredTier: "elite" as const,
      categoryId: catMap["lawyers"],
      locationId: locMap["cairo-maadi"],
      description: "تأسيس الشركات وتسجيل العلامات التجارية وحل النزاعات القضائية والتجارية أمام المحاكم الاقتصادية والتحكيم الدولي.",
      workingHoursAr: "الأحد - الخميس: 9:30 ص - 5:30 م",
    },

    // الإسكندرية - سموحة - أطباء أسنان (Alexandria / Smouha)
    {
      nameAr: "مركز سموحة التخصصي لجراحة وتجميل الأسنان",
      slug: "smouha-dental-center-alexandria",
      phone: "034256789",
      whatsappNumber: "201200112233",
      address: "ميدان فيكتور عمانويل، عمارات الصيادلة، سموحة، الإسكندرية",
      rating: 4.8,
      reviewCount: 84,
      verifiedStatus: true,
      featuredTier: "pro" as const,
      categoryId: catMap["dentists"],
      locationId: locMap["alexandria-smouha"],
      description: "رعاية أسنان فائقة لجميع أفراد الأسرة في قلب سموحة. زراعة أسنان بتقنية اليوم الواحد وتركيبات الزيركون والإيماكس.",
      workingHoursAr: "يومياً من 11:00 ص إلى 10:00 م عدا الجمعة",
    },
  ];

  const insertedBusinesses = await db.insert(businesses).values(seedBusinesses).returning();
  console.log(`✅ تم إدراج ${insertedBusinesses.length} نشاط تجاري بنجاح!`);
  console.log("🎉 اكتمل إعداد وتغذية قاعدة البيانات بنجاح.");
}

main().catch((err) => {
  console.error("❌ خطأ أثناء الـ Seed:", err);
  process.exit(1);
});

