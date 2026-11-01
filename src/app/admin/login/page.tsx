"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // توجيه ناجح للوحة التحكم
        window.location.href = "/admin";
      } else {
        setErrorMessage(data.error || "رمز المرور غير صحيح");
      }
    } catch (err: any) {
      setErrorMessage("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative text-right">
        {/* أيقونة القفل والشعار */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">تسجيل دخول المشرف</h1>
          <p className="text-xs text-slate-400 mt-1">
            أدخل رمز الأمان المعتمد (Admin Passkey) للوصول إلى لوحة تحكم دليل مصر المحلي.
          </p>
        </div>

        {/* رسالة الخطأ */}
        {errorMessage && (
          <div className="mb-5 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-xs font-semibold text-red-300">
            {errorMessage}
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رمز المرور السري (Passkey)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="أدخل الرمز السري..."
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pl-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "إخفاء الرمز" : "إظهار الرمز"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              هذه المنطقة مخصصة لإدارة الدليل ومحمية بأنظمة التحقق المشفرة.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            العودة للدليل الرئيسي
          </Link>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            محمي بجلسة مشفرة
          </span>
        </div>
      </div>
    </div>
  );
}

