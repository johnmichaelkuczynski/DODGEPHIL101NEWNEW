import { chatMessages, instructions, rewrites, quizzes, studyGuides, studentTests, users, sessions, purchases, testResults, podcasts, practiceAttempts, diagnosticAnswers } from "@shared/schema";
import type { ChatMessage, InsertChatMessage, Instruction, InsertInstruction, Rewrite, InsertRewrite, Quiz, InsertQuiz, StudyGuide, InsertStudyGuide, StudentTest, InsertStudentTest, User, InsertUser, Session, InsertSession, Purchase, InsertPurchase, TestResult, InsertTestResult, Podcast, InsertPodcast } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  testConnection(): Promise<boolean>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  clearChatMessages(): Promise<void>;
  createInstruction(instruction: InsertInstruction): Promise<Instruction>;
  getInstructions(): Promise<Instruction[]>;
  createRewrite(rewrite: InsertRewrite): Promise<Rewrite>;
  getRewrites(): Promise<Rewrite[]>;
  getRewriteById(id: number): Promise<Rewrite | null>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | null>;
  createStudyGuide(studyGuide: InsertStudyGuide): Promise<StudyGuide>;
  getStudyGuides(): Promise<StudyGuide[]>;
  getStudyGuideById(id: number): Promise<StudyGuide | null>;
  createStudentTest(studentTest: InsertStudentTest): Promise<StudentTest>;
  getStudentTests(): Promise<StudentTest[]>;
  getStudentTestById(id: number): Promise<StudentTest | null>;
  
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateUserCredits(userId: number, credits: number): Promise<User | null>;
  updateUserLastLogin(userId: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  resetUserPassword(username: string, passwordHash: string): Promise<User | null>;
  
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Purchase management
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByUserId(userId: number): Promise<Purchase[]>;
  updatePurchaseStatus(purchaseId: number, status: string): Promise<void>;
  
  // Test results management
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  getTestResultsByUserId(userId: number): Promise<TestResult[]>;
  getTestResultsByStudentTestId(studentTestId: number): Promise<TestResult[]>;
  
  // Podcast management
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcasts(): Promise<Podcast[]>;
  getPodcastById(id: number): Promise<Podcast | null>;

  // Practice attempts management
  createPracticeAttempt(attempt: any): Promise<any>;
  getPracticeAttemptsByUserId(userId: number): Promise<any[]>;

  // Diagnostic answers management
  getDiagnosticAnswersByUserId(userId: number, limit?: number): Promise<any[]>;

}

export class MemStorage implements IStorage {
  private chatMessages: Map<number, ChatMessage>;
  private instructions: Map<number, Instruction>;
  private rewrites: Map<number, Rewrite>;
  private quizzes: Map<number, Quiz>;
  private studyGuides: Map<number, StudyGuide>;
  private studentTests: Map<number, StudentTest>;
  private users: Map<number, User>;
  private usersByUsername: Map<string, User>;
  private sessions: Map<string, Session>;
  private purchases: Map<number, Purchase>;
  private currentChatId: number;
  private currentInstructionId: number;
  private currentRewriteId: number;
  private currentQuizId: number;
  private currentStudyGuideId: number;
  private currentStudentTestId: number;
  private currentUserId: number;
  private currentPurchaseId: number;
  private podcasts: Map<number, Podcast>;
  private currentPodcastId: number;

  constructor() {
    this.chatMessages = new Map();
    this.instructions = new Map();
    this.rewrites = new Map();
    this.quizzes = new Map();
    this.studyGuides = new Map();
    this.podcasts = new Map();
    this.studentTests = new Map();
    this.users = new Map();
    this.usersByUsername = new Map();
    this.sessions = new Map();
    this.purchases = new Map();
    this.currentChatId = 1;
    this.currentInstructionId = 1;
    this.currentRewriteId = 1;
    this.currentQuizId = 1;
    this.currentStudyGuideId = 1;
    this.currentStudentTestId = 1;
    this.currentUserId = 1;
    this.currentPurchaseId = 1;
    this.currentPodcastId = 1;
  }

  async testConnection(): Promise<boolean> {
    // Memory storage doesn't require a connection test
    return true;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }

  async createInstruction(insertInstruction: InsertInstruction): Promise<Instruction> {
    const id = this.currentInstructionId++;
    const instruction: Instruction = {
      ...insertInstruction,
      id,
      timestamp: new Date(),
    };
    this.instructions.set(id, instruction);
    return instruction;
  }

