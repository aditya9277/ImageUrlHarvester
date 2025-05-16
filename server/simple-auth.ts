import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import crypto from 'crypto';

// In-memory users database
const users: Record<string, any> = {};

// Helper to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Setup auth middleware and routes
export function setupAuth(app: any) {
  // Configure session middleware
  app.use(
    session({
      secret: 'image-scraper-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
    })
  );

  // Register endpoint
  app.post('/api/register', (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Check if user already exists
      if (users[email]) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const userId = Object.keys(users).length + 1;
      const hashedPassword = hashPassword(password);
      
      const user = {
        id: userId,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        createdAt: new Date()
      };
      
      // Store user
      users[email] = user;
      
      // Set session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });
  
  // Login endpoint
  app.post('/api/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find user
      const user = users[email];
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Check password
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Set session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });
  
  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user endpoint
  app.get('/api/user', (req: Request, res: Response) => {
    if (!(req.session as any).user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json((req.session as any).user);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).user) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}