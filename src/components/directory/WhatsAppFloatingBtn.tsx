"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingBtn({
  supportNumber = "201007718787",
}: {
  supportNumber?: string;
}) {
  const message = encodeURIComponent(
    "مرحباً فريق دليل مصر المحلي، أود الاستفسار بخصوص توثيق أو إضافة نشاط تجاري في الدليل."
  );
  const whatsappUrl = `https://wa.me/${supportNumber}?text=${message}`;

  return (
    <aside aria-label="تواصل سريع عبر واتساب" className="fixed bottom-6 left-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-full bg-emerald-600 p-3.5 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-700 active:scale-95"
      >
        <MessageCircle className="h-6 w-6 shrink-0 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs group-hover:px-1">
          واتساب الدعم السريع
        </span>
      </a>
    </aside>
  );
}