  async getInstructions(): Promise<Instruction[]> {
    return Array.from(this.instructions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createRewrite(insertRewrite: InsertRewrite): Promise<Rewrite> {
    const id = this.currentRewriteId++;
    const rewrite: Rewrite = {
      ...insertRewrite,
      id,
      timestamp: new Date(),
    };
    this.rewrites.set(id, rewrite);
    return rewrite;
  }

  async getRewrites(): Promise<Rewrite[]> {
    return Array.from(this.rewrites.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRewriteById(id: number): Promise<Rewrite | null> {
    return this.rewrites.get(id) || null;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      timestamp: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getQuizById(id: number): Promise<Quiz | null> {
    return this.quizzes.get(id) || null;
  }

  async createStudyGuide(insertStudyGuide: InsertStudyGuide): Promise<StudyGuide> {
    const id = this.currentStudyGuideId++;
    const studyGuide: StudyGuide = {
      ...insertStudyGuide,
      id,
      timestamp: new Date(),
    };
    this.studyGuides.set(id, studyGuide);
    return studyGuide;
  }

  async getStudyGuides(): Promise<StudyGuide[]> {
    return Array.from(this.studyGuides.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getStudyGuideById(id: number): Promise<StudyGuide | null> {
    return this.studyGuides.get(id) || null;
  }

  async createStudentTest(insertStudentTest: InsertStudentTest): Promise<StudentTest> {
    const id = this.currentStudentTestId++;
    const studentTest: StudentTest = {
      ...insertStudentTest,
      id,
      timestamp: new Date(),
    };
    this.studentTests.set(id, studentTest);
    return studentTest;
  }

  async getStudentTests(): Promise<StudentTest[]> {
    return Array.from(this.studentTests.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getStudentTestById(id: number): Promise<StudentTest | null> {
    return this.studentTests.get(id) || null;
  }

  // User management methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Give admin unlimited credits, or testing users unlimited credits if no password
    const credits = insertUser.username === 'jmkuczynski' || !insertUser.passwordHash ? 999999999 : (insertUser.credits || 0);
    const user: User = {
      ...insertUser,
      id,
      credits,
      passwordHash: insertUser.passwordHash || '', // Default to empty string for compatibility
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.usersByUsername.get(username) || null;
  }

  async updateUserCredits(userId: number, credits: number): Promise<User | null> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, credits };
      this.users.set(userId, updatedUser);
      this.usersByUsername.set(user.username, updatedUser);
      return updatedUser;
    }
    return null;
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date() };
      this.users.set(userId, updatedUser);
      this.usersByUsername.set(user.username, updatedUser);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.usersByUsername.delete(user.username);
    }
  }

  async resetUserPassword(username: string, passwordHash: string): Promise<User | null> {
    const user = this.usersByUsername.get(username);
    if (user) {
      const updatedUser = { ...user, passwordHash, credits: 999999999 };
      this.users.set(user.id, updatedUser);
      this.usersByUsername.set(username, updatedUser);
      return updatedUser;
    }
    return null;
  }

  // Session management methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      ...insertSession,
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(sessionId);
    }
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  // Purchase management methods
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getPurchasesByUserId(userId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updatePurchaseStatus(purchaseId: number, status: string): Promise<void> {
    const purchase = this.purchases.get(purchaseId);
    if (purchase) {
      const updatedPurchase = { ...purchase, status };
      this.purchases.set(purchaseId, updatedPurchase);
    }
  }

  // Test results management (not implemented in MemStorage)
  async createTestResult(testResult: InsertTestResult): Promise<TestResult> {
    throw new Error("Test results not supported in memory storage");
  }

  async getTestResultsByUserId(userId: number): Promise<TestResult[]> {
    return [];
  }

  async getTestResultsByStudentTestId(studentTestId: number): Promise<TestResult[]> {
    return [];
  }

  // Podcast management methods
  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const id = this.currentPodcastId++;
    const podcast: Podcast = {
      ...insertPodcast,
      id,
      timestamp: new Date(),
    };
    this.podcasts.set(id, podcast);
    return podcast;
  }

  async getPodcasts(): Promise<Podcast[]> {
    return Array.from(this.podcasts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getPodcastById(id: number): Promise<Podcast | null> {
    return this.podcasts.get(id) || null;
  }

  // Practice attempts management (not implemented in MemStorage)
  async createPracticeAttempt(attempt: any): Promise<any> {
    throw new Error("Practice attempts not supported in memory storage");
  }

  async getPracticeAttemptsByUserId(userId: number): Promise<any[]> {
    return [];
  }

  async getDiagnosticAnswersByUserId(userId: number, limit?: number): Promise<any[]> {
    return [];
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async testConnection(): Promise<boolean> {
    try {
      // Test connection by attempting to query users table
      const result = await db.select().from(users).limit(1);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values({
      ...insertMessage,
      context: insertMessage.context || null
    }).returning();
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.timestamp));
  }

  async clearChatMessages(): Promise<void> {
    await db.delete(chatMessages);
  }

  async createInstruction(insertInstruction: InsertInstruction): Promise<Instruction> {
    const [instruction] = await db.insert(instructions).values(insertInstruction).returning();
    return instruction;
  }

  async getInstructions(): Promise<Instruction[]> {
    return await db.select().from(instructions).orderBy(desc(instructions.timestamp));
  }

  async createRewrite(insertRewrite: InsertRewrite): Promise<Rewrite> {
    const [rewrite] = await db.insert(rewrites).values({
      ...insertRewrite,
      chunkIndex: insertRewrite.chunkIndex ?? null,
      parentRewriteId: insertRewrite.parentRewriteId ?? null
    }).returning();
    return rewrite;
  }

  async getRewrites(): Promise<Rewrite[]> {
    return await db.select().from(rewrites).orderBy(desc(rewrites.timestamp));
  }

  async getRewriteById(id: number): Promise<Rewrite | null> {
    const [rewrite] = await db.select().from(rewrites).where(eq(rewrites.id, id));
    return rewrite || null;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values({
      ...insertQuiz,
      chunkIndex: insertQuiz.chunkIndex ?? null
    }).returning();
    return quiz;
  }

  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.timestamp));
  }

  async getQuizById(id: number): Promise<Quiz | null> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || null;
  }

  async createStudyGuide(insertStudyGuide: InsertStudyGuide): Promise<StudyGuide> {
    const [studyGuide] = await db.insert(studyGuides).values({
      ...insertStudyGuide,
      chunkIndex: insertStudyGuide.chunkIndex ?? null
    }).returning();
    return studyGuide;
  }

  async getStudyGuides(): Promise<StudyGuide[]> {
    return await db.select().from(studyGuides).orderBy(desc(studyGuides.timestamp));
  }

  async getStudyGuideById(id: number): Promise<StudyGuide | null> {
    const [studyGuide] = await db.select().from(studyGuides).where(eq(studyGuides.id, id));
    return studyGuide || null;
  }

  async createStudentTest(insertStudentTest: InsertStudentTest): Promise<StudentTest> {
    const [studentTest] = await db.insert(studentTests).values({
      ...insertStudentTest,
      chunkIndex: insertStudentTest.chunkIndex ?? null
    }).returning();
    return studentTest;
  }

  async getStudentTests(): Promise<StudentTest[]> {
    return await db.select().from(studentTests).orderBy(desc(studentTests.timestamp));
  }

  async getStudentTestById(id: number): Promise<StudentTest | null> {
    const [studentTest] = await db.select().from(studentTests).where(eq(studentTests.id, id));
    return studentTest || null;
  }

  // User management methods with admin support
  async createUser(insertUser: InsertUser): Promise<User> {
    // Give admin unlimited credits, or testing users unlimited credits if no password
    const credits = insertUser.username === 'jmkuczynski' || !insertUser.passwordHash ? 999999999 : (insertUser.credits || 0);
    const [user] = await db.insert(users).values({
      ...insertUser,
      credits,
      passwordHash: insertUser.passwordHash || null
    }).returning();
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async updateUserCredits(userId: number, credits: number): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ credits })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async resetUserPassword(username: string, passwordHash: string): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ passwordHash, credits: 999999999 })
      .where(eq(users.username, username))
      .returning();
    return user || null;
  }

  // Session management methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      await this.deleteSession(sessionId);
    }
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  // Purchase management methods
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values({
      ...insertPurchase,
      status: insertPurchase.status || "pending",
      paypalOrderId: insertPurchase.paypalOrderId ?? null
    }).returning();
    return purchase;
  }

  async getPurchasesByUserId(userId: number): Promise<Purchase[]> {
    return await db.select().from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));
  }

  async updatePurchaseStatus(purchaseId: number, status: string): Promise<void> {
    await db.update(purchases)
      .set({ status })
      .where(eq(purchases.id, purchaseId));
  }

  // Test results management methods
  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const [testResult] = await db.insert(testResults).values(insertTestResult).returning();
    return testResult;
  }

  async getTestResultsByUserId(userId: number): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt));
  }

  async getTestResultsByStudentTestId(studentTestId: number): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(eq(testResults.studentTestId, studentTestId))
      .orderBy(desc(testResults.completedAt));
  }

  // Podcast management methods
  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const [podcast] = await db.insert(podcasts).values({
      ...insertPodcast,
      audioPath: insertPodcast.audioPath ?? null,
      hasAudio: insertPodcast.hasAudio ?? false,
      chunkIndex: insertPodcast.chunkIndex ?? null
    }).returning();
    return podcast;
  }

  async getPodcasts(): Promise<Podcast[]> {
    return await db.select().from(podcasts).orderBy(desc(podcasts.timestamp));
  }

  async getPodcastById(id: number): Promise<Podcast | null> {
    const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return podcast || null;
  }

  async updatePodcast(id: number, updates: Partial<Pick<Podcast, 'sourceText' | 'script' | 'audioPath' | 'hasAudio'>>): Promise<Podcast | null> {
    const [podcast] = await db.update(podcasts)
      .set(updates)
      .where(eq(podcasts.id, id))
      .returning();
    return podcast || null;
  }

  // Practice attempts management methods
  async createPracticeAttempt(insertAttempt: any): Promise<any> {
    const [attempt] = await db.insert(practiceAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getPracticeAttemptsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(practiceAttempts)
      .where(eq(practiceAttempts.userId, userId))
      .orderBy(desc(practiceAttempts.completedAt));
  }

  // Diagnostic answers management methods
  async getDiagnosticAnswersByUserId(userId: number, limit: number = 20): Promise<any[]> {
    const query = db.select().from(diagnosticAnswers)
      .where(eq(diagnosticAnswers.userId, userId))
      .orderBy(desc(diagnosticAnswers.createdAt));
    
    if (limit > 0) {
      return await query.limit(limit);
    }
    
    return await query;
  }

}

export const storage = new DatabaseStorage();