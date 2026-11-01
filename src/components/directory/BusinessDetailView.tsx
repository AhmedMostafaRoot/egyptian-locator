"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";
import { buildWhatsAppLink, formatEgyptianPhone } from "@/lib/utils";
import { ClaimBusinessModal } from "./ClaimBusinessModal";

interface BusinessDetailViewProps {
  business: {
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
    category: {
      id: number;
      nameAr: string;
      slug: string;
    };
    location: {
      id: number;
      cityAr: string;
      citySlug: string;
      districtAr: string;
      districtSlug: string;
    };
  };
}

export function BusinessDetailView({ business }: BusinessDetailViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const whatsappUrl = buildWhatsAppLink(business.whatsappNumber, business.nameAr);
  const isElite = business.featuredTier === "elite";

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: business.nameAr,
        text: `تواصل مع ${business.nameAr} في ${business.location.districtAr} عبر دليل مصر`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* التفاصيل الرئيسية (العمود العريض) */}
        <div className="lg:col-span-2 space-y-6">
          <article className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-sm relative overflow-hidden">
            {/* شارة التميز الخلفية اللطيفة */}
            {isElite && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black px-4 py-1 rounded-br-2xl shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                نشاط مميز في الصدارة
              </div>
            )}

            {/* تصنيف وشارات النشاط */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/60">
                  {business.category.nameAr}
                </span>

                {business.verifiedStatus && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100/80 px-2.5 py-1 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    موثق ومعتمد رسمياً
                  </span>
                )}
              </div>

              {/* التقييم */}
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50/90 px-3 py-1.5 border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-amber-950">
                  {business.rating && business.rating > 0 ? business.rating.toFixed(1) : "جديد"}
                </span>
                {business.reviewCount && business.reviewCount > 0 ? (
                  <span className="text-xs text-gray-500">({business.reviewCount} تقييم حقيقي)</span>
                ) : null}
              </div>
            </div>

            {/* الاسم الكامل للنشاط التجاري */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              {business.nameAr}
            </h1>

            {/* العنوان ومواعيد العمل */}
            <div className="mt-5 space-y-3 text-sm text-gray-600 border-t border-b border-gray-100 py-4 my-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-gray-900">{business.address}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    ({business.location.districtAr}، محافظة {business.location.cityAr})
                  </span>
                </div>
              </div>

              {business.workingHoursAr && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-gray-800">مواعيد العمل: {business.workingHoursAr}</span>
                </div>
              )}
            </div>

            {/* النبذة وشرح الخدمات */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">نبذة عن النشاط والخدمات:</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {business.description || "يقدم هذا النشاط التجاري باقة من أفضل الخدمات في المنطقة وفق أعلى معايير الجودة ورضا العملاء."}
              </p>
            </div>

            {/* زر المشاركة */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "تم نسخ الرابط!" : "مشاركة بطاقة النشاط"}</span>
              </button>

              <span className="text-[11px] text-gray-400">
                رقم القيد في الدليل: #{business.id}
              </span>
            </div>
          </article>

          {/* صندوق الترقية المدفوعة والتوثيق المخصص لصاحب النشاط (Callout Interactive Box) */}
          <section className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-md">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  مساحة مخصصة للمالك والإدارة
                </span>
                <h3 className="text-lg sm:text-xl font-black leading-snug">
                  هل أنت صاحب هذا النشاط أو المسؤول عنه؟
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  وثّق ملكية نشاطك مجاناً أو اشترك في **الظهور المميز (Featured Placement)** لتتصدر نتائج البحث في {business.location.districtAr} ومضاعفة محادثات واتساب.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-black text-amber-950 shadow-md hover:bg-amber-300 active:scale-95 transition-all shrink-0"
              >
                <Crown className="w-4 h-4" />
                طلب ترقية أو توثيق النشاط
              </button>
            </div>
          </section>
        </div>

        {/* الشريط الجانبي للتواصل السريع والحجز المباشر (Sidebar) */}
        <aside className="space-y-6">
          <div className="sticky top-24 rounded-3xl bg-white p-6 border border-gray-200/80 shadow-md space-y-5">
            <div>
              <h3 className="text-lg font-black text-gray-900">التواصل والحجز الفوري</h3>
              <p className="text-xs text-gray-500 mt-1">
                تواصل مباشر دون وسطاء أو أرقام وسيطة.
              </p>
            </div>

            {/* زر واتساب السريع والبارز */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              محادثة فورية عبر واتساب
            </a>

            {/* زر الاتصال الهاتفي المحلي */}
            <a
              href={`tel:${business.phone}`}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              اتصال: {formatEgyptianPhone(business.phone)}
            </a>

            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>رقم هاتف محلي مصري معتمد ومفحوص</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>رد واستفسار سريع عبر تطبيق واتساب</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>لا توجد عمولات أو رسوم حجز إضافية</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* شريط الإجراءات السفلية العائم للهواتف الذكية (Mobile Sticky Bottom Bar) لضمان تجربة مستخدم 100% متجاوبة */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden shadow-2xl flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          واتساب سريع
        </a>

        <a
          href={`tel:${business.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-900 border border-slate-200 active:scale-95"
        >
          <Phone className="w-4 h-4" />
          اتصال هاتف
        </a>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 active:scale-95"
          aria-label="توثيق النشاط"
        >
          <Crown className="w-4 h-4" />
        </button>
      </div>

      {/* المودال التفاعلي لتوثيق أو ترقية النشاط التجاري */}
      <ClaimBusinessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        businessId={business.id}
        businessName={business.nameAr}
      />
    </>
  );
}

