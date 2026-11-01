import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessBySlug } from "@/db/queries/businesses";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BusinessDetailView } from "@/components/directory/BusinessDetailView";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await getBusinessBySlug(params.slug);
  if (!business) return {};

  const currentYear = new Date().getFullYear();
  const title = `${business.nameAr} - ${business.location.districtAr}، ${business.location.cityAr} (${currentYear}) | دليل مصر`;
  const description = `${business.nameAr} في ${business.location.districtAr}، ${business.location.cityAr}. رقم التليفون: ${business.phone}، تواصل مباشر عبر واتساب، العنوان التفصيلي، والتقييمات الحقيقية.`;
  const canonicalUrl = `https://daleel-masr.com/b/${business.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      locale: "ar_EG",
      type: "article",
      url: canonicalUrl,
      images: business.imageUrl ? [{ url: business.imageUrl }] : undefined,
    },
  };
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const business = await getBusinessBySlug(params.slug);
  if (!business) {
    notFound();
  }

  const breadcrumbs = [
    { name: "الرئيسية", url: "https://daleel-masr.com" },
    {
      name: `${business.category.nameAr} في ${business.location.cityAr}`,
      url: `https://daleel-masr.com/${business.location.citySlug}/${business.category.slug}`,
    },
    {
      name: business.location.districtAr,
      url: `https://daleel-masr.com/${business.location.citySlug}/${business.location.districtSlug}/${business.category.slug}`,
    },
    {
      name: business.nameAr,
      url: `https://daleel-masr.com/b/${business.slug}`,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-6 md:py-10 pb-24 sm:pb-10">
      {/* 1. Structured Schema.org LocalBusiness & Breadcrumbs */}
      <LocalBusinessJsonLd business={business} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* 2. مسار التنقل البصري */}
      <nav aria-label="مسار التصفح" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <Link
          href={`/${business.location.citySlug}/${business.category.slug}`}
          className="hover:text-emerald-700 transition-colors"
        >
          {business.category.nameAr} {business.location.cityAr}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <Link
          href={`/${business.location.citySlug}/${business.location.districtSlug}/${business.category.slug}`}
          className="hover:text-emerald-700 transition-colors"
        >
          {business.location.districtAr}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-gray-900 truncate max-w-xs">{business.nameAr}</span>
      </nav>

      {/* 3. العرض التفاعلي للنشاط والمودال والشريط السفلي */}
      <BusinessDetailView business={business} />
    </main>
  );
}
