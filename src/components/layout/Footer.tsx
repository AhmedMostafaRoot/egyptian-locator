import Link from "next/link";
import { Building2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white text-gray-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* العمود الأول: نبذة عن الدليل */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-gray-900 text-base">دليل مصر المحلي</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              أول دليل خدمات وأنشطة تجارية برمجي باللغة العربية مخصص للمحافظات والأحياء المصرية، مع إمكانية التواصل الفوري والمباشر عبر واتساب.
            </p>
          </div>

          {/* العمود الثاني: محافظات مصر الأكثر طلباً */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">محافظات ومدن رئيسية</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cairo/dentists" className="hover:text-emerald-600 transition-colors">
                  أطباء وخدمات القاهرة
                </Link>
              </li>
              <li>
                <Link href="/giza/car-repair" className="hover:text-emerald-600 transition-colors">
                  صيانة سيارات الجيزة
                </Link>
              </li>
              <li>
                <Link href="/alexandria/dentists" className="hover:text-emerald-600 transition-colors">
                  عيادات وأنشطة الإسكندرية
                </Link>
              </li>
              <li>
                <Link href="/cairo/interior-design" className="hover:text-emerald-600 transition-colors">
                  شركات تشطيبات وديكور
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: أحياء ومناطق مميزة */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">أحياء مصرية شهيرة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cairo/nasr-city/dentists" className="hover:text-emerald-600 transition-colors">
                  أطباء أسنان مدينة نصر
                </Link>
              </li>
              <li>
                <Link href="/cairo/new-cairo/interior-design" className="hover:text-emerald-600 transition-colors">
                  ديكور وتشطيبات التجمع الخامس
                </Link>
              </li>
              <li>
                <Link href="/giza/sheikh-zayed/car-repair" className="hover:text-emerald-600 transition-colors">
                  مراكز خدمة الشيخ زايد
                </Link>
              </li>
              <li>
                <Link href="/cairo/maadi/lawyers" className="hover:text-emerald-600 transition-colors">
                  مكاتب محامين المعادي
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود الرابع: توثيق الأنشطة والدعم */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">أصحاب الأنشطة التجارية</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              هل تدير عيادة، شركة، أو محلاً تجارياً في مصر؟ وثّق نشاطك وضاعف مبيعاتك عبر عملاء واتساب المباشرين.
            </p>
            <a
              href="https://wa.me/201007718787?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D9%88%D8%AB%D9%8A%D9%82%20%D9%86%D8%B4%D8%A7%D8%B7%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              طلب توثيق رسمي عبر واتساب &larr;
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} دليل مصر المحلي. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-bold text-gray-400 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
            >
              <span>لوحة تحكم المسؤول (Admin Dashboard)</span>
            </Link>
            <p className="flex items-center gap-1">
              صُمم بأعلى معايير السيو البرمجي للأعمال المحلية في مصر 🇪🇬
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

