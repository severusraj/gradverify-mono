import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'gradverify-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          console.log(`Login attempt for email: ${email}`);
          const user = await storage.getUserByEmail(email);
          if (!user) {
            console.log(`User not found: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          }
          console.log(`User found, comparing passwords for: ${email}`);
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.log(`Password mismatch for: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          } else {
            console.log(`Login successful for: ${email}`);
            return done(null, user);
          }
        } catch (error) {
          console.error(`Login error for ${email}:`, error);
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Register body:', req.body); // Debug log
      const { email, password, fullName, role = "student" } = req.body;
      // Validate required fields
      if (!email || !password || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name: fullName,
        role
      });
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // DEBUG endpoint - only for development
  app.get("/api/debug/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error fetching users for debug:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  
  // Debug login API that bypasses passport
  app.post("/api/debug/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`Direct login attempt for: ${email}`);
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Show debug information
      console.log(`Found user: ${user.email}, ID: ${user.id}, Role: ${user.role}`);
      console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);
      // Manual password check
      const passwordMatch = await comparePasswords(password, user.password);
      console.log(`Password match result: ${passwordMatch}`);
      if (!passwordMatch) {
        console.log(`Password mismatch for: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Manually login
      req.login(user, (err) => {
        if (err) {
          console.error(`Login error for ${email}:`, err);
          return res.status(500).json({ message: "Login error" });
        }
        console.log(`Login successful for: ${email}`);
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Debug login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  console.log("Auth routes loaded");
}
