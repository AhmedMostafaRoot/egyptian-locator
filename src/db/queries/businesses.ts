import { db } from "../index";
import { businesses, categories, locations, businessClaims } from "../schema";
import { eq, and, gte, desc, asc, inArray } from "drizzle-orm";

export async function getAllCategories() {
  return await db.select().from(categories);
}

export async function getCategoryBySlug(slug: string) {
  const res = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return res[0] || null;
}

export async function getBusinessBySlug(slug: string) {
  const res = await db
    .select({
      id: businesses.id,
      nameAr: businesses.nameAr,
      slug: businesses.slug,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      address: businesses.address,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      verifiedStatus: businesses.verifiedStatus,
      featuredTier: businesses.featuredTier,
      description: businesses.description,
      workingHoursAr: businesses.workingHoursAr,
      imageUrl: businesses.imageUrl,
      websiteUrl: businesses.websiteUrl,
      createdAt: businesses.createdAt,
      category: {
        id: categories.id,
        nameAr: categories.nameAr,
        slug: categories.slug,
      },
      location: {
        id: locations.id,
        cityAr: locations.cityAr,
        citySlug: locations.citySlug,
        districtAr: locations.districtAr,
        districtSlug: locations.districtSlug,
      },
    })
    .from(businesses)
    .innerJoin(categories, eq(businesses.categoryId, categories.id))
    .innerJoin(locations, eq(businesses.locationId, locations.id))
    .where(eq(businesses.slug, slug))
    .limit(1);

  return res[0] || null;
}

export interface BusinessFilterOptions {
  minRating?: number;
  districtSlug?: string;
  sort?: "rating" | "reviews" | "featured";
}

