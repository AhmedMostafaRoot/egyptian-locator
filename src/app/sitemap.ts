import { MetadataRoute } from "next";
import { db } from "@/db";
import { categories, locations, businesses } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://daleel-masr.com";

  const allCategories = await db.select().from(categories);
  const allLocations = await db.select().from(locations);
  const allBusinesses = await db
    .select({
      slug: businesses.slug,
      createdAt: businesses.createdAt,
    })
    .from(businesses);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // 1. روابط المدن والتصنيفات: /[city]/[category]
  const uniqueCities = Array.from(new Set(allLocations.map((l) => l.citySlug)));
  const cityCategoryRoutes: MetadataRoute.Sitemap = [];

  for (const city of uniqueCities) {
    for (const cat of allCategories) {
      cityCategoryRoutes.push({
        url: `${baseUrl}/${city}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 2. روابط الأحياء والتصنيفات: /[city]/[district]/[category]
  const districtCategoryRoutes: MetadataRoute.Sitemap = [];
  for (const loc of allLocations) {
    for (const cat of allCategories) {
      districtCategoryRoutes.push({
        url: `${baseUrl}/${loc.citySlug}/${loc.districtSlug}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // 3. روابط الأنشطة الفردية: /b/[slug]
  const businessRoutes: MetadataRoute.Sitemap = allBusinesses.map((b) => ({
    url: `${baseUrl}/b/${b.slug}`,
    lastModified: b.createdAt ? new Date(b.createdAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...cityCategoryRoutes, ...districtCategoryRoutes, ...businessRoutes];
}

