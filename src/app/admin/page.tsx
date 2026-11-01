"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  RotateCw,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Crown,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  LogOut,
  PlusCircle,
  KeyRound,
  Check,
  X,
  MapPin,
  Building,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Sparkles,
  Trash2,
  Info,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  unverifiedBusinesses: number;
  totalCategories: number;
  totalLocations: number;
  pendingClaimsCount: number;
  scrapedQueueCount: number;
}

interface ClaimRecord {
  id: number;
  businessId: number;
  businessName: string | null;
  claimantName: string;
  claimantPhone: string;
  requestedTier: string;
  status: string;
  createdAt: string | null;
}

interface StagedBusiness {
  nameAr: string;
  slug: string;
  categorySlug: string;
  categoryNameAr: string;
  citySlug: string;
  districtSlug: string;
  districtNameAr: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  rating?: number;
  featuredTier?: "free" | "pro" | "elite";
}

interface VerificationLogRecord {
  businessId: number;
  businessName: string;
  phone: string;
  whatsappNumber: string;
  isActive: boolean;
  statusReason: string;
  timestamp: string;
}

interface BusinessRow {
  id: number;
  nameAr: string;
  slug: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  rating: number | null;
  verifiedStatus: boolean | null;
  featuredTier: string | null;
  categoryName: string;
  cityAr: string;
  districtAr: string;
  createdAt: string | null;
}

interface OptionItem {
  id: number;
  nameAr?: string;
  cityAr?: string;
  districtAr?: string;
  citySlug?: string;
  districtSlug?: string;
  slug?: string;
}