// استعلام على مستوى المحافظة + التصنيف
export async function getBusinessesByCityAndCategory(
  citySlug: string,
  categorySlug: string,
  options?: BusinessFilterOptions
) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  // جلب كافة أحياء المحافظة
  const cityLocations = await db
    .select()
    .from(locations)
    .where(eq(locations.citySlug, citySlug));

  if (!cityLocations.length) return null;

  const locationIds = options?.districtSlug
    ? cityLocations.filter((l) => l.districtSlug === options.districtSlug).map((l) => l.id)
    : cityLocations.map((l) => l.id);

  if (!locationIds.length) return { category, locations: cityLocations, businesses: [] };

  const conditions = [
    eq(businesses.categoryId, category.id),
    inArray(businesses.locationId, locationIds),
  ];

  if (options?.minRating && options.minRating > 0) {
    conditions.push(gte(businesses.rating, options.minRating));
  }

  let query = db
    .select({
      id: businesses.id,
      nameAr: businesses.nameAr,
      slug: businesses.slug,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      address: businesses.address,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      verifiedStatus: businesses.verifiedStatus,
      featuredTier: businesses.featuredTier,
      description: businesses.description,
      workingHoursAr: businesses.workingHoursAr,
      imageUrl: businesses.imageUrl,
      category: {
        id: categories.id,
        nameAr: categories.nameAr,
        slug: categories.slug,
      },
      location: {
        id: locations.id,
        cityAr: locations.cityAr,
        citySlug: locations.citySlug,
        districtAr: locations.districtAr,
        districtSlug: locations.districtSlug,
      },
    })
    .from(businesses)
    .innerJoin(categories, eq(businesses.categoryId, categories.id))
    .innerJoin(locations, eq(businesses.locationId, locations.id))
    .where(and(...conditions));

  const items = await query;

  // ترتيب النتائج مع إعطاء الأولوية للأنشطة المميزة (elite ثم pro ثم التقييم)
  items.sort((a, b) => {
    const tierScore = (t: string | null) => (t === "elite" ? 3 : t === "pro" ? 2 : 1);
    const scoreDiff = tierScore(b.featuredTier) - tierScore(a.featuredTier);
    if (scoreDiff !== 0) return scoreDiff;

    if (options?.sort === "reviews") {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  return {
    category,
    cityAr: cityLocations[0].cityAr,
    citySlug,
    locations: cityLocations,
    businesses: items,
  };
}

// استعلام على مستوى الحي + التصنيف
export async function getBusinessesByDistrictAndCategory(
  citySlug: string,
  districtSlug: string,
  categorySlug: string,
  options?: BusinessFilterOptions
) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const loc = await db
    .select()
    .from(locations)
    .where(and(eq(locations.citySlug, citySlug), eq(locations.districtSlug, districtSlug)))
    .limit(1);

  if (!loc[0]) return null;
  const location = loc[0];

  const conditions = [
    eq(businesses.categoryId, category.id),
    eq(businesses.locationId, location.id),
  ];

  if (options?.minRating && options.minRating > 0) {
    conditions.push(gte(businesses.rating, options.minRating));
  }

  const items = await db
    .select({
      id: businesses.id,
      nameAr: businesses.nameAr,
      slug: businesses.slug,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      address: businesses.address,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      verifiedStatus: businesses.verifiedStatus,
      featuredTier: businesses.featuredTier,
      description: businesses.description,
      workingHoursAr: businesses.workingHoursAr,
      imageUrl: businesses.imageUrl,
      category: {
        id: categories.id,
        nameAr: categories.nameAr,
        slug: categories.slug,
      },
      location: {
        id: locations.id,
        cityAr: locations.cityAr,
        citySlug: locations.citySlug,
        districtAr: locations.districtAr,
        districtSlug: locations.districtSlug,
      },
    })
    .from(businesses)
    .innerJoin(categories, eq(businesses.categoryId, categories.id))
    .innerJoin(locations, eq(businesses.locationId, locations.id))
    .where(and(...conditions));

  items.sort((a, b) => {
    const tierScore = (t: string | null) => (t === "elite" ? 3 : t === "pro" ? 2 : 1);
    const scoreDiff = tierScore(b.featuredTier) - tierScore(a.featuredTier);
    if (scoreDiff !== 0) return scoreDiff;

    if (options?.sort === "reviews") {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  return {
    category,
    location,
    businesses: items,
  };
}

// تسجيل طلب توثيق نشاط
export async function createBusinessClaim(data: {
  businessId: number;
  claimantName: string;
  claimantPhone: string;
  nationalIdOrCr?: string;
  requestedTier: "claim_ownership" | "pro" | "elite";
  notes?: string;
}) {
  return await db.insert(businessClaims).values(data).returning();
}

// قبول طلب التوثيق أو الترقية وتحديث النشاط مباشرة
export async function approveBusinessClaim(claimId: number) {
  const claimRes = await db
    .select()
    .from(businessClaims)
    .where(eq(businessClaims.id, claimId))
    .limit(1);

  if (!claimRes.length) return null;
  const claim = claimRes[0];

  // تحديث حالة الطلب إلى approved
  await db
    .update(businessClaims)
    .set({ status: "approved" })
    .where(eq(businessClaims.id, claimId));

  // تحديث النشاط التجاري
  const updateData: { verifiedStatus: boolean; featuredTier?: "free" | "pro" | "elite" } = {
    verifiedStatus: true,
  };

  if (claim.requestedTier === "elite" || claim.requestedTier === "pro") {
    updateData.featuredTier = claim.requestedTier;
  }

  await db
    .update(businesses)
    .set(updateData)
    .where(eq(businesses.id, claim.businessId));

  return { success: true, claimId, businessId: claim.businessId };
}

// رفض طلب التوثيق أو الترقية
export async function rejectBusinessClaim(claimId: number) {
  await db
    .update(businessClaims)
    .set({ status: "rejected" })
    .where(eq(businessClaims.id, claimId));

  return { success: true, claimId };
}

// إضافة نشاط تجاري جديد مباشرة من لوحة التحكم
export async function addBusinessDirectly(data: {
  nameAr: string;
  slug: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  categoryId: number;
  locationId: number;
  rating?: number;
  reviewCount?: number;
  featuredTier?: "free" | "pro" | "elite";
  verifiedStatus?: boolean;
  description?: string;
  workingHoursAr?: string;
}) {
  return await db.insert(businesses).values({
    nameAr: data.nameAr,
    slug: data.slug,
    phone: data.phone,
    whatsappNumber: data.whatsappNumber,
    address: data.address,
    categoryId: data.categoryId,
    locationId: data.locationId,
    rating: data.rating ?? 5.0,
    reviewCount: data.reviewCount ?? 1,
    featuredTier: data.featuredTier ?? "free",
    verifiedStatus: data.verifiedStatus ?? true,
    description: data.description ?? "",
    workingHoursAr: data.workingHoursAr ?? "يومياً من 9:00 ص حتى 10:00 م",
  }).returning();
}

