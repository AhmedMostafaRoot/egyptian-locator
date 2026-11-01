import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingBtn } from "@/components/directory/WhatsAppFloatingBtn";

export const metadata: Metadata = {
  metadataBase: new URL("https://daleel-masr.com"),
  title: {
    template: "%s | دليل مصر المحلي",
    default: "دليل مصر المحلي | أفضل الشركات والعيادات والخدمات في محافظات مصر",
  },
  description:
    "دليل رقمي برمجي شامل لأفضل الخدمات والشركات والعيادات في القاهرة، الجيزة، الإسكندرية، وكافة محافظات مصر. تواصل فوري ومباشر عبر واتساب وهاتفياً.",
  keywords: [
    "دليل مصر",
    "أطباء أسنان القاهرة",
    "ديكور وتشطيبات التجمع الخامس",
    "صيانة سيارات الشيخ زايد",
    "محامين المعادي",
    "أرقام خدمات مصر",
    "دليل الأنشطة التجارية",
  ],
  authors: [{ name: "فريق دليل مصر" }],
  openGraph: {
    title: "دليل مصر المحلي للشركات والخدمات",
    description: "تصفح أرقام وعناوين وتقييمات أفضل الأنشطة والخدمات المعتمدة في منطقتك وتواصل مباشرة عبر واتساب.",
    siteName: "دليل مصر المحلي",
    locale: "ar_EG",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <WhatsAppFloatingBtn supportNumber="201007718787" />
      </body>
    </html>
  );
}