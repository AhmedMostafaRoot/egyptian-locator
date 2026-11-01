import React from "react";

interface LocalBusinessJsonLdProps {
  business: {
    nameAr: string;
    slug: string;
    phone: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    rating: number | null;
    reviewCount: number | null;
    description?: string | null;
    imageUrl?: string | null;
    workingHoursAr?: string | null;
    category?: {
      nameAr: string;
    };
    location: {
      cityAr: string;
      districtAr: string;
    };
  };
}

export function LocalBusinessJsonLd({ business }: LocalBusinessJsonLdProps) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://daleel-masr.com/b/${business.slug}#business`,
    "name": business.nameAr,
    "image": business.imageUrl || "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80",
    "telephone": business.phone,
    "url": `https://daleel-masr.com/b/${business.slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.location.districtAr,
      "addressRegion": business.location.cityAr,
      "addressCountry": "EG",
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": business.location.districtAr,
      },
      {
        "@type": "AdministrativeArea",
        "name": business.location.cityAr,
      },
    ],
    "priceRange": "$$",
    "description": business.description || `خدمات ${business.category?.nameAr || "أعمال محلية"} في ${business.location.districtAr}، ${business.location.cityAr}`,
  };

  // إضافة الإحداثيات الجغرافية إذا توفرت
  if (business.latitude && business.longitude) {
    schema["geo"] = {
      "@type": "GeoCoordinates",
      "latitude": business.latitude,
      "longitude": business.longitude,
    };
  }

  // إضافة التقييم الإجمالي
  if (business.rating && business.rating > 0) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.reviewCount || 1,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
