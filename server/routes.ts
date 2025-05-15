import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { insertStudentProfileSchema, insertDocumentSchema, insertAwardSchema, insertNotificationSchema } from "@shared/schema";

// Configure multer for file uploads
const createUploadDir = (dir: string) => {
  const uploadDir = path.join(process.cwd(), "uploads", dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "documents";
    if (file.fieldname === "photo") {
      dir = "photos";
    } else if (file.fieldname === "awardProof") {
      dir = "awards";
    }
    cb(null, createUploadDir(dir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max for PSA
  },
  fileFilter: (req, file, cb) => {
    // Check file types based on fieldname
    if (file.fieldname === "psa") {
      if (file.mimetype === "application/pdf" || 
          file.mimetype === "image/jpeg" || 
          file.mimetype === "image/png") {
        cb(null, true);
      } else {
        cb(new Error("PSA document must be PDF, JPEG, or PNG"));
      }
    } else if (file.fieldname === "photo") {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
      } else {
        cb(new Error("Photo must be JPEG or PNG"));
      }
    } else if (file.fieldname === "awardProof") {
      if (file.mimetype === "application/pdf" || 
          file.mimetype === "image/jpeg" || 
          file.mimetype === "image/png") {
        cb(null, true);
      } else {
        cb(new Error("Award proof must be PDF, JPEG, or PNG"));
      }
    } else {
      cb(new Error("Unexpected field"));
    }
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has a specific role
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userRole = req.user?.role;
    if (userRole && roles.includes(userRole)) {
      return next();
    }
    
    res.status(403).json({ message: "Forbidden: Insufficient permissions" });
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Dashboard stats route
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Department progress route
  app.get("/api/dashboard/department-progress", isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.getDepartmentProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department progress" });
    }
  });

  // Recent submissions route
  app.get("/api/dashboard/recent-submissions", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const submissions = await storage.getRecentSubmissions(limit);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent submissions" });
    }
  });

  // Student profile routes
  app.post("/api/student/profile", isAuthenticated, async (req, res) => {
    try {
      const validation = insertStudentProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid student profile data", errors: validation.error.errors });
      }
      
      const profile = await storage.createStudentProfile({
        ...validation.data,
        userId: req.user!.id
      });
      
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to create student profile" });
    }
  });

  app.get("/api/student/profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getStudentProfileByUserId(req.user!.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  app.get("/api/student/profiles", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const department = req.query.department as string;
      
      let profiles;
      if (department) {
        profiles = await storage.getStudentProfilesByDepartment(department);
      } else {
        profiles = await storage.getStudentProfiles();
      }
      
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profiles" });
    }
  });

  app.get("/api/student/profile/:id", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const profileId = Number(req.params.id);
      const profile = await storage.getStudentProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  app.patch("/api/student/profile/:id", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const profileId = Number(req.params.id);
      const profile = await storage.updateStudentProfile(profileId, req.body);
      
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student profile" });
    }
  });

  // Document upload and verification routes
  app.post("/api/student/document", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const studentProfile = await storage.getStudentProfileByUserId(req.user!.id);
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const documentData = {
        studentId: studentProfile.id,
        documentType: req.body.documentType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
      
      const validation = insertDocumentSchema.safeParse(documentData);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validation.error.errors });
      }
      
      const document = await storage.createDocument(validation.data);
      
      // Update student profile status
      if (documentData.documentType === "psa") {
        await storage.updateStudentProfile(studentProfile.id, { psaStatus: "pending" });
      } else if (documentData.documentType === "photo") {
        await storage.updateStudentProfile(studentProfile.id, { photoStatus: "pending" });
      }
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/student/documents", isAuthenticated, async (req, res) => {
    try {
      const studentProfile = await storage.getStudentProfileByUserId(req.user!.id);
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const documents = await storage.getDocumentsByStudentId(studentProfile.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const status = req.query.status as string;
      
      let documents;
      if (status) {
        documents = await storage.getDocumentsByStatus(status);
      } else {
        // Here you would need to implement a method to get all documents
        // This is a placeholder
        documents = [];
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.patch("/api/document/:id", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { status, feedback } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updatedDocument = await storage.updateDocument(documentId, {
        status,
        feedback,
        verifiedBy: req.user!.id
      });
      
      // Update student profile status
      const studentProfile = await storage.getStudentProfile(document.studentId);
      if (studentProfile) {
        if (document.documentType === "psa") {
          await storage.updateStudentProfile(studentProfile.id, { psaStatus: status });
        } else if (document.documentType === "photo") {
          await storage.updateStudentProfile(studentProfile.id, { photoStatus: status });
        }
        
        // Create notification for student
        await storage.createNotification({
          userId: studentProfile.userId,
          title: `Document ${status}`,
          message: `Your ${document.documentType} document has been ${status}${feedback ? `: ${feedback}` : '.'}`
        });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Award routes
  app.post("/api/student/award", isAuthenticated, upload.single("proofFile"), async (req, res) => {
    try {
      const studentProfile = await storage.getStudentProfileByUserId(req.user!.id);
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const awardData = {
        studentId: studentProfile.id,
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
      };
      
      // Add proof file if uploaded
      if (req.file) {
        Object.assign(awardData, {
          proofFileName: req.file.originalname,
          proofFilePath: req.file.path
        });
      }
      
      const validation = insertAwardSchema.safeParse(awardData);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid award data", errors: validation.error.errors });
      }
      
      const award = await storage.createAward(validation.data);
      
      // Update student profile status
      await storage.updateStudentProfile(studentProfile.id, { awardsStatus: "pending" });
      
      res.status(201).json(award);
    } catch (error) {
      res.status(500).json({ message: "Failed to create award" });
    }
  });

  app.get("/api/student/awards", isAuthenticated, async (req, res) => {
    try {
      const studentProfile = await storage.getStudentProfileByUserId(req.user!.id);
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const awards = await storage.getAwardsByStudentId(studentProfile.id);
      res.json(awards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch awards" });
    }
  });

  app.get("/api/awards", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const status = req.query.status as string;
      
      let awards;
      if (status) {
        awards = await storage.getAwardsByStatus(status);
      } else {
        // Here you would need to implement a method to get all awards
        // This is a placeholder
        awards = [];
      }
      
      res.json(awards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch awards" });
    }
  });

  app.patch("/api/award/:id", isAuthenticated, hasRole(["faculty", "admin", "superadmin"]), async (req, res) => {
    try {
      const awardId = Number(req.params.id);
      const { status, feedback } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const award = await storage.getAward(awardId);
      if (!award) {
        return res.status(404).json({ message: "Award not found" });
      }
      
      const updatedAward = await storage.updateAward(awardId, {
        status,
        feedback,
        verifiedBy: req.user!.id
      });
      
      // Update student profile status if needed
      // We would need to check if all awards are verified to update the overall status
      
      // Create notification for student
      const studentProfile = await storage.getStudentProfile(award.studentId);
      if (studentProfile) {
        await storage.createNotification({
          userId: studentProfile.userId,
          title: `Award ${status}`,
          message: `Your award "${award.name}" has been ${status}${feedback ? `: ${feedback}` : '.'}`
        });
      }
      
      res.json(updatedAward);
    } catch (error) {
      res.status(500).json({ message: "Failed to update award" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notification/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = Number(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
