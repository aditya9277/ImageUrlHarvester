import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./memory-auth.js";
import { scrapeImages as fetchImagesFromUrls } from "./scraper";

// Simple in-memory storage for history
const scrapeHistory: any[] = [];
const scrapeImagesStorage: any[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication using memory-based auth
  setupAuth(app);
  
  // Debug endpoint to check if auth is working
  app.get("/api/auth-check", (req, res) => {
    res.json({
      authenticated: !!req.session.user,
      user: req.session.user || null,
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
      const images = await fetchImagesFromUrls(urls, options);
      
      // If user is authenticated, save the scrape to history
      if (req.session.user) {
        const urlString = Array.isArray(urls) ? urls.join(", ") : urls;
        const userId = req.session.user.id;
        
        // Create scrape history record
        const scrapeRecord = {
          id: scrapeHistory.length + 1,
          userId,
          urls: urlString,
          imageCount: images.length,
          createdAt: new Date()
        };
        
        scrapeHistory.push(scrapeRecord);
        
        // Save images to memory
        if (images.length > 0) {
          const imagesWithScrapeId = images.map((img: any) => ({
            ...img,
            scrapeId: scrapeRecord.id
          }));
          scrapeImagesStorage.push(...imagesWithScrapeId);
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
  app.get("/api/history", isAuthenticated, (req, res) => {
    try {
      const userId = req.session.user.id;
      const history = scrapeHistory.filter(item => item.userId === userId);
      
      res.json({ history });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Error fetching history" });
    }
  });
  
  // Get images for a specific scrape (protected route)
  app.get("/api/history/:id/images", isAuthenticated, (req, res) => {
    try {
      const scrapeId = parseInt(req.params.id);
      const images = scrapeImagesStorage.filter(img => img.scrapeId === scrapeId);
      
      res.json({ images });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Error fetching images" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}