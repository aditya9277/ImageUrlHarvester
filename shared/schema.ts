import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const scrapeHistory = pgTable("scrape_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  url: text("url").notNull(),
  timestamp: text("timestamp").notNull(),
  imageCount: integer("image_count").notNull(),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  scrapeId: integer("scrape_id").references(() => scrapeHistory.id),
  url: text("url").notNull(),
  sourceUrl: text("source_url").notNull(),
  alt: text("alt"),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScrapeHistorySchema = createInsertSchema(scrapeHistory).pick({
  userId: true,
  url: true,
  timestamp: true,
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
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
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
}
