import express, { NextFunction, Request, Response } from "express";
import { registerRoutes } from "./routes";
import bodyParser from "body-parser";
import { log, setupVite, serveStatic } from "./vite";

async function main() {
  // Create Express server
  const app = express();
  
  // Enable detailed error logging
  app.use((req, res, next) => {
    res.on('finish', () => {
      log(`${req.method} ${req.path} ${res.statusCode}`);
    });
    next();
  });
  
  // Parse JSON bodies
  app.use(bodyParser.json());
  
  // Register API routes
  const server = await registerRoutes(app);
  
  // Handle errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });
  
  // In development, use Vite for client app
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});