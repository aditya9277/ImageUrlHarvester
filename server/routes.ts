import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { scrapeImages } from "./scraper";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";

// Schema for image scraping requests
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
  // Set up authentication with database
  setupAuth(app);
  
  // Auth route to get current user
  app.get('/api/user', (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.json(null);
    }
    
    try {
      // User is already attached to the request by Passport
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API route for scraping images (works without authentication)
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
      
      // Save scrape history if user is authenticated
      if (req.isAuthenticated()) {
        try {
          const userId = req.user.id.toString();
          
          // Create scrape history entry
          const scrapeHistory = await storage.createScrapeHistory({
            userId,
            urls: urls.join(", "),
            imageCount: images.length
          });
          
          // Save images to database
          await storage.saveImages(scrapeHistory.id, images);
        } catch (error) {
          console.error("Failed to save scrape history:", error);
          // Continue anyway as this is an enhancement
        }
      }
      
      // Return the scraped images
      return res.json({ images });
    } catch (error) {
      console.error("Error scraping images:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to scrape images" 
      });
    }
  });
  
  // Protected routes (require authentication)
  
  // Get user's scrape history
  app.get("/api/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const history = await storage.getScrapeHistory(userId);
      res.json({ history });
    } catch (error) {
      console.error("Error fetching scrape history:", error);
      res.status(500).json({ message: "Failed to fetch scrape history" });
    }
  });
  
  // Get images for a specific scrape
  app.get("/api/history/:id/images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const scrapeId = parseInt(req.params.id, 10);
      
      if (isNaN(scrapeId)) {
        return res.status(400).json({ message: "Invalid scrape ID" });
      }
      
      // Verify the scrape belongs to the user
      const scrapeHistory = await storage.getScrapeHistory(userId);
      const userScrape = scrapeHistory.find(scrape => scrape.id === scrapeId);
      
      if (!userScrape) {
        return res.status(403).json({ message: "Not authorized to view this scrape" });
      }
      
      const images = await storage.getImagesForScrape(scrapeId);
      res.json({ images });
    } catch (error) {
      console.error("Error fetching scrape images:", error);
      res.status(500).json({ message: "Failed to fetch scrape images" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
