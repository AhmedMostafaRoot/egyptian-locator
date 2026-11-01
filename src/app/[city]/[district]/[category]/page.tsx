import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getBusinessesByDistrictAndCategory,
  getBusinessesByCityAndCategory,
} from "@/db/queries/businesses";
import { BusinessGrid } from "@/components/directory/BusinessGrid";
import { FilterBar } from "@/components/directory/FilterBar";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ItemListJsonLd } from "@/components/seo/ItemListJsonLd";
import { ChevronLeft, MapPin, Sparkles, Building, PhoneCall } from "lucide-react";

interface PageProps {
  params: {
    city: string;
    district: string;
    category: string;
  };
  searchParams: {
    district?: string;
    minRating?: string;
    sort?: "rating" | "reviews" | "featured";
  };
}

// 1. توليد الميتاداتا الديناميكية باللغة العربية مع مراعاة السيو المحلي المصري
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, district, category } = params;
  const currentYear = new Date().getFullYear();

  // في حال كان الطلب على مستوى المحافظة كاملة (district = all)
  if (district === "all") {
    const data = await getBusinessesByCityAndCategory(city, category);
    if (!data) return {};

    const { category: cat, cityAr } = data;
    const title = `دليل ${cat.nameAr} في ${cityAr} (${currentYear}) - أرقام وعناوين الأنشطة المعتمدة`;
    const description = `دليل شامل ومحدث لـ ${cat.nameAr} في محافظة ${cityAr}. تصفح أرقام التليفونات، مواقع الفروع، وتقييمات العملاء مع التواصل الفوري المباشر عبر واتساب.`;
    const canonicalUrl = `https://daleel-masr.com/${city}/${category}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        locale: "ar_EG",
        type: "website",
        url: canonicalUrl,
      },
    };
  }

  // في حال كان الطلب على مستوى الحي المحدد (Hyper-local SEO)
  const data = await getBusinessesByDistrictAndCategory(city, district, category);
  if (!data) return {};

  const { category: cat, location } = data;
  const title = `أفضل ${cat.nameAr} في ${location.districtAr}، ${location.cityAr} (${currentYear}) - أرقام وتواصل واتساب`;
  const description = `قائمة بأفضل ${cat.nameAr} في منطقة ${location.districtAr} بـ ${location.cityAr}. تقييمات حقيقية، أرقام هواتف، إمكانية حجز وتواصل فوري على واتساب دون وسيط.`;
  const canonicalUrl = `https://daleel-masr.com/${city}/${district}/${category}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      locale: "ar_EG",
      type: "website",
      url: canonicalUrl,
    },
  };
}

// 2. منطق الصفحة وعرض المكونات
export default async function ProgrammaticDistrictCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { city, district, category } = params;
  const currentYear = new Date().getFullYear();

  // معالجة مستوى المحافظة (district = all)
  if (district === "all") {
    const data = await getBusinessesByCityAndCategory(city, category, {
      districtSlug: searchParams.district,
      minRating: searchParams.minRating ? parseFloat(searchParams.minRating) : undefined,
      sort: searchParams.sort,
    });

    if (!data) notFound();

    const { category: cat, cityAr, locations, businesses } = data;

    const breadcrumbs = [
      { name: "الرئيسية", url: "https://daleel-masr.com" },
      {
        name: `${cat.nameAr} في ${cityAr}`,
        url: `https://daleel-masr.com/${city}/${category}`,
      },
    ];

    const districtOptions = locations.map((l) => ({
      districtAr: l.districtAr,
      districtSlug: l.districtSlug,
    }));

    const itemList = businesses.map((b) => ({
      name: b.nameAr,
      url: `https://daleel-masr.com/b/${b.slug}`,
      description: b.description,
    }));

    return (
      <main className="container mx-auto px-4 py-6 md:py-10">
        <BreadcrumbJsonLd items={breadcrumbs} />
        <ItemListJsonLd items={itemList} />

        {/* مسار التنقل البصري */}
        <nav aria-label="مسار التصفح" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-bold text-gray-900">
            {cat.nameAr} في {cityAr}
          </span>
        </nav>

        {/* الرأس التعريفي للصفحة */}
        <header className="mb-8 rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-3 border border-emerald-200/50">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            محافظة {cityAr} • مصر
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            دليل {cat.nameAr} في {cityAr} ({currentYear})
          </h1>

          <p className="mt-3 text-sm text-gray-600 max-w-3xl leading-relaxed">
            استكشف قائمة بالأنشطة والشركات المتخصصة في {cat.nameAr} عبر أحياء {cityAr}. يمكنك تصفية النتائج بحسب الحي المطلوب أو التقييم والتواصل الفوري عبر واتساب.
          </p>

          {/* روابط أحياء المحافظة السريعة للزحف والسيو */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 block mb-2">
              تصفح {cat.nameAr} حسب الحي في {cityAr}:
            </span>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/${city}/${loc.districtSlug}/${category}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent transition-all"
                >
                  <span>{loc.districtAr}</span>
                  <ChevronLeft className="w-3 h-3 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* شريط الفلترة */}
        <FilterBar districts={districtOptions} totalResults={businesses.length} />

        {/* شبكة الأعمال المتجاوبة */}
        <BusinessGrid businesses={businesses} />
      </main>
    );
  }

  // معالجة مستوى الحي المحدد /[city]/[district]/[category]
  const data = await getBusinessesByDistrictAndCategory(city, district, category, {
    minRating: searchParams.minRating ? parseFloat(searchParams.minRating) : undefined,
    sort: searchParams.sort,
  });

  if (!data) notFound();

  const { category: cat, location, businesses } = data;

  const breadcrumbs = [
    { name: "الرئيسية", url: "https://daleel-masr.com" },
    { name: location.cityAr, url: `https://daleel-masr.com/${city}/${category}` },
    {
      name: `${cat.nameAr} في ${location.districtAr}`,
      url: `https://daleel-masr.com/${city}/${district}/${category}`,
    },
  ];

  const itemList = businesses.map((b) => ({
    name: b.nameAr,
    url: `https://daleel-masr.com/b/${b.slug}`,
    description: b.description,
  }));

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      {/* Schema.org Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd items={itemList} />

      {/* مسار التنقل البصري */}
      <nav aria-label="مسار التصفح" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <Link href={`/${city}/${category}`} className="hover:text-emerald-700 transition-colors">
          {cat.nameAr} في {location.cityAr}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-gray-900">{location.districtAr}</span>
      </nav>

      {/* الرأس التعريفي للصفحة */}
      <header className="mb-8 rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-3 border border-emerald-200/50">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          {location.districtAr} • {location.cityAr} • جمهورية مصر العربية
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight">
          دليل {cat.nameAr} في {location.districtAr}، {location.cityAr} ({currentYear})
        </h1>

        <p className="mt-3 text-sm text-gray-600 max-w-3xl leading-relaxed">
          دليل شامل للأرقام والعناوين التفصيلية وتقييمات العملاء لـ {cat.nameAr} في منطقة {location.districtAr}.
          يمكنك التواصل المباشر مع النشاط عبر واتساب أو الاتصال الهاتفي لطلب الخدمة أو حجز المواعيد.
        </p>
      </header>

      {/* شريط الفلترة والفرز */}
      <FilterBar currentDistrict={location.districtAr} totalResults={businesses.length} />

      {/* شبكة الأعمال المتجاوبة بنسبة 100% */}
      <BusinessGrid businesses={businesses} />
    </main>
  );
}

