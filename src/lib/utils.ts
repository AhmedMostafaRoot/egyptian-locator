import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق أرقام الهواتف المصرية للعرض اللطيف (مثال: 010 1234 5678 أو 02 2271 8899)
 */
export function formatEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith("02") && cleaned.length >= 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * إنشاء رابط واتساب دولي سليم بصيغة wa.me/20...
 */
export function buildWhatsAppLink(rawNumber: string, businessName: string): string {
  let cleaned = rawNumber.replace(/[^0-9]/g, "");
  // تحويل 010xxxxxxxx إلى 2010xxxxxxxx
  if (cleaned.startsWith("01")) {
    cleaned = `20${cleaned.slice(1)}`;
  } else if (!cleaned.startsWith("20") && cleaned.length === 10 && cleaned.startsWith("1")) {
    cleaned = `20${cleaned}`;
  }

  const message = `مرحباً، أود الاستفسار عن خدمات ومواعيد العمل في ${businessName} (من خلال دليل مصر التجاري).`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

