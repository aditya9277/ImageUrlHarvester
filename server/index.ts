import express, { NextFunction, Request, Response } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import bodyParser from "body-parser";
import { log, setupVite, serveStatic } from "./vite";

async function main() {
  // Create Express server
  const app = express();
  
  // Parse JSON bodies
  app.use(bodyParser.json());
  
  // Log all requests
  app.use((req, _res, next) => {
    log(`${req.method} ${req.path}`);
    next();
  });
  
  // Register API routes
  const server = await registerRoutes(app);
  
  // Handle errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      message: err.message || "Something went wrong",
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
  console.error(err);
  process.exit(1);
});