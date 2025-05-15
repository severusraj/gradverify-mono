import { 
  users, 
  studentProfiles, 
  documents,
  awards,
  notifications, 
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
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  getDocumentsByStatus(status: string): Promise<Document[]>;
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
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
    const [studentProfile] = await db.insert(studentProfiles).values(profile).returning();
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

  async getDocumentsByStatus(status: string): Promise<Document[]> {
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
    return await db.select().from(awards).where(eq(awards.studentId, studentId));
  }

  async getAwardsByStatus(status: string): Promise<Award[]> {
    return await db.select().from(awards).where(eq(awards.status, status));
  }

  async createAward(award: InsertAward): Promise<Award> {
    const [newAward] = await db.insert(awards).values(award).returning();
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
    // Count total students
    const [{ count: totalStudents }] = await db
      .select({ count: db.fn.count() })
      .from(studentProfiles);

    // Count pending verifications
    const [{ count: pendingVerifications }] = await db
      .select({ count: db.fn.count() })
      .from(studentProfiles)
      .where(eq(studentProfiles.overallStatus, 'pending'));

    // Count approved records
    const [{ count: approvedRecords }] = await db
      .select({ count: db.fn.count() })
      .from(studentProfiles)
      .where(eq(studentProfiles.overallStatus, 'approved'));

    // Count rejected records
    const [{ count: rejectedRecords }] = await db
      .select({ count: db.fn.count() })
      .from(studentProfiles)
      .where(eq(studentProfiles.overallStatus, 'rejected'));

    return {
      totalStudents: Number(totalStudents),
      pendingVerifications: Number(pendingVerifications),
      approvedRecords: Number(approvedRecords),
      rejectedRecords: Number(rejectedRecords)
    };
  }

  async getDepartmentProgress(): Promise<any[]> {
    // Get all departments
    const departments = await db
      .select({ department: studentProfiles.department })
      .from(studentProfiles)
      .groupBy(studentProfiles.department);

    const results = [];

    for (const { department } of departments) {
      // Count total students in department
      const [{ count: total }] = await db
        .select({ count: db.fn.count() })
        .from(studentProfiles)
        .where(eq(studentProfiles.department, department));

      // Count approved students in department
      const [{ count: approved }] = await db
        .select({ count: db.fn.count() })
        .from(studentProfiles)
        .where(and(
          eq(studentProfiles.department, department),
          eq(studentProfiles.overallStatus, 'approved')
        ));

      const percentComplete = Math.round((Number(approved) / Number(total)) * 100);
      
      results.push({
        department,
        percentComplete,
        total: Number(total),
        approved: Number(approved)
      });
    }

    return results;
  }

  async getRecentSubmissions(limit: number = 10): Promise<any[]> {
    const studentProfilesWithUsers = await db
      .select({
        id: studentProfiles.id,
        studentId: studentProfiles.studentId,
        program: studentProfiles.program,
        department: studentProfiles.department,
        psaStatus: studentProfiles.psaStatus,
        photoStatus: studentProfiles.photoStatus,
        awardsStatus: studentProfiles.awardsStatus,
        updatedAt: studentProfiles.updatedAt,
        userId: studentProfiles.userId,
        fullName: users.fullName
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .orderBy(desc(studentProfiles.updatedAt))
      .limit(limit);

    return studentProfilesWithUsers;
  }
}

export const storage = new DatabaseStorage();
