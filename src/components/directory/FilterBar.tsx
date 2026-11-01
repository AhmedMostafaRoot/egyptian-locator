"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, Star, SlidersHorizontal, MapPin } from "lucide-react";

interface DistrictOption {
  districtAr: string;
  districtSlug: string;
}

interface FilterBarProps {
  districts?: DistrictOption[];
  currentDistrict?: string;
  totalResults: number;
}

export function FilterBar({ districts, currentDistrict, totalResults }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMinRating = searchParams.get("minRating") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const selectedDistrict = searchParams.get("district") || "";

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-gray-200/80 shadow-sm">
      {/* إجمالي النتائج والمنطقة */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold">
          {totalResults}
        </span>
        <span>
          نشاط تجاري مسجل
          {currentDistrict ? ` في ${currentDistrict}` : ""}
        </span>
      </div>

      {/* عناصر التصفية والفرز */}
      <div className="flex flex-wrap items-center gap-3">
        {/* فلترة الحي (إذا كانت الصفحة على مستوى المحافظة الكاملة) */}
        {districts && districts.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => updateQuery("district", e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">كل الأحياء والمناطق</option>
              {districts.map((d) => (
                <option key={d.districtSlug} value={d.districtSlug}>
                  {d.districtAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* فلترة التقييم */}
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
          <select
            value={currentMinRating}
            onChange={(e) => updateQuery("minRating", e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">جميع التقييمات</option>
            <option value="4.5">★ 4.5 فما فوق (ممتاز)</option>
            <option value="4.0">★ 4.0 فما فوق (جيد جداً)</option>
            <option value="3.5">★ 3.5 فما فوق</option>
          </select>
        </div>

        {/* خيارات الترتيب */}
        <div className="flex items-center gap-1.5 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={currentSort}
            onChange={(e) => updateQuery("sort", e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="featured">الأنشطة المميزة أولاً</option>
            <option value="rating">الأعلى تقييماً</option>
            <option value="reviews">الأكثر تقييماً وتفاعلاً</option>
          </select>
        </div>
      </div>
    </div>
  );
}

