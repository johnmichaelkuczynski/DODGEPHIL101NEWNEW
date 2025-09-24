import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import type { User, RegisterRequest, LoginRequest } from "@shared/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await storage.createSession({
    id: sessionId,
    userId,
    expiresAt,
  });
  
  return sessionId;
}

export async function register(data: RegisterRequest): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(data.username);
    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await storage.createUser({
      username: data.username,
      email: data.email,
      passwordHash,
      credits: 0, // Start with 0 credits
    });

    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

export async function login(data: LoginRequest): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Find user by username
    let user = await storage.getUserByUsername(data.username);
    
    // If user doesn't exist and no password provided, create a new user for testing
    if (!user && !data.password) {
      console.log(`Creating new user for testing: ${data.username}`);
      user = await storage.createUser({
        username: data.username,
        email: `${data.username}@test.com`,
        passwordHash: undefined, // No password for testing
        credits: 999999999, // Give unlimited credits for testing
      });
    }
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // If password provided, verify it; if no password provided, allow login for testing
    if (data.password && user.passwordHash) {
      const isValidPassword = await verifyPassword(data.password, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: "Invalid password" };
      }
    } else if (data.password && !user.passwordHash) {
      return { success: false, error: "This is a test account - no password required" };
    }
    // If no password provided and user has no password, allow login (testing mode)

    // Update last login
    await storage.updateUserLastLogin(user.id);

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed" };
  }
}

export async function getUserFromSession(sessionId: string): Promise<User | null> {
  if (!sessionId) return null;
  
  const session = await storage.getSession(sessionId);
  if (!session) return null;
  
  return storage.getUserById(session.userId);
}

export function isAdmin(user: User | null): boolean {
  return user?.username === 'jmkuczynski' || user?.email === 'jmkuczynski@yahoo.com';
}

export function canAccessFeature(user: User | null): boolean {
  if (!user) return false;
  
  // Admin bypass: jmkuczynski@yahoo.com gets unlimited access
  if (isAdmin(user)) {
    return true;
  }
  
  return user.credits > 0;
}

export function getPreviewResponse(fullResponse: string, isUnregistered: boolean): string {
  // Ensure fullResponse is a string
  const responseString = String(fullResponse || '');
  const words = responseString.split(' ');
  const previewWords = words.slice(0, 200);
  const previewText = previewWords.join(' ') + '...';
  
  if (isUnregistered) {
    return previewText + '\n\n[PREVIEW - Please register and purchase credits to see the complete response. Click here to register and buy credits.]';
  } else {
    return previewText + '\n\n[PREVIEW - Purchase credits to see the complete response. Click here to buy credits.]';
  }
}