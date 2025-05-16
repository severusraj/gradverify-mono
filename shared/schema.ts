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
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Submissions table (for student submissions)
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id),
  psaUrl: text('psa_url'),
  photoUrl: text('photo_url'),
  status: text('status').notNull(), // 'pending', 'approved', 'rejected'
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Awards table
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").references(() => submissions.id),
  name: text("name").notNull(),
  proofUrl: text("proof_url"),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected'
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification logs
export const verificationLogs = pgTable('verification_logs', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').references(() => submissions.id),
  adminId: integer('admin_id').references(() => users.id),
  action: text('action').notNull(), // 'approve', 'reject'
  details: json('details'),
  createdAt: timestamp('created_at').defaultNow(),
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
  verifiedDocuments: many(documents),
  verifiedAwards: many(awards),
  notifications: many(notifications),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  documents: many(documents),
  awards: many(awards),
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
  submission: one(submissions, {
    fields: [awards.submissionId],
    references: [submissions.id],
  }),
  verifier: one(users, {
    fields: [awards.submissionId],
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

export const insertStudentProfileSchema = createInsertSchema(studentProfiles)
  .omit({
    id: true,
    psaStatus: true,
    photoStatus: true, 
    awardsStatus: true,
    overallStatus: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial({
    userId: true,  // Make userId optional for form validation
  });

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  status: true,
  feedback: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  status: true,
  feedback: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardSchema = createInsertSchema(awards).omit({
  id: true,
  status: true,
  feedback: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogs).omit({
  id: true,
  createdAt: true,
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

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;

export type VerificationLog = typeof verificationLogs.$inferSelect;
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;

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
  submission: Submission & { student: StudentProfile & { user: User } };
  verifier?: User;
};
