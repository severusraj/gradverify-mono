import { 
  users, 
  studentProfiles, 
  documents,
  awards,
  notifications, 
  submissions,
  type User,
  type InsertUser, 
  type StudentProfile,
  type InsertStudentProfile,
  type Document,
  type InsertDocument,
  type Award,
  type InsertAward,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPgSimple(session);

export interface IStorage {
  // User operations
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Student profile operations
  getStudentProfile(id: number): Promise<StudentProfile | undefined>;
  getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined>;
  getStudentProfiles(): Promise<StudentProfile[]>;
  getStudentProfilesByDepartment(department: string): Promise<StudentProfile[]>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: number, profile: Partial<StudentProfile>): Promise<StudentProfile | undefined>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByStudentId(studentId: number): Promise<Document[]>;
  getDocumentsByStatus(status: "pending" | "approved" | "rejected"): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  
  // Award operations
  getAward(id: number): Promise<Award | undefined>;
  getAwardsByStudentId(studentId: number): Promise<Award[]>;
  getAwardsByStatus(status: string): Promise<Award[]>;
  createAward(award: InsertAward): Promise<Award>;
  updateAward(id: number, award: Partial<Award>): Promise<Award | undefined>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Dashboard stats
  getDashboardStats(): Promise<any>;
  getDepartmentProgress(): Promise<any[]>;
  getRecentSubmissions(limit?: number): Promise<any[]>;
  
  // Session store
  sessionStore: any; // Using any since express-session's SessionStore type isn't properly exported
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use PostgreSQL session store for production
    if (process.env.NODE_ENV === 'production') {
      this.sessionStore = new PostgresSessionStore({ 
        pool: pool as any, 
        createTableIfMissing: true
      });
    } else {
      // Use in-memory session store for development
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      });
    }
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Student profile operations
  async getStudentProfile(id: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, id));
    return profile;
  }

  async getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return profile;
  }

  async getStudentProfiles(): Promise<StudentProfile[]> {
    return await db.select().from(studentProfiles);
  }

  async getStudentProfilesByDepartment(department: string): Promise<StudentProfile[]> {
    return await db.select().from(studentProfiles).where(eq(studentProfiles.department, department));
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    if (!profile.userId) throw new Error('userId is required');
    const [studentProfile] = await db.insert(studentProfiles).values(profile as Required<InsertStudentProfile>).returning();
    return studentProfile;
  }

  async updateStudentProfile(id: number, profileData: Partial<StudentProfile>): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .update(studentProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(studentProfiles.id, id))
      .returning();
    return profile;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByStudentId(studentId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.studentId, studentId));
  }

  async getDocumentsByStatus(status: "pending" | "approved" | "rejected"): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, status));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  // Award operations
  async getAward(id: number): Promise<Award | undefined> {
    const [award] = await db.select().from(awards).where(eq(awards.id, id));
    return award;
  }

  async getAwardsByStudentId(studentId: number): Promise<Award[]> {
    return [];
  }

  async getAwardsByStatus(status: string): Promise<Award[]> {
    return await db.select().from(awards).where(eq(awards.status, status));
  }

  async createAward(award: InsertAward): Promise<Award> {
    const awardWithStatus = { ...award, status: 'pending' };
    const [newAward] = await db.insert(awards).values(awardWithStatus).returning();
    return newAward;
  }

  async updateAward(id: number, awardData: Partial<Award>): Promise<Award | undefined> {
    const [award] = await db
      .update(awards)
      .set({ ...awardData, updatedAt: new Date() })
      .where(eq(awards.id, id))
      .returning();
    return award;
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    try {
      // Count total students
      const allProfiles = await db.select().from(studentProfiles);
      const totalStudents = allProfiles.length;
      
      // Count verifications by status
      const pendingVerifications = allProfiles.filter(
        profile => profile.overallStatus === 'pending'
      ).length;
      
      const approvedRecords = allProfiles.filter(
        profile => profile.overallStatus === 'approved'
      ).length;
      
      const rejectedRecords = allProfiles.filter(
        profile => profile.overallStatus === 'rejected'
      ).length;

      return {
        totalStudents,
        pendingVerifications,
        approvedRecords,
        rejectedRecords
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return default stats to prevent errors
      return {
        totalStudents: 0,
        pendingVerifications: 0,
        approvedRecords: 0,
        rejectedRecords: 0
      };
    }
  }

  async getDepartmentProgress(): Promise<any[]> {
    try {
      // Get all student profiles
      const allProfiles = await db.select().from(studentProfiles);
      
      // Get unique departments
      const departmentSet = new Set<string>();
      allProfiles.forEach(profile => {
        if (profile.department) {
          departmentSet.add(profile.department);
        }
      });
      
      const departments = Array.from(departmentSet);
      const results = [];

      for (const department of departments) {
        // Count total students in department
        const departmentProfiles = allProfiles.filter(
          profile => profile.department === department
        );
        
        const total = departmentProfiles.length;
        
        // Count approved students in department
        const approved = departmentProfiles.filter(
          profile => profile.overallStatus === 'approved'
        ).length;

        const percentComplete = total > 0 
          ? Math.round((approved / total) * 100) 
          : 0;
        
        results.push({
          department,
          percentComplete,
          total,
          approved
        });
      }

      return results;
    } catch (error) {
      console.error('Error getting department progress:', error);
      return [];
    }
  }

  async getRecentSubmissions(limit: number = 10): Promise<any[]> {
    try {
      // Fetch all student profiles
      const allProfiles = await db.select().from(studentProfiles);
      const allUsers = await db.select().from(users);
      
      // Create a map of user IDs to user objects for easy lookup
      const userMap = new Map();
      allUsers.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Join the data manually
      const submissionsWithUsers = allProfiles.map(profile => {
        const user = userMap.get(profile.userId);
        return {
          id: profile.id,
          studentId: profile.studentId,
          program: profile.program,
          department: profile.department,
          psaStatus: profile.psaStatus,
          photoStatus: profile.photoStatus,
          awardsStatus: profile.awardsStatus,
          updatedAt: profile.updatedAt,
          userId: profile.userId,
          fullName: user ? user.fullName : 'Unknown User'
        };
      });
      
      // Sort by updatedAt in descending order
      submissionsWithUsers.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      // Return only the requested number of submissions
      return submissionsWithUsers.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent submissions:', error);
      return [];
    }
  }

  async getSubmission(id: number): Promise<any | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }
}

export const storage = new DatabaseStorage();
