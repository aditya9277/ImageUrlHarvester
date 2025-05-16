import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { scrapeImages } from "./scraper";

const scrapeRequestSchema = z.object({
  urls: z.array(z.string().url()),
  options: z.object({
    deduplicateImages: z.boolean().default(true),
    filterSmallImages: z.boolean().default(true)
  }).default({
    deduplicateImages: true,
    filterSmallImages: true
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for scraping images
  app.post("/api/scrape", async (req, res) => {
    try {
      // Validate request body
      const validationResult = scrapeRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { urls, options } = validationResult.data;
      
      // Scrape images from the provided URLs
      const images = await scrapeImages(urls, options);
      
      // Return the scraped images
      return res.json({ images });
    } catch (error) {
      console.error("Error scraping images:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to scrape images" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
