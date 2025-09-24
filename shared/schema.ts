import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  model: text("model").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  context: jsonb("context"),
});

export const instructions = pgTable("instructions", {
  id: serial("id").primaryKey(),
  instruction: text("instruction").notNull(),
  response: text("response").notNull(),
  model: text("model").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const rewrites = pgTable("rewrites", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  rewrittenText: text("rewritten_text").notNull(),
  instructions: text("instructions").notNull(),
  model: text("model").notNull(),
  chunkIndex: integer("chunk_index"),
  parentRewriteId: integer("parent_rewrite_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  instructions: text("instructions").notNull(),
  quiz: text("quiz").notNull(),
  model: text("model").notNull(),
  chunkIndex: integer("chunk_index"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const studyGuides = pgTable("study_guides", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  instructions: text("instructions").notNull(),
  studyGuide: text("study_guide").notNull(),
  model: text("model").notNull(),
  chunkIndex: integer("chunk_index"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const studentTests = pgTable("student_tests", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  instructions: text("instructions").notNull(),
  test: text("test").notNull(),
  model: text("model").notNull(),
  chunkIndex: integer("chunk_index"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"), // Made optional for password-free testing
  credits: integer("credits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const diagnosticQuestions = pgTable("diagnostic_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionHash: text("question_hash").notNull(),
  questionText: text("question_text").notNull(),
  servedAt: timestamp("served_at").defaultNow().notNull(),
});

export const diagnosticAnswers = pgTable("diagnostic_answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionData: jsonb("question_data").notNull(), // Full question JSON
  studentAnswer: text("student_answer").notNull(),
  verdict: text("verdict").notNull(), // correct, partial, incorrect
  score: real("score").notNull(),
  rationale: text("rationale").notNull(),
  isContested: boolean("is_contested").default(false),
  contestReason: text("contest_reason"),
  contestedScore: real("contested_score"),
  contestedRationale: text("contested_rationale"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const practiceHomeworkGrades = pgTable("practice_homework_grades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  weekNumber: integer("week_number").notNull(),
  totalScore: integer("total_score").notNull(),
  maxPoints: integer("max_points").notNull(),
  letterGrade: text("letter_grade").notNull(),
  overallFeedback: text("overall_feedback").notNull(),
  questionGrades: jsonb("question_grades").notNull(), // Store array of question feedback
  answers: jsonb("answers").notNull(), // Store user answers
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const homeworkGrades = pgTable("homework_grades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  weekNumber: integer("week_number").notNull(),
  totalScore: integer("total_score").notNull(),
  maxPoints: integer("max_points").notNull(),
  letterGrade: text("letter_grade").notNull(),
  overallFeedback: text("overall_feedback").notNull(),
  questionGrades: jsonb("question_grades").notNull(), // Store array of question feedback
  answers: jsonb("answers").notNull(), // Store user answers
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: text("amount").notNull(), // PayPal amount as string
  credits: integer("credits").notNull(),
  paypalOrderId: text("paypal_order_id"),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  studentTestId: integer("student_test_id").notNull(),
  userAnswers: text("user_answers").notNull(), // JSON string of user answers
  correctAnswers: text("correct_answers").notNull(), // JSON string of correct answers
  score: integer("score").notNull(), // percentage score
  totalQuestions: integer("total_questions").notNull(),
  correctCount: integer("correct_count").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const podcasts = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  instructions: text("instructions"),
  script: text("script").notNull(),
  audioPath: text("audio_path"),
  hasAudio: boolean("has_audio").default(false).notNull(),
  model: text("model").notNull(),
  chunkIndex: integer("chunk_index"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Course-specific tables
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  assignmentType: text("assignment_type").notNull(), // "homework", "quiz", "midterm", "final"
  title: text("title").notNull(),
  content: text("content").notNull(), // LLM-generated content
  questions: jsonb("questions").notNull(), // Array of questions with answers
  maxPoints: integer("max_points").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assignmentId: integer("assignment_id").notNull(),
  content: text("content").notNull(), // Student's submission text
  gptZeroScore: integer("gpt_zero_score"), // GPTZero AI detection score (0-100)
  grade: integer("grade"), // Points awarded
  feedback: text("feedback"), // LLM-generated feedback
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  gradedAt: timestamp("graded_at"),
  isLate: boolean("is_late").default(false).notNull(),
});

export const practiceAttempts = pgTable("practice_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  practiceType: text("practice_type").notNull(), // "homework", "test", "midterm", "final"
  weekNumber: integer("week_number"),
  content: text("content").notNull(),
  questions: jsonb("questions").notNull(),
  userAnswers: jsonb("user_answers"),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const lectures = pgTable("lectures", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // LLM-generated lecture summary
  linkedSection: text("linked_section"), // Living Book section ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});





// Insert schemas
export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  message: true,
  response: true,
  model: true,
  context: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  gradedAt: true,
});

export const insertPracticeAttemptSchema = createInsertSchema(practiceAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertLectureSchema = createInsertSchema(lectures).omit({
  id: true,
  createdAt: true,
});

export const insertInstructionSchema = createInsertSchema(instructions).pick({
  instruction: true,
  response: true,
  model: true,
});

export const insertRewriteSchema = createInsertSchema(rewrites).pick({
  originalText: true,
  rewrittenText: true,
  instructions: true,
  model: true,
  chunkIndex: true,
  parentRewriteId: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  sourceText: true,
  instructions: true,
  quiz: true,
  model: true,
  chunkIndex: true,
});

export const insertStudyGuideSchema = createInsertSchema(studyGuides).pick({
  sourceText: true,
  instructions: true,
  studyGuide: true,
  model: true,
  chunkIndex: true,
});

export const insertStudentTestSchema = createInsertSchema(studentTests).pick({
  sourceText: true,
  instructions: true,
  test: true,
  model: true,
  chunkIndex: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
  credits: true,
}).extend({
  passwordHash: z.string().optional(), // Make password optional for testing
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  id: true,
  userId: true,
  expiresAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  amount: true,
  credits: true,
  paypalOrderId: true,
  status: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).pick({
  userId: true,
  studentTestId: true,
  userAnswers: true,
  correctAnswers: true,
  score: true,
  totalQuestions: true,
  correctCount: true,
});

export const insertDiagnosticAnswerSchema = createInsertSchema(diagnosticAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertPodcastSchema = createInsertSchema(podcasts).pick({
  sourceText: true,
  instructions: true,
  script: true,
  audioPath: true,
  hasAudio: true,
  model: true,
  chunkIndex: true,
});





// Types
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Instruction = typeof instructions.$inferSelect;
export type InsertInstruction = z.infer<typeof insertInstructionSchema>;
export type Rewrite = typeof rewrites.$inferSelect;
export type InsertRewrite = z.infer<typeof insertRewriteSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type StudyGuide = typeof studyGuides.$inferSelect;
export type InsertStudyGuide = z.infer<typeof insertStudyGuideSchema>;
export type StudentTest = typeof studentTests.$inferSelect;
export type InsertStudentTest = z.infer<typeof insertStudentTestSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;



// AI Models
export type AIModel = "deepseek" | "openai" | "anthropic" | "perplexity";

// Request schemas
export const chatRequestSchema = z.object({
  message: z.string(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
});

export const instructionRequestSchema = z.object({
  instruction: z.string(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
});

export const rewriteRequestSchema = z.object({
  originalText: z.string().optional(), // Optional when using sectionReference
  instructions: z.string(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
  chunkIndex: z.number().optional(),
  parentRewriteId: z.number().optional(),
  sectionReference: z.string().optional(), // For referencing parts like "Chapter 2", "Section 3.1", etc.
  fullDocumentText: z.string().optional(), // Full document when using sectionReference
});

export const quizRequestSchema = z.object({
  sourceText: z.string(),
  instructions: z.string().optional(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
  chunkIndex: z.number().optional(),
});

export const studyGuideRequestSchema = z.object({
  sourceText: z.string(),
  instructions: z.string().optional(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
  chunkIndex: z.number().optional(),
});

export const studentTestRequestSchema = z.object({
  sourceText: z.string(),
  instructions: z.string().optional(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
  chunkIndex: z.number().optional(),
  questionTypes: z.array(z.enum(["multiple_choice", "short_answer", "long_answer"])).optional(),
  questionCount: z.number().min(1).max(30).optional(),
});

export const submitTestRequestSchema = z.object({
  studentTestId: z.number(),
  userAnswers: z.record(z.string()), // question index -> user answer
  questionTypes: z.record(z.enum(["multiple_choice", "short_answer", "long_answer"])).optional(),
});

export const podcastRequestSchema = z.object({
  sourceText: z.string(),
  instructions: z.string().optional(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
  chunkIndex: z.number().nullable().optional(),
  format: z.enum(["normal_single", "normal_dialogue", "custom_single", "custom_dialogue"]).optional(),
});



export const registerRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(3),
  email: z.string().email().optional(),
});

export const loginRequestSchema = z.object({
  username: z.string(),
  password: z.string().optional(), // Made optional for password-free testing
});

export const purchaseRequestSchema = z.object({
  amount: z.string(), // PayPal amount as string
  credits: z.number().min(1),
  currency: z.string().default("USD"),
});



// Export request types
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type InstructionRequest = z.infer<typeof instructionRequestSchema>;
export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;
export type QuizRequest = z.infer<typeof quizRequestSchema>;
export type StudyGuideRequest = z.infer<typeof studyGuideRequestSchema>;
export type StudentTestRequest = z.infer<typeof studentTestRequestSchema>;
export type PodcastRequest = z.infer<typeof podcastRequestSchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
