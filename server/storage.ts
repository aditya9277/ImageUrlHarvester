import {
  users,
  scrapeHistory,
  images,
  type User,
  type ScrapeHistory,
  type Image,
  type InsertScrapeHistory,
  type ImageData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: { email: string, password: string, firstName?: string | null, lastName?: string | null }): Promise<User>;
  
  // Scrape history operations
  getScrapeHistory(userId: string, limit?: number): Promise<ScrapeHistory[]>;
  createScrapeHistory(data: InsertScrapeHistory): Promise<ScrapeHistory>;
  
  // Image operations
  getImagesForScrape(scrapeId: number): Promise<Image[]>;
  saveImages(scrapeId: number, images: ImageData[]): Promise<Image[]>;
  getImageByHash(hash: string): Promise<Image | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }
  
  async createUser(userData: { email: string, password: string, firstName?: string | null, lastName?: string | null }): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      }).returning();
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Error creating user");
    }
  }
  
  // Scrape history operations
  async getScrapeHistory(userId: string, limit: number = 10): Promise<ScrapeHistory[]> {
    try {
      return await db.select()
        .from(scrapeHistory)
        .where(eq(scrapeHistory.userId, userId))
        .orderBy(desc(scrapeHistory.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting scrape history:", error);
      return [];
    }
  }
  
  async createScrapeHistory(data: InsertScrapeHistory): Promise<ScrapeHistory> {
    try {
      const [history] = await db.insert(scrapeHistory).values(data).returning();
      return history;
    } catch (error) {
      console.error("Error creating scrape history:", error);
      throw new Error("Error creating scrape history");
    }
  }
  
  // Image operations
  async getImagesForScrape(scrapeId: number): Promise<Image[]> {
    try {
      return await db.select()
        .from(images)
        .where(eq(images.scrapeId, scrapeId));
    } catch (error) {
      console.error("Error getting images for scrape:", error);
      return [];
    }
  }
  
  async saveImages(scrapeId: number, imagesList: ImageData[]): Promise<Image[]> {
    try {
      if (!imagesList.length) return [];
      
      const imagesToInsert = imagesList.map(img => ({
        scrapeId,
        url: img.url,
        sourceUrl: img.sourceUrl,
        width: img.width || null,
        height: img.height || null,
        alt: img.alt || null,
        fileSize: img.fileSize || null,
        hash: img.hash || null,
        cached: img.cached || false,
      }));
      
      return await db.insert(images).values(imagesToInsert).returning();
    } catch (error) {
      console.error("Error saving images:", error);
      throw new Error("Error saving images");
    }
  }
  
  async getImageByHash(hash: string): Promise<Image | undefined> {
    try {
      const [image] = await db.select().from(images).where(eq(images.hash, hash));
      return image;
    } catch (error) {
      console.error("Error getting image by hash:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();