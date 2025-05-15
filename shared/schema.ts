import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'faculty', 'admin', 'superadmin']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'approved', 'rejected']);
export const documentTypeEnum = pgEnum('document_type', ['psa', 'photo']);
export const awardTypeEnum = pgEnum('award_type', ['latin_honor', 'academic_achievement', 'department_award', 'special_recognition', 'other']);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('student').notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student profiles table
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentId: text("student_id").notNull().unique(),
  program: text("program").notNull(),
  department: text("department").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  placeOfBirth: text("place_of_birth").notNull(),
  sex: text("sex").notNull(),
  contactNumber: text("contact_number"),
  psaStatus: verificationStatusEnum("psa_status").default('pending'),
  photoStatus: verificationStatusEnum("photo_status").default('pending'),
  awardsStatus: verificationStatusEnum("awards_status").default('pending'),
  overallStatus: verificationStatusEnum("overall_status").default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: verificationStatusEnum("status").default('pending'),
  feedback: text("feedback"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Awards table
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: awardTypeEnum("type").notNull(),
  description: text("description"),
  proofFileName: text("proof_file_name"),
  proofFilePath: text("proof_file_path"),
  status: verificationStatusEnum("status").default('pending'),
  feedback: text("feedback"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  verifiedDocuments: many(documents, {
    fields: [users.id],
    references: [documents.verifiedBy],
  }),
  verifiedAwards: many(awards, {
    fields: [users.id],
    references: [awards.verifiedBy],
  }),
  notifications: many(notifications, {
    fields: [users.id],
    references: [notifications.userId],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  documents: many(documents, {
    fields: [studentProfiles.id],
    references: [documents.studentId],
  }),
  awards: many(awards, {
    fields: [studentProfiles.id],
    references: [awards.studentId],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [documents.studentId],
    references: [studentProfiles.id],
  }),
  verifier: one(users, {
    fields: [documents.verifiedBy],
    references: [users.id],
  }),
}));

export const awardsRelations = relations(awards, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [awards.studentId],
    references: [studentProfiles.id],
  }),
  verifier: one(users, {
    fields: [awards.verifiedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  psaStatus: true,
  photoStatus: true, 
  awardsStatus: true,
  overallStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  status: true,
  feedback: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardSchema = createInsertSchema(awards).omit({
  id: true,
  status: true,
  feedback: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types with relationships
export type UserWithProfile = User & {
  studentProfile?: StudentProfile;
};

export type StudentWithDocumentsAndAwards = StudentProfile & {
  user: User;
  documents: Document[];
  awards: Award[];
};

export type DocumentWithStudentAndVerifier = Document & {
  student: StudentProfile & { user: User };
  verifier?: User;
};

export type AwardWithStudentAndVerifier = Award & {
  student: StudentProfile & { user: User };
  verifier?: User;
};
