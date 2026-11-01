"use client";

import Link from "next/link";
import { CheckCircle2, Star, Phone, MessageSquare, ShieldCheck, Crown, MapPin, Clock } from "lucide-react";
import { buildWhatsAppLink, formatEgyptianPhone } from "@/lib/utils";

export interface BusinessCardData {
  id: number;
  nameAr: string;
  slug: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  verifiedStatus: boolean | null;
  featuredTier: "free" | "pro" | "elite" | null;
  description?: string | null;
  workingHoursAr?: string | null;
  imageUrl?: string | null;
  location?: {
    cityAr: string;
    citySlug: string;
    districtAr: string;
    districtSlug: string;
  };
}

interface BusinessCardProps {
  business: BusinessCardData;
  onClaimClick?: (businessId: number, businessName: string) => void;
}

export function BusinessCard({ business, onClaimClick }: BusinessCardProps) {
  const isElite = business.featuredTier === "elite";
  const isPro = business.featuredTier === "pro";
  const whatsappUrl = buildWhatsAppLink(business.whatsappNumber, business.nameAr);

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl bg-white p-5 transition-all duration-200 border hover:-translate-y-0.5 hover:shadow-xl ${
        isElite
          ? "border-amber-400/80 ring-2 ring-amber-400/20 shadow-md bg-gradient-to-b from-amber-50/20 to-white"
          : isPro
          ? "border-emerald-200 ring-1 ring-emerald-100 shadow-sm"
          : "border-gray-200/80 shadow-sm"
      }`}
    >
      <div>
        {/* شريط الشارات والتقييم */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isElite && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                نشاط مميز (Elite)
              </span>
            )}
            {business.verifiedStatus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                موثق رسمي
              </span>
            )}
          </div>

          {/* التقييم بالنجوم */}
          <div className="flex items-center gap-1 rounded-lg bg-amber-50/80 px-2 py-1 border border-amber-200 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-900">
              {business.rating && business.rating > 0 ? business.rating.toFixed(1) : "جديد"}
            </span>
            {business.reviewCount && business.reviewCount > 0 ? (
              <span className="text-[10px] text-gray-500">({business.reviewCount})</span>
            ) : null}
          </div>
        </div>

        {/* عنوان النشاط التجاري */}
        <Link href={`/b/${business.slug}`} className="block group-hover:text-emerald-700 transition-colors">
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
            {business.nameAr}
          </h3>
        </Link>

        {/* العنوان والمنطقة */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed">{business.address}</p>
        </div>

        {/* مواعيد العمل إذا توفرت */}
        {business.workingHoursAr && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{business.workingHoursAr}</span>
          </div>
        )}

        {/* النبذة الوصفية */}
        {business.description && (
          <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        )}
      </div>

      {/* أزرار التواصل السريع والإجراءات */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* زر واتساب المباشر */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            واتساب مباشر
          </a>

          {/* زر الاتصال الهاتفي */}
          <a
            href={`tel:${business.phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-800 transition-all hover:bg-gray-200 active:scale-95"
          >
            <Phone className="w-4 h-4 text-gray-600" />
            {formatEgyptianPhone(business.phone)}
          </a>
        </div>

        {/* زر التوثيق والترقية للنشاط */}
        {onClaimClick && (
          <button
            type="button"
            onClick={() => onClaimClick(business.id, business.nameAr)}
            className="text-[11px] text-gray-400 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1 py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            هل أنت صاحب هذا النشاط؟ وثّقه أو رقّه مجاناً
          </button>
        )}
      </div>
    </article>
  );
}

