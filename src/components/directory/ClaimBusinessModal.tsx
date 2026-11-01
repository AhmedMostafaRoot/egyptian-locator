"use client";

import { useState } from "react";
import { X, ShieldCheck, Sparkles, CheckCircle, PhoneCall } from "lucide-react";

interface ClaimBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number | null;
  businessName: string;
}

export function ClaimBusinessModal({
  isOpen,
  onClose,
  businessId,
  businessName,
}: ClaimBusinessModalProps) {
  const [claimantName, setClaimantName] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [nationalIdOrCr, setNationalIdOrCr] = useState("");
  const [requestedTier, setRequestedTier] = useState<"claim_ownership" | "pro" | "elite">(
    "claim_ownership"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !businessId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // التحقق من صحة رقم الموبايل المصري
    const cleanPhone = claimantPhone.trim().replace(/\s+/g, "");
    const egyptRegex = /^01[0125][0-9]{8}$/;
    if (!egyptRegex.test(cleanPhone)) {
      setErrorMsg("يرجى إدخال رقم محمول مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 مكون من 11 رقماً.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/claim-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          claimantName,
          claimantPhone: cleanPhone,
          nationalIdOrCr,
          requestedTier,
        }),
      });

      if (!res.ok) {
        throw new Error("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResetAndClose() {
    setIsSubmitted(false);
    setClaimantName("");
    setClaimantPhone("");
    setNationalIdOrCr("");
    setErrorMsg("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl relative text-right">
        <button
          onClick={handleResetAndClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900">تم استلام طلب التوثيق بنجاح!</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              شكراً لك. سيقوم مسؤول التحقق في دليل مصر بمراجعة البيانات والتواصل معك هاتفياً أو عبر واتساب على الرقم ({claimantPhone}) في أسرع وقت.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-2 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              تم، العودة إلى الدليل
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                خدمة أصحاب الأعمال في مصر
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-snug">
                توثيق وترقية: {businessName}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                احصل على شارة التحقق الرسمية أو ارتقِ بنشاطك ليتصدر نتائج البحث في منطقتك.
              </p>
            </div>

            {/* باقات التوثيق والترقية */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRequestedTier("claim_ownership")}
                className={`p-3 rounded-xl border text-right transition-all ${
                  requestedTier === "claim_ownership"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-1 text-emerald-700 mb-1 font-extrabold">
                  <ShieldCheck className="w-4 h-4" />
                  توثيق النشاط (مجاناً)
                </div>
                إثبات ملكية + شارة معتمدة
              </button>

              <button
                type="button"
                onClick={() => setRequestedTier("elite")}
                className={`p-3 rounded-xl border text-right transition-all ${
                  requestedTier === "elite"
                    ? "border-amber-500 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-1 text-amber-600 mb-1 font-extrabold">
                  <Sparkles className="w-4 h-4" />
                  ترقية مميزة (Elite)
                </div>
                الظهور في الصدارة + إبراز ذهبي
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الاسم بالكامل والصفة الرسمية *
              </label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="مثال: د. محمد سامي (المدير الطبي / صاحب النشاط)"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                رقم الهاتف المحمول المصري (للتواصل والتحقق) *
              </label>
              <input
                type="tel"
                required
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                placeholder="01007718787"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-left font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                يقبل شبكات: فودافون (010)، أورنج (012)، إتصالات (011)، وي (015)
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                رقم السجل التجاري أو البطاقة الضريبية (اختياري لتسريع التوثيق)
              </label>
              <input
                type="text"
                value={nationalIdOrCr}
                onChange={(e) => setNationalIdOrCr(e.target.value)}
                placeholder="مثال: س.ت 123456 / مكتب استثمار القاهرة"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "جاري المعالجة..." : "إرسال طلب التوثيق الآن"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

