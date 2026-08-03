import { pgEnum, pgTable, uuid, text, numeric, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. GLOBAL SYSTEM ENUMS
// ==========================================
export const roleEnum = pgEnum("user_role", ["customer", "chef", "admin"]);

export const chefStatusEnum = pgEnum("chef_status", ["pending", "approved", "rejected"]);

export const mealStatusEnum = pgEnum("meal_status", ["pending", "approved", "rejected"]);

// ==========================================
// 2. CORE SYSTEM TABLES
// ==========================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("customer").notNull(),

  avatar: text("avatar"),
  bio: text("bio"),
  phone: text("phone"),
  address: text("address"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const chefs = pgTable("chefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  status: chefStatusEnum("status").default("pending").notNull(),

  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  photo: text("photo"),
  status: mealStatusEnum("status").default("pending").notNull(),

  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

export const mealTags = pgTable(
  "meal_tags",
  {
    mealId: uuid("meal_id")
      .references(() => meals.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [{ pk: primaryKey({ columns: [table.mealId, table.tagId] }) }],
);

// ==========================================
// 3. DRIZZLE RELATIONAL MAPPINGS
// ==========================================
export const usersRelations = relations(users, ({ one, many }) => ({
  chefProfile: one(chefs, { fields: [users.id], references: [chefs.userId] }),
  meals: many(meals),
}));

export const chefsRelations = relations(chefs, ({ one }) => ({
  user: one(users, { fields: [chefs.userId], references: [users.id] }),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, { fields: [meals.userId], references: [users.id] }),
  mealTags: many(mealTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  mealTags: many(mealTags),
}));

export const mealTagsRelations = relations(mealTags, ({ one }) => ({
  meal: one(meals, { fields: [mealTags.mealId], references: [meals.id] }),
  tag: one(tags, { fields: [mealTags.tagId], references: [tags.id] }),
}));

// ==========================================
// 4. TYPE INFERENCES
// ==========================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof roleEnum.enumValues)[number];

export type Chef = typeof chefs.$inferSelect;
export type NewChef = typeof chefs.$inferInsert;
export type ChefStatus = (typeof chefStatusEnum.enumValues)[number];

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type MealStatus = (typeof mealStatusEnum.enumValues)[number];

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type MealTag = typeof mealTags.$inferSelect;
export type NewMealTag = typeof mealTags.$inferInsert;
