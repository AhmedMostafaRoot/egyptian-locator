import Link from "next/link";
import { getAllCategories } from "@/db/queries/businesses";
import { getPopularLocations, getUniqueCities } from "@/db/queries/locations";
import { db } from "@/db";
import { businesses, categories, locations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Star,
  ChevronLeft,
  Stethoscope,
  PaintBucket,
  Scale,
  Wrench,
  HeartPulse,
  Briefcase,
} from "lucide-react";
import { BusinessCard } from "@/components/directory/BusinessCard";

// أيقونات التصنيفات الديناميكية
const iconMap: Record<string, any> = {
  dentists: Stethoscope,
  "interior-design": PaintBucket,
  lawyers: Scale,
  "car-repair": Wrench,
  veterinary: HeartPulse,
};

export default async function HomePage() {
  const allCategories = await getAllCategories();
  const popularLocations = await getPopularLocations();
  const uniqueCities = await getUniqueCities();

  // جلب نخبة الأنشطة المميزة للصفحة الرئيسية
  const topBusinesses = await db
    .select({
      id: businesses.id,
      nameAr: businesses.nameAr,
      slug: businesses.slug,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      address: businesses.address,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      verifiedStatus: businesses.verifiedStatus,
      featuredTier: businesses.featuredTier,
      description: businesses.description,
      workingHoursAr: businesses.workingHoursAr,
      imageUrl: businesses.imageUrl,
      category: {
        id: categories.id,
        nameAr: categories.nameAr,
        slug: categories.slug,
      },
      location: {
        id: locations.id,
        cityAr: locations.cityAr,
        citySlug: locations.citySlug,
        districtAr: locations.districtAr,
        districtSlug: locations.districtSlug,
      },
    })
    .from(businesses)
    .innerJoin(categories, eq(businesses.categoryId, categories.id))
    .innerJoin(locations, eq(businesses.locationId, locations.id))
    .orderBy(desc(businesses.rating))
    .limit(6);

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section - البحث والاستكشاف */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-200 border border-emerald-400/30 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            الدليل البرمجي الأول المخصص لمحافظات وأحياء مصر
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            ابحث عن أفضل الخدمات والأنشطة التجارية في <span className="text-emerald-300 underline decoration-emerald-400/50">منطقتك</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            تصفح أرقام التليفونات، العناوين التفصيلية، وتقييمات العملاء الموثقة مع إمكانية التواصل المباشر عبر واتساب في ثوانٍ.
          </p>

          {/* روابط سريعة للأنشطة الشائعة */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs text-emerald-200/80 ml-2">الأكثر بحثاً في مصر:</span>
            <Link
              href="/cairo/nasr-city/dentists"
              className="rounded-lg bg-emerald-800/80 px-3 py-1.5 text-xs font-semibold text-white border border-emerald-600/50 hover:bg-emerald-700 transition-colors"
            >
              أطباء أسنان مدينة نصر
            </Link>
            <Link
              href="/cairo/new-cairo/interior-design"
              className="rounded-lg bg-emerald-800/80 px-3 py-1.5 text-xs font-semibold text-white border border-emerald-600/50 hover:bg-emerald-700 transition-colors"
            >
              ديكور وتشطيبات التجمع الخامس
            </Link>
            <Link
              href="/giza/sheikh-zayed/car-repair"
              className="rounded-lg bg-emerald-800/80 px-3 py-1.5 text-xs font-semibold text-white border border-emerald-600/50 hover:bg-emerald-700 transition-colors"
            >
              صيانة سيارات الشيخ زايد
            </Link>
            <Link
              href="/cairo/maadi/lawyers"
              className="rounded-lg bg-emerald-800/80 px-3 py-1.5 text-xs font-semibold text-white border border-emerald-600/50 hover:bg-emerald-700 transition-colors"
            >
              مكاتب محامين المعادي
            </Link>
          </div>
        </div>
      </section>

      {/* 2. استكشاف الأقسام والتصنيفات */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">أبرز الأنشطة والتخصصات</h2>
            <p className="text-xs text-gray-500 mt-1">اختر التخصص لاستعراض الأنشطة المعتمدة في محافظتك</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {allCategories.map((cat) => {
            const IconComponent = iconMap[cat.slug] || Briefcase;
            return (
              <Link
                key={cat.id}
                href={`/cairo/${cat.slug}`}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {cat.nameAr}
                </h3>
                <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-0.5">
                  استكشف الدليل <ChevronLeft className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. استكشاف الأحياء والمحافظات المصرية (المحرك البرمجي) */}
      <section className="bg-white py-14 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">تصفح حسب المحافظة والحي</h2>
            <p className="text-xs text-gray-500 mt-1">
              تغطية شاملة للمحافظات والمدن العمرانية الجديدة في جمهورية مصر العربية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* القاهرة */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ق
                </div>
                <h3 className="text-lg font-bold text-gray-900">محافظة القاهرة</h3>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/cairo/nasr-city/dentists"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>أطباء أسنان في مدينة نصر</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cairo/new-cairo/interior-design"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>ديكور وتشطيبات في التجمع الخامس</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cairo/maadi/lawyers"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>مكاتب محاماة في المعادي</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cairo/heliopolis/dentists"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>عيادات أسنان في مصر الجديدة</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* الجيزة */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ج
                </div>
                <h3 className="text-lg font-bold text-gray-900">محافظة الجيزة</h3>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/giza/sheikh-zayed/car-repair"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>صيانة سيارات في الشيخ زايد</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/giza/6th-of-october/interior-design"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>تشطيبات بالسادس من أكتوبر</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/giza/dokki/dentists"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>أطباء أسنان في الدقي والمهندسين</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* الإسكندرية */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  س
                </div>
                <h3 className="text-lg font-bold text-gray-900">عروس البحر (الإسكندرية)</h3>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/alexandria/smouha/dentists"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>أطباء أسنان في سموحة</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/alexandria/interior-design"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>ديكور وتشطيبات بالإسكندرية</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/alexandria/car-repair"
                    className="flex items-center justify-between text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <span>مراكز خدمة وصيانة سيارات</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. نماذج من الأنشطة المعتمدة في مصر */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">أنشطة وخدمات مميزة مختارة</h2>
            <p className="text-xs text-gray-500 mt-1">تواصل مباشرة عبر واتساب مع الأنشطة الأعلى تقييماً</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topBusinesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      </section>

      {/* 5. دعوة لأصحاب الأعمال (Callout Banner) */}
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-800 p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4" />
              خدمة توثيق الأنشطة المحلية
            </span>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">
              هل تمتلك نشاطاً تجارياً أو عيادة في مصر؟
            </h3>
            <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
              سجل نشاطك الآن في دليل مصر واحصل على استفسارات العملاء المباشرة على واتساب وهاتفك بدون عمولات أو وسطاء.
            </p>
          </div>

          <a
            href="https://wa.me/201007718787?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D9%88%D8%AB%D9%8A%D9%82%20%D9%88%D8%A5%D8%B6%D8%A7%D9%81%D8%A9%20%D9%86%D8%B4%D8%A7%D8%B7%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%20%D9%81%D9%8A%20%D8%AF%D9%84%D9%8A%D9%84%20%D9%85%D8%B1"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-emerald-900 shadow-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
          >
            طلب توثيق النشاط عبر واتساب &larr;
          </a>
        </div>
      </section>
    </main>
  );
}

