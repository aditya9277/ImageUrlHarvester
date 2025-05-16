import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { scrapeImages } from "./scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Debug endpoint to check if auth is working
  app.get("/api/auth-check", (req, res) => {
    res.json({
      authenticated: req.isAuthenticated(),
      user: req.user || null,
      session: req.session ? true : false
    });
  });
  
  // API routes
  
  // Scrape images endpoint
  app.post("/api/scrape", async (req, res) => {
    try {
      const { urls, options } = req.body;
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: "No URLs provided" });
      }
      
      // Scrape images from the provided URLs
      const images = await scrapeImages(urls, options);
      
      // If user is authenticated, save the scrape to history
      if (req.isAuthenticated() && req.user) {
        const urlString = Array.isArray(urls) ? urls.join(", ") : urls;
        const userId = req.user.id.toString();
        
        const scrapeRecord = await storage.createScrapeHistory({
          userId,
          urls: urlString,
          imageCount: images.length,
        });
        
        // Save images to database
        if (scrapeRecord && images.length > 0) {
          await storage.saveImages(scrapeRecord.id, images);
        }
      }
      
      res.json({ images });
    } catch (error) {
      console.error("Error scraping images:", error);
      res.status(500).json({ 
        message: "Error scraping images", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Get scrape history (protected route)
  app.get("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id.toString();
      const history = await storage.getScrapeHistory(userId);
      
      res.json({ history });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Error fetching history" });
    }
  });
  
  // Get images for a specific scrape (protected route)
  app.get("/api/history/:id/images", isAuthenticated, async (req, res) => {
    try {
      const scrapeId = parseInt(req.params.id);
      const images = await storage.getImagesForScrape(scrapeId);
      
      res.json({ images });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Error fetching images" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}