// قائمة محافظات مصر الـ 27 بالكامل
const EGYPT_GOVERNORATES = [
  { slug: "all", name: "🇪🇬 كافة محافظات مصر الـ 27 (استخراج شامل)" },
  { slug: "cairo", name: "القاهرة (العاصمة، التجمع، نصر، المعادي)" },
  { slug: "giza", name: "الجيزة (الشيخ زايد، 6 أكتوبر، الدقي)" },
  { slug: "alexandria", name: "الإسكندرية (سموحة، لوران، ميامي)" },
  { slug: "dakahlia", name: "الدقهلية (المنصورة، ميت غمر)" },
  { slug: "sharqia", name: "الشرقية (الزقازيق، العاشر من رمضان)" },
  { slug: "gharbia", name: "الغربية (طنطا، المحلة الكبرى)" },
  { slug: "qalyubia", name: "القليوبية (بنها، شبرا الخيمة)" },
  { slug: "monufia", name: "المنوفية (شبين الكوم، السادات)" },
  { slug: "beheira", name: "البحيرة (دمنهور، كفر الدوار)" },
  { slug: "damietta", name: "دمياط (مدينة دمياط، دمياط الجديدة)" },
  { slug: "kafr-el-sheikh", name: "كفر الشيخ (كفر الشيخ، دسوق)" },
  { slug: "port-said", name: "بورسعيد (حي الشرق، العرب، الزهور)" },
  { slug: "ismailia", name: "الإسماعيلية (حي أول، فايد)" },
  { slug: "suez", name: "السويس (حي السويس، الأربعين)" },
  { slug: "red-sea", name: "البحر الأحمر (الغردقة، الجونة)" },
  { slug: "south-sinai", name: "جنوب سيناء (شرم الشيخ، دهب)" },
  { slug: "north-sinai", name: "شمال سيناء (العريش، بئر العبد)" },
  { slug: "matrouh", name: "مطروح (مرسى مطروح، الساحل الشمالي)" },
  { slug: "fayoum", name: "الفيوم (مدينة الفيوم، سنورس)" },
  { slug: "beni-suef", name: "بني سويف (بني سويف، الواسطى)" },
  { slug: "minya", name: "المنيا (المنيا، مغاغة)" },
  { slug: "asyut", name: "أسيوط (أسيوط، ديروط)" },
  { slug: "sohag", name: "سوهاج (سوهاج، طهطا)" },
  { slug: "qena", name: "قنا (قنا، نجع حمادي)" },
  { slug: "luxor", name: "الأقصر (مدينة الأقصر، إسنا)" },
  { slug: "aswan", name: "أسوان (أسوان، إدفو)" },
  { slug: "new-valley", name: "الوادي الجديد (الخارجة، الداخلة)" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [stagedBusinesses, setStagedBusinesses] = useState<StagedBusiness[]>([]);
  const [verifications, setVerifications] = useState<VerificationLogRecord[]>([]);
  const [categoriesList, setCategoriesList] = useState<OptionItem[]>([]);
  const [locationsList, setLocationsList] = useState<OptionItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // حالة استخراج المحافظات
  const [selectedGovernorate, setSelectedGovernorate] = useState("all");

  // حالة الترقيم والبحث في الأنشطة
  const [businessItems, setBusinessItems] = useState<BusinessRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 8;

  // حالة تشغيل الأوامر
  const [activeRunningAction, setActiveRunningAction] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    "جاهز لاستقبال الأوامر. اختر أي محافظة أو اضغط على أي زر أدناه لمتابعة المخرجات الحية هنا."
  );
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);

  // مودال إضافة نشاط جديد
  const [isAddBizModalOpen, setIsAddBizModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizWhatsapp, setNewBizWhatsapp] = useState("");
  const [newBizAddress, setNewBizAddress] = useState("");
  const [newBizCatId, setNewBizCatId] = useState("");
  const [newBizLocId, setNewBizLocId] = useState("");
  const [newBizTier, setNewBizTier] = useState<"free" | "pro" | "elite">("free");
  const [newBizDesc, setNewBizDesc] = useState("");
  const [isSubmittingBiz, setIsSubmittingBiz] = useState(false);
  const [addBizMsg, setAddBizMsg] = useState("");

  // مودال تغيير رمز المرور
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // حالة معالجة الطلبات
  const [processingClaimId, setProcessingClaimId] = useState<number | null>(null);
  const [processingStagedSlug, setProcessingStagedSlug] = useState<string | null>(null);

  async function loadDashboardData(page = currentPage, query = searchQuery) {
    setIsLoadingStats(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (query) params.set("search", query);

      const res = await fetch(`/api/admin/commands?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setClaims(data.recentClaims || []);
        setStagedBusinesses(data.stagedBusinesses || []);
        setVerifications(data.recentVerifications || []);
        setCategoriesList(data.categories || []);
        setLocationsList(data.locations || []);

        if (data.paginatedBusinesses) {
          setBusinessItems(data.paginatedBusinesses.items || []);
          setCurrentPage(data.paginatedBusinesses.page || 1);
          setTotalPages(data.paginatedBusinesses.totalPages || 1);
          setTotalFiltered(data.paginatedBusinesses.totalFiltered || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }

  useEffect(() => {
    loadDashboardData(1, "");
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    loadDashboardData(1, searchQuery);
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      loadDashboardData(newPage, searchQuery);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  }

  // تشغيل استخراج محافظة معينة
  async function handleScrapeGovernorate(slugToScrape: string) {
    const govObj = EGYPT_GOVERNORATES.find((g) => g.slug === slugToScrape);
    const govName = govObj ? govObj.name : slugToScrape;

    if (activeRunningAction) return;
    setActiveRunningAction(`scrape_${slugToScrape}`);
    setConsoleOutput(
      `🌐 [Chromium Engine] جاري تشغيل المتصفح الخفي لاستخراج بيانات: [${govName}]...\nيرجى الانتظار، جاري زحف الأنشطة وربط أرقام واتساب...`
    );
    setLastActionTime(null);

    try {
      const res = await fetch("/api/admin/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: slugToScrape === "all" ? "scrape_all" : "scrape_governorate",
          citySlug: slugToScrape,
          governorateName: govName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsoleOutput(
          `✅ اكتمل استخراج بيانات [${govName}] بنجاح في (${(data.durationMs / 1000).toFixed(2)} ثانية):\n\n${data.output}`
        );
        setLastActionTime(data.durationMs);
        loadDashboardData(currentPage, searchQuery);
      } else {
        setConsoleOutput(`❌ حدث خطأ أثناء الاستخراج:\n\n${data.output || data.error || "خطأ غير معروف"}`);
      }
    } catch (err: any) {
      setConsoleOutput(`❌ فشل الاتصال بالخادم:\n${err.message}`);
    } finally {
      setActiveRunningAction(null);
    }
  }

  // تشغيل أوامر الصيانة الأخرى
  async function handleRunCommand(actionKey: string, actionLabel: string) {
    if (activeRunningAction) return;
    setActiveRunningAction(actionKey);
    setConsoleOutput(`🚀 جاري تشغيل: [${actionLabel}]...\nيرجى الانتظار...`);
    setLastActionTime(null);

    try {
      const res = await fetch("/api/admin/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsoleOutput(
          `✅ اكتملت المهمة بنجاح في (${(data.durationMs / 1000).toFixed(2)} ثانية):\n\n${data.output}`
        );
        setLastActionTime(data.durationMs);
        loadDashboardData(currentPage, searchQuery);
      } else {
        setConsoleOutput(
          `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${data.output || data.error || "خطأ غير معروف"}`
        );
      }
    } catch (err: any) {
      setConsoleOutput(`❌ فشل الاتصال بالخادم:\n${err.message}`);
    } finally {
      setActiveRunningAction(null);
    }
  }

  // إدارة واعتماد خطط وترقيات العملاء (Claims Approval)
  async function handleClaimAction(claimId: number, action: "approve" | "reject") {
    setProcessingClaimId(claimId);
    try {
      const res = await fetch("/api/admin/claims/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action }),
      });

      if (res.ok) {
        setConsoleOutput(
          action === "approve"
            ? `🎉 [إدارة طلبات الترقية] تمت الموافقة وتفعيل باقة العميل للطلب رقم #${claimId} وتحديث النشاط فوراً إلى مميز (Elite/Pro).`
            : `ℹ️ [إدارة طلبات الترقية] تم رفض الطلب رقم #${claimId}.`
        );
        loadDashboardData(currentPage, searchQuery);
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء معالجة الطلب: " + err.message);
    } finally {
      setProcessingClaimId(null);
    }
  }

  // إدارة واعتماد الأنشطة المستخرجة الجاهزة للدمج (Staged Businesses)
  async function handleStagedAction(action: "approve_single" | "reject_single" | "approve_all", slug?: string) {
    if (slug) setProcessingStagedSlug(slug);
    try {
      const res = await fetch("/api/admin/staged/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slug }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsoleOutput(`📥 [قائمة الدمج والمراجعة]: ${data.message}`);
        loadDashboardData(currentPage, searchQuery);
      } else {
        alert(data.error || "تعذر تنفيذ الإجراء");
      }
    } catch (err: any) {
      alert("خطأ أثناء معالجة النشاط المستخرج: " + err.message);
    } finally {
      setProcessingStagedSlug(null);
    }
  }

  // إضافة نشاط جديد يدوياً
  async function handleAddBusiness(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingBiz(true);
    setAddBizMsg("");

    try {
      const res = await fetch("/api/admin/businesses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: newBizName,
          phone: newBizPhone,
          whatsappNumber: newBizWhatsapp,
          address: newBizAddress,
          categoryId: newBizCatId,
          locationId: newBizLocId,
          featuredTier: newBizTier,
          description: newBizDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsoleOutput(`✅ [نشاط جديد] تم بنجاح إضافة "${newBizName}" إلى دليل مصر وقاعدة البيانات.`);
        setIsAddBizModalOpen(false);
        setNewBizName("");
        setNewBizPhone("");
        setNewBizWhatsapp("");
        setNewBizAddress("");
        setNewBizDesc("");
        loadDashboardData(1, "");
      } else {
        setAddBizMsg(data.error || "تعذر إضافة النشاط");
      }
    } catch (err: any) {
      setAddBizMsg(err.message || "خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmittingBiz(false);
    }
  }

  // تغيير رمز المرور السري
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (newPass !== confirmPass) {
      setPasswordError("رمز المرور الجديد وتأكيده غير متطابقين.");
      return;
    }

    if (newPass.length < 6) {
      setPasswordError("يجب ألا يقل الرمز الجديد عن 6 خانات.");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPasscode: currentPass,
          newPasscode: newPass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg("✅ تم تحديث وحفظ رمز المرور السري الجديد بنجاح!");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setCurrentPass("");
          setNewPass("");
          setConfirmPass("");
          setPasswordMsg("");
        }, 1500);
      } else {
        setPasswordError(data.error || "فشل تغيير رمز المرور");
      }
    } catch (err: any) {
      setPasswordError(err.message || "خطأ أثناء تحديث رمز المرور");
    } finally {
      setIsChangingPass(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* شريط الرأس للوحة التحكم */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black">
                <Cpu className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                لوحة تحكم إدارة دليل مصر البرمجي
              </h1>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة الأنشطة، استخراج بيانات الـ 27 محافظة مصرية، التحقق الآلي من واتساب، واعتماد ترقيات العملاء بنقرة زر واحدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddBizModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              إضافة مكان جديد
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-750 active:scale-95 transition-all"
              title="تغيير رمز المرور"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              تغيير الرمز
            </button>

            <button
              onClick={() => loadDashboardData(currentPage, searchQuery)}
              disabled={isLoadingStats}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingStats ? "animate-spin" : ""}`} />
              تحديث البيانات
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
            >
              معاينة الموقع الرئيسي
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-950/40 border border-red-800/60 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-900/60 active:scale-95 transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              خروج
            </button>
          </div>
        </header>

        {/* 1. مؤشرات الأداء الرئيسية (KPI Stats) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-800/80 p-5 border border-slate-700/60 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">إجمالي الأنشطة المسجلة</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats?.totalBusinesses ?? "..."}
              </span>
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="mt-2 text-[11px] text-slate-500 block">
              في {stats?.totalLocations ?? "..."} حي ومنطقة بمصر
            </span>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-5 border border-slate-700/60 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">أنشطة واتساب النشطة</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {stats?.verifiedBusinesses ?? "..."}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="mt-2 text-[11px] text-emerald-500/80 block">
              تم التحقق منها عبر Chromium
            </span>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-5 border border-slate-700/60 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">أنشطة مستخرجة جاهزة للدمج</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {stats?.scrapedQueueCount ?? stagedBusinesses.length}
              </span>
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            </div>
            <span className="mt-2 text-[11px] text-slate-500 block">
              قائمة المراجعة قبل النشر في الدليل
            </span>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-5 border border-slate-700/60 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">طلبات التوثيق والترقية</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">
                {stats?.pendingClaimsCount ?? claims.filter((c) => c.status === "pending").length}
              </span>
              <Crown className="w-5 h-5 text-sky-400" />
            </div>
            <span className="mt-2 text-[11px] text-slate-500 block">
              بانتظار موافقتك في الجدول أدناه
            </span>
          </div>
        </div>

        {/* 2. مركز استخراج البيانات لكافة محافظات مصر الـ 27 والأوامر */}
        <section className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                مركز استخراج البيانات لمحافظات مصر الـ 27 ومهام الـ NPM
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                اختر أي محافظة من محافظات الجمهورية الـ 27 لتشغيل متصفح Chromium واستخراج أنشطتها العامة وتنسيقها.
              </p>
            </div>
            {lastActionTime && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
                زمن التنفيذ: {(lastActionTime / 1000).toFixed(2)}s
              </span>
            )}
          </div>

          {/* محرك استخراج المحافظات الـ 27 */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-750 mb-5">
            <span className="text-xs font-bold text-emerald-400 block mb-2">
              🇪🇬 استخراج بيانات حسب المحافظة (27 محافظة مصرية):
            </span>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-full md:flex-1">
                <select
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov.slug} value={gov.slug} className="bg-slate-900 text-white">
                      {gov.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!!activeRunningAction}
                onClick={() => handleScrapeGovernorate(selectedGovernorate)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>تشغيل استخراج المحافظة المحددة</span>
              </button>
            </div>

            {/* روابط سريعة لأهم المحافظات */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 ml-1">اختصارات فورية:</span>
              {[
                { slug: "all", label: "🇪🇬 كافة المحافظات" },
                { slug: "cairo", label: "🏙️ القاهرة" },
                { slug: "giza", label: "🏛️ الجيزة" },
                { slug: "alexandria", label: "🌊 الإسكندرية" },
                { slug: "dakahlia", label: "🌾 الدقهلية (المنصورة)" },
                { slug: "sharqia", label: "🏭 الشرقية" },
                { slug: "red-sea", label: "🏖️ البحر الأحمر" },
              ].map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  disabled={!!activeRunningAction}
                  onClick={() => {
                    setSelectedGovernorate(item.slug);
                    handleScrapeGovernorate(item.slug);
                  }}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-colors disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* أزرار العمليات الإدارية الأخرى */}
          <div className="mb-5">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              ⚙️ مهام الصيانة والفحص الدوري:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={!!activeRunningAction}
                onClick={() =>
                  handleRunCommand("import", "استيراد البيانات المستخرجة إلى SQLite (Import)")
                }
                className="p-3 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-750 text-right transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400 mb-1">
                  <Database className="w-4 h-4" />
                  استيراد الملف المستخرج لقاعدة البيانات
                </div>
                <span className="text-[11px] text-slate-400 font-mono">npm run import:scraped</span>
              </button>

              <button
                type="button"
                disabled={!!activeRunningAction}
                onClick={() =>
                  handleRunCommand("verify", "فحص التحقق الآلي من أرقام واتساب (WhatsApp Cron)")
                }
                className="p-3 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-750 text-right transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-sky-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  فحص نشاط واتساب الدوري (Cron)
                </div>
                <span className="text-[11px] text-slate-400 font-mono">npm run cron:verify-whatsapp</span>
              </button>

              <button
                type="button"
                disabled={!!activeRunningAction}
                onClick={() =>
                  handleRunCommand("seed", "إعادة تهيئة وتغذية البيانات الأساسية (Reset Seed)")
                }
                className="p-3 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-750 text-right transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-400 mb-1">
                  <RotateCw className="w-4 h-4" />
                  إعادة تهيئة قاعدة البيانات (Reset Seed)
                </div>
                <span className="text-[11px] text-slate-400 font-mono">npm run db:seed</span>
              </button>
            </div>
          </div>

          {/* نافذة الأوامر الطرفية الحية (Live Console Box) */}
          <div className="rounded-2xl bg-black/90 p-4 border border-slate-800 font-mono text-xs text-emerald-400 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-500 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="mr-2">Terminal / Execution Logs</span>
              </div>
              {activeRunningAction && (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold animate-pulse">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  جاري المعالجة الآن...
                </span>
              )}
            </div>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
              {consoleOutput}
            </pre>
          </div>
        </section>

        {/* 3. قائمة مراجعة واعتماد الأنشطة المستخرجة (Scraped Staging Review Queue) */}
        <section className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  الأنشطة المستخرجة الجاهزة للمراجعة والدمج (Scraped Staging Queue)
                </h3>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                  {stagedBusinesses.length} أنشطة جاهزة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                الأنشطة المستخرجة عبر المتصفح توضع هنا أولاً كإجراء احترازي لتتمكن من مراجعتها قبل إدراجها في الدليل.
              </p>
            </div>

            {stagedBusinesses.length > 0 && (
              <button
                type="button"
                onClick={() => handleStagedAction("approve_all")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>دمج واعتماد كافة الأنشطة ({stagedBusinesses.length}) دفعة واحدة</span>
              </button>
            )}
          </div>

          {/* تنبيه توضيحي لماهية الأنشطة المستخرجة */}
          <div className="mb-4 rounded-xl bg-amber-950/30 border border-amber-800/50 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-300">كيف تعتمد الأنشطة المستخرجة؟</strong>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                يمكنك الضغط على زر <strong>"اعتماد وإدراج ✓"</strong> بجوار أي نشاط لنقله فوراً لقاعدة بيانات الدليل الحي، أو الضغط على زر <strong>"استبعاد ✗"</strong> لحذفه من قائمة الانتظار، أو النقر على الزر البرتقالي في الأعلى لاعتماد الجميع دفعة واحدة.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">اسم النشاط</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">المحافظة / المنطقة</th>
                  <th className="p-3">الهاتف والواتساب</th>
                  <th className="p-3">العنوان المستخرج</th>
                  <th className="p-3 text-center">إجراء الاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {stagedBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      ✨ قائمة الانتظار فارغة حالياً! كافة الأنشطة المستخرجة تم دمجها بالفعل في الدليل، أو يمكنك استخراج محافظة جديدة عبر الأزرار بالأعلى.
                    </td>
                  </tr>
                ) : (
                  stagedBusinesses.map((biz) => (
                    <tr key={biz.slug} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-white max-w-[200px] truncate">{biz.nameAr}</td>
                      <td className="p-3 text-slate-300">{biz.categoryNameAr}</td>
                      <td className="p-3 text-slate-400">{biz.districtNameAr} ({biz.citySlug})</td>
                      <td className="p-3 font-mono text-emerald-400">{biz.whatsappNumber}</td>
                      <td className="p-3 text-slate-400 text-[11px] max-w-[200px] truncate">{biz.address}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={processingStagedSlug === biz.slug}
                            onClick={() => handleStagedAction("approve_single", biz.slug)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                            title="اعتماد وإدراج في الدليل"
                          >
                            <Check className="w-3.5 h-3.5" />
                            اعتماد وإدراج
                          </button>
                          <button
                            type="button"
                            disabled={processingStagedSlug === biz.slug}
                            onClick={() => handleStagedAction("reject_single", biz.slug)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-950/60 border border-red-800/70 hover:bg-red-900 px-2 py-1.5 text-[11px] font-bold text-red-300 active:scale-95 disabled:opacity-50 transition-all"
                            title="حذف من قائمة الانتظار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            استبعاد
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. جدول طلبات التوثيق والترقية المدفوعة من الملاك (Customer Plan Approval) */}
        <section className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                طلبات توثيق وترقية الأنشطة التجارية (Customer Plan Approval)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                هنا تظهر طلبات أصحاب الأنشطة للحصول على الشارة المعتمدة أو الترقية لباقة النخبة (Elite). وافق لتفعيلها فوراً.
              </p>
            </div>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              {claims.length} طلبات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">اسم النشاط التجاري</th>
                  <th className="p-3">اسم المالك / الصفة</th>
                  <th className="p-3">رقم الهاتف المصري</th>
                  <th className="p-3">الباقة المطلوبة</th>
                  <th className="p-3">الحالة الحالية</th>
                  <th className="p-3 text-center">إجراء المشرف (Approve / Reject)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      لا توجد طلبات توثيق مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-white">{claim.businessName || `نشاط #${claim.businessId}`}</td>
                      <td className="p-3">{claim.claimantName}</td>
                      <td className="p-3 font-mono text-emerald-400">{claim.claimantPhone}</td>
                      <td className="p-3">
                        {claim.requestedTier === "elite" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                            ترقية مميزة (Elite 👑)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            توثيق ملكية (Pro)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {claim.status === "approved" ? (
                          <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            مُعتمد ومُفعل ✓
                          </span>
                        ) : claim.status === "rejected" ? (
                          <span className="inline-block rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                            مرفوض ✗
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30 animate-pulse">
                            قيد المراجعة
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {claim.status === "pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleClaimAction(claim.id, "approve")}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              قبول وتفعيل الباقة
                            </button>
                            <button
                              type="button"
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleClaimAction(claim.id, "reject")}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-950/60 border border-red-800/80 px-2.5 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-900 active:scale-95 disabled:opacity-50 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            تمت معالجة الطلب
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. جدول كافة الأنشطة المسجلة مع الترقيم والبحث (Paginated Businesses Table) */}
        <section className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                إدارة كافة الأنشطة المسجلة في الدليل الحي (Directory Businesses)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفح قاعدة بيانات الأنشطة مع دعم البحث والترقيم السفلي (Pagination).
              </p>
            </div>

            {/* شريط البحث في الأنشطة */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الهاتف، أو الحي..."
                  className="w-full rounded-xl bg-slate-850 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                بحث
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">اسم النشاط</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">المحافظة / الحي</th>
                  <th className="p-3">الهاتف والواتساب</th>
                  <th className="p-3">الترقية والتوثيق</th>
                  <th className="p-3">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {businessItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      لم يتم العثور على أنشطة مطابقة للبحث.
                    </td>
                  </tr>
                ) : (
                  businessItems.map((biz) => (
                    <tr key={biz.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{biz.id}</td>
                      <td className="p-3 font-bold text-white max-w-[200px] truncate">{biz.nameAr}</td>
                      <td className="p-3 text-slate-300">{biz.categoryName}</td>
                      <td className="p-3 text-slate-400">{biz.districtAr} ({biz.cityAr})</td>
                      <td className="p-3 font-mono text-emerald-400">{biz.whatsappNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {biz.featuredTier === "elite" && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                              Elite 👑
                            </span>
                          )}
                          {biz.featuredTier === "pro" && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                              Pro
                            </span>
                          )}
                          {biz.verifiedStatus ? (
                            <span className="text-emerald-400 text-[11px]" title="موثق">✓</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]" title="غير موثق">✗</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/b/${biz.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded bg-slate-700/60 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <span>عرض</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* أزرار الترقيم السفلية (Pagination Bar) */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>
                عرض {businessItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} إلى{" "}
                {Math.min(currentPage * pageSize, totalFiltered)} من أصل {totalFiltered} نشاط مسجل
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-850 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                السابق
              </button>

              {/* أرقام الصفحات */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <div key={pageNum} className="flex items-center gap-1">
                        {prev && pageNum - prev > 1 && <span className="px-1 text-slate-600">...</span>}
                        <button
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            pageNum === currentPage
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-850 border border-slate-700 text-slate-300 hover:bg-slate-750"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-850 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                التالي
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* 6. سجل نتائج التحقق الدوري من أرقام واتساب */}
        <section className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                سجل آخر فحص آلي لواتساب (WhatsApp Verification Logs)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                الأنشطة التي زارها Chromium وتحقق من استقبالها للمحادثات وتحديث حالتها في SQLite.
              </p>
            </div>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              {verifications.length} نتائج
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">النشاط</th>
                  <th className="p-3">رقم واتساب</th>
                  <th className="p-3">الحالة بعد الفحص</th>
                  <th className="p-3">التشخيص والسبب</th>
                  <th className="p-3">وقت الفحص</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      لم يتم تشغيل فحص التحقق بعد. اضغط على زر "فحص نشاط واتساب (Cron)" أعلاه للبدء.
                    </td>
                  </tr>
                ) : (
                  verifications.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-white">{v.businessName}</td>
                      <td className="p-3 font-mono text-slate-300">{v.whatsappNumber}</td>
                      <td className="p-3">
                        {v.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            نشط ومعتمد ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/30">
                            غير نشط / ملغي التوثيق
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{v.statusReason}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {v.timestamp?.slice(11, 19)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* مودال إضافة مكان جديد */}
      {isAddBizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-850 border border-slate-700 p-6 shadow-2xl">
            <button
              onClick={() => setIsAddBizModalOpen(false)}
              className="absolute left-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              إضافة نشاط تجاري جديد للدليل
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              أدخل بيانات المكان ليتم إدراجه فوراً في قاعدة البيانات وظهوره في صفحات السيو المبرمجة.
            </p>

            {addBizMsg && (
              <div className="mb-4 rounded-xl bg-red-950/60 border border-red-800 p-3 text-xs text-red-300">
                {addBizMsg}
              </div>
            )}

            <form onSubmit={handleAddBusiness} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم النشاط التجاري</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عيادات النيل التخصصية"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف المصري</label>
                  <input
                    type="text"
                    required
                    placeholder="01007718787"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم واتساب (مع كود 20)</label>
                  <input
                    type="text"
                    placeholder="201007718787"
                    value={newBizWhatsapp}
                    onChange={(e) => setNewBizWhatsapp(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف</label>
                  <select
                    required
                    value={newBizCatId}
                    onChange={(e) => setNewBizCatId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">اختر التصنيف...</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحافظة / الحي</label>
                  <select
                    required
                    value={newBizLocId}
                    onChange={(e) => setNewBizLocId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">اختر المحافظة والحي...</option>
                    {locationsList.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.districtAr} - {loc.cityAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">العنوان بالتفصيل</label>
                  <input
                    type="text"
                    placeholder="شارع التسعين الجنوبي، التجمع الخامس"
                    value={newBizAddress}
                    onChange={(e) => setNewBizAddress(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الباقة والترقية</label>
                  <select
                    value={newBizTier}
                    onChange={(e) => setNewBizTier(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="free">مجاني (Free)</option>
                    <option value="pro">موثق (Pro)</option>
                    <option value="elite">نخبة مميز (Elite 👑)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">وصف مختصر</label>
                <textarea
                  rows={2}
                  placeholder="نبذة عن الخدمات المقدمة ومواعيد العمل..."
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBizModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBiz}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmittingBiz ? "جاري الإضافة..." : "حفظ وإضافة النشاط"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تغيير رمز المرور */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-850 border border-slate-700 p-6 shadow-2xl">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute left-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              تغيير رمز المرور السري
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              يمكنك تحديث رمز مرور لوحة التحكم في أي وقت. يتم حفظ التغييرات فوراً.
            </p>

            {passwordMsg && (
              <div className="mb-4 rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 text-xs text-emerald-300">
                {passwordMsg}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 rounded-xl bg-red-950/60 border border-red-800 p-3 text-xs text-red-300">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">رمز المرور الحالي</label>
                <input
                  type="password"
                  placeholder="أدخل الرمز الحالي أو اترك تأكيد الجلسة"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رمز المرور الجديد</label>
                <input
                  type="password"
                  required
                  placeholder="6 خانات على الأقل"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تأكيد رمز المرور الجديد</label>
                <input
                  type="password"
                  required
                  placeholder="أعد إدخال الرمز الجديد"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  {isChangingPass ? "جاري الحفظ..." : "حفظ وتحديث الرمز"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
