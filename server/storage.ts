import { 
  users, 
  scrapeHistory, 
  images,
  type User, 
  type UpsertUser,
  type ScrapeHistory,
  type InsertScrapeHistory,
  type Image,
  type InsertImage,
  type ImageData
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Scrape history operations
  getScrapeHistory(userId: string, limit?: number): Promise<ScrapeHistory[]>;
  createScrapeHistory(data: InsertScrapeHistory): Promise<ScrapeHistory>;
  
  // Image operations
  getImagesForScrape(scrapeId: number): Promise<Image[]>;
  saveImages(scrapeId: number, images: ImageData[]): Promise<Image[]>;
  getImageByHash(hash: string): Promise<Image | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Scrape history operations
  async getScrapeHistory(userId: string, limit: number = 10): Promise<ScrapeHistory[]> {
    return db
      .select()
      .from(scrapeHistory)
      .where(eq(scrapeHistory.userId, userId))
      .orderBy(desc(scrapeHistory.createdAt))
      .limit(limit);
  }

  async createScrapeHistory(data: InsertScrapeHistory): Promise<ScrapeHistory> {
    const [result] = await db
      .insert(scrapeHistory)
      .values(data)
      .returning();
    return result;
  }

  // Image operations
  async getImagesForScrape(scrapeId: number): Promise<Image[]> {
    return db
      .select()
      .from(images)
      .where(eq(images.scrapeId, scrapeId));
  }

  async saveImages(scrapeId: number, imagesList: ImageData[]): Promise<Image[]> {
    // Generate hashes for images if missing
    const imagesWithHashes = imagesList.map(img => {
      if (!img.hash) {
        const hash = crypto.createHash("md5").update(img.url).digest("hex");
        return { ...img, hash };
      }
      return img;
    });

    // Insert all images
    const insertedImages = await Promise.all(
      imagesWithHashes.map(async (img) => {
        // Check if image is already cached
        let cached = false;
        if (img.hash) {
          const existingImage = await this.getImageByHash(img.hash);
          cached = !!existingImage;
        }

        const [result] = await db
          .insert(images)
          .values({
            scrapeId,
            url: img.url,
            sourceUrl: img.sourceUrl,
            alt: img.alt,
            width: img.width,
            height: img.height,
            fileSize: img.fileSize,
            hash: img.hash,
            cached
          })
          .returning();
        return result;
      })
    );

    return insertedImages;
  }

  async getImageByHash(hash: string): Promise<Image | undefined> {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.hash, hash));
    return image;
  }
}

export const storage = new DatabaseStorage();
