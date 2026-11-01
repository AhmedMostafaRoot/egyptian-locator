import Link from "next/link";
import { Building2, Search, PlusCircle, MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* الشعار والهوية المصرية */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              دليل مصر
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                محلي
              </span>
            </span>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              الأنشطة والخدمات المعتمدة في محافظات مصر
            </p>
          </div>
        </Link>

        {/* روابط سريعة */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <Link
            href="/cairo/dentists"
            className="hidden md:inline-flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            أطباء أسنان القاهرة
          </Link>
          <Link
            href="/cairo/new-cairo/interior-design"
            className="hidden md:inline-flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            ديكور التجمع الخامس
          </Link>
          <Link
            href="/giza/sheikh-zayed/car-repair"
            className="hidden lg:inline-flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            صيانة سيارات بالشيخ زايد
          </Link>

          <a
            href="https://wa.me/201007718787?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A5%D8%B6%D8%A7%D9%81%D8%A9%20%D9%86%D8%B4%D8%A7%D8%B7%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D8%AF%D9%84%D9%8A%D9%84"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            أضف نشاطك مجاناً
          </a>
        </nav>
      </div>
    </header>
  );
}

