import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Add user property to session
declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

// In-memory user store for the demo
// In a real application, this would be a database
const users: Record<string, any> = {};
const scryptAsync = promisify(scrypt);

// Hash password using scrypt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare supplied password with stored hashed password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session setup
  app.use(
    session({
      secret: "your-secret-key", // In production, use a proper environment variable
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false } // Set to true if using HTTPS
    })
  );

  // Initialize session
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
      req.session.user = null;
    }
    next();
  });

  // Register endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      if (users[email]) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = {
        id: Object.keys(users).length + 1,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        createdAt: new Date(),
      };

      // Store user
      users[email] = user;

      // Login the user
      req.session.user = { ...user, password: undefined };

      return res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error in registration:", error);
      return res.status(500).json({ message: "Registration failed", error: (error as Error).message });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user exists
      const user = users[email];
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Login the user
      req.session.user = { ...user, password: undefined };

      return res.status(200).json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ message: "Login failed", error: (error as Error).message });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.user = null;
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    return next();
  }
  
  res.status(401).json({ message: "Authentication required" });
}