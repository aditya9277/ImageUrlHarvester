import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for auth
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Enhanced user model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  username: text("username").unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  scrapeHistory: many(scrapeHistory),
}));

export const scrapeHistory = pgTable("scrape_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  urls: text("urls").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  imageCount: integer("image_count").notNull(),
});

export const scrapeHistoryRelations = relations(scrapeHistory, ({ one, many }) => ({
  user: one(users, {
    fields: [scrapeHistory.userId],
    references: [users.id],
  }),
  images: many(images),
}));

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  scrapeId: integer("scrape_id").references(() => scrapeHistory.id),
  url: text("url").notNull(),
  sourceUrl: text("source_url").notNull(),
  alt: text("alt"),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  hash: text("hash"),
  cached: boolean("cached").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const imageRelations = relations(images, ({ one }) => ({
  scrapeHistory: one(scrapeHistory, {
    fields: [images.scrapeId],
    references: [scrapeHistory.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);

export const upsertUserSchema = insertUserSchema.partial().required({
  id: true,
});

export const insertScrapeHistorySchema = createInsertSchema(scrapeHistory).pick({
  userId: true,
  urls: true,
  imageCount: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  scrapeId: true,
  url: true,
  sourceUrl: true,
  alt: true,
  width: true,
  height: true,
  fileSize: true,
  hash: true,
  cached: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type ScrapeHistory = typeof scrapeHistory.$inferSelect;
export type InsertScrapeHistory = z.infer<typeof insertScrapeHistorySchema>;
export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;

// Frontend types
export interface ImageData {
  url: string;
  sourceUrl: string;
  width?: number;
  height?: number;
  alt?: string;
  fileSize?: number;
  hash?: string;
  cached?: boolean;
}
