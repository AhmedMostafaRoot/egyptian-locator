import { db } from "../index";
import { locations, categories, businesses } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export async function getPopularLocations() {
  return await db.select().from(locations).where(eq(locations.isPopular, true));
}

export async function getAllLocations() {
  return await db.select().from(locations);
}

export async function getDistrictsByCity(citySlug: string) {
  return await db.select().from(locations).where(eq(locations.citySlug, citySlug));
}

export async function getLocationBySlugs(citySlug: string, districtSlug: string) {
  const res = await db
    .select()
    .from(locations)
    .where(and(eq(locations.citySlug, citySlug), eq(locations.districtSlug, districtSlug)))
    .limit(1);
  return res[0] || null;
}

export async function getUniqueCities() {
  const locs = await db.select().from(locations);
  const cityMap = new Map<string, { cityAr: string; citySlug: string; districtsCount: number }>();
  
  for (const loc of locs) {
    if (!cityMap.has(loc.citySlug)) {
      cityMap.set(loc.citySlug, {
        cityAr: loc.cityAr,
        citySlug: loc.citySlug,
        districtsCount: 1,
      });
    } else {
      cityMap.get(loc.citySlug)!.districtsCount += 1;
    }
  }
  return Array.from(cityMap.values());
}

