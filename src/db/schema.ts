import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// 1. جدول التصنيفات (Categories)
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").default("Briefcase"),
  metaTitleTemplateAr: text("meta_title_template_ar"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugIdx: index("category_slug_idx").on(table.slug),
}));

// 2. جدول المواقع الجغرافية (Locations)
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityAr: text("city_ar").notNull(),              // المحافظة بالعربية: القاهرة، الجيزة، الإسكندرية
  citySlug: text("city_slug").notNull(),          // cairo, giza, alexandria
  districtAr: text("district_ar").notNull(),      // الحي بالعربية: مدينة نصر، التجمع الخامس
  districtSlug: text("district_slug").notNull(),  // nasr-city, new-cairo
  slug: text("slug").notNull().unique(),           // cairo-nasr-city (combined unique slug)
  isPopular: integer("is_popular", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  cityDistrictIdx: index("loc_city_district_idx").on(table.citySlug, table.districtSlug),
  cityIdx: index("loc_city_idx").on(table.citySlug),
  slugIdx: index("loc_slug_idx").on(table.slug),
}));

// 3. جدول الأنشطة والشركات المحلية (Businesses)
export const businesses = sqliteTable("businesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  phone: text("phone").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(), // بالصيغة الدولية 201xxxxxxxxx
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  rating: real("rating").default(0.0),
  reviewCount: integer("review_count").default(0),
  verifiedStatus: integer("verified_status", { mode: "boolean" }).default(false),
  featuredTier: text("featured_tier", { enum: ["free", "pro", "elite"] }).default("free"),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  description: text("description"),
  workingHoursAr: text("working_hours_ar"),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  catLocIdx: index("biz_cat_loc_idx").on(table.categoryId, table.locationId),
  featuredIdx: index("biz_featured_idx").on(table.featuredTier),
  slugIdx: index("biz_slug_idx").on(table.slug),
}));

// 4. جدول طلبات توثيق وترقية الأنشطة (Business Claims & Upgrades)
export const businessClaims = sqliteTable("business_claims", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  claimantName: text("claimant_name").notNull(),
  claimantPhone: text("claimant_phone").notNull(),
  nationalIdOrCr: text("national_id_or_cr"),
  requestedTier: text("requested_tier", { enum: ["claim_ownership", "pro", "elite"] }).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// العلاقات (Relations)
export const categoriesRelations = relations(categories, ({ many }) => ({
  businesses: many(businesses),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [businesses.locationId],
    references: [locations.id],
  }),
  claims: many(businessClaims),
}));

export const businessClaimsRelations = relations(businessClaims, ({ one }) => ({
  business: one(businesses, {
    fields: [businessClaims.businessId],
    references: [businesses.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type BusinessClaim = typeof businessClaims.$inferSelect;

