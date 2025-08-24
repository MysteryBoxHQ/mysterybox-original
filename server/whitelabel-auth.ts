import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { whitelabelSites, whitelabelUsers, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Whitelabel authentication middleware
export interface WhitelabelRequest extends Request {
  whitelabelUser?: {
    id: number;
    username: string;
    email?: string;
    usdBalance: string;
    level: number;
    experience: number;
    whitelabelId: string;
    isAdmin: boolean;
  };
  whitelabelSite?: {
    id: number;
    whitelabelId: string;
    displayName: string;
    status: string;
    brandingConfig: any;
    contentConfig: any;
    featureConfig: any;
  };
}

// Get current whitelabel site from hostname or query parameter
export async function detectWhitelabel(req: Request, res: Response, next: NextFunction) {
  try {
    // For demo purposes, use "rollingdrop-demo" as the whitelabel ID
    // In production, this would be detected from hostname/subdomain
    const whitelabelId = req.query.whitelabel as string || "rollingdrop-demo";
    
    // Get whitelabel site configuration
    const whitelabelSite = await db
      .select()
      .from(whitelabelSites)
      .where(eq(whitelabelSites.whitelabelId, whitelabelId))
      .limit(1);
    
    if (whitelabelSite.length > 0) {
      (req as WhitelabelRequest).whitelabelSite = {
        id: whitelabelSite[0].id,
        whitelabelId: whitelabelSite[0].whitelabelId,
        displayName: whitelabelSite[0].displayName,
        status: whitelabelSite[0].status || 'active',
        brandingConfig: whitelabelSite[0].brandingConfig,
        contentConfig: whitelabelSite[0].contentConfig,
        featureConfig: whitelabelSite[0].featureConfig
      };
    }
    
    next();
  } catch (error) {
    console.error('Error detecting whitelabel:', error);
    next();
  }
}

// Check if user is authenticated for whitelabel
export function requireWhitelabelAuth(req: WhitelabelRequest, res: Response, next: NextFunction) {
  if (!req.session.whitelabelUser) {
    return res.status(401).json({ 
      error: 'Authentication required',
      loginRequired: true 
    });
  }
  
  req.whitelabelUser = req.session.whitelabelUser;
  next();
}

// Simple username/password authentication for whitelabel
export async function authenticateWhitelabelUser(whitelabelId: string, username: string, password: string) {
  try {
    // Special handling for test user
    if (username === "testplayer" && password === "demo") {
      const testUser = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          usdBalance: users.usdBalance,
          level: users.level,
          experience: users.experience,
          isAdmin: users.isAdmin,
        })
        .from(users)
        .innerJoin(whitelabelUsers, eq(users.id, whitelabelUsers.userId))
        .where(and(
          eq(users.username, "testplayer_rollingdrop"),
          eq(whitelabelUsers.whitelabelId, whitelabelId)
        ))
        .limit(1);
      
      if (testUser.length > 0) {
        return {
          ...testUser[0],
          whitelabelId
        };
      }
    }
    
    // For demo purposes, accept any username with password "demo"
    if (password !== "demo") {
      return null;
    }
    
    // Check if user already exists in main users table
    const whitelabelUsername = `${whitelabelId}_${username}`;
    const existingUser = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        usdBalance: users.usdBalance,
        level: users.level,
        experience: users.experience,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .innerJoin(whitelabelUsers, eq(users.id, whitelabelUsers.userId))
      .where(and(
        eq(users.username, whitelabelUsername),
        eq(whitelabelUsers.whitelabelId, whitelabelId)
      ))
      .limit(1);
    
    if (existingUser.length > 0) {
      return {
        ...existingUser[0],
        whitelabelId
      };
    }
    
    // Create new user in main users table
    const [newUser] = await db
      .insert(users)
      .values({
        username: whitelabelUsername, // Make username unique per whitelabel
        email: `${username}@${whitelabelId}.com`,
        usdBalance: "100.00", // Start with $100 USD
        level: 1,
        experience: 0,
        isAdmin: false
      })
      .returning();
    
    // Link user to whitelabel
    await db
      .insert(whitelabelUsers)
      .values({
        whitelabelId,
        userId: newUser.id,
        isActive: true
      });
    
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      usdBalance: newUser.usdBalance,
      level: newUser.level,
      experience: newUser.experience,
      isAdmin: newUser.isAdmin,
      whitelabelId
    };
  } catch (error) {
    console.error('Error authenticating whitelabel user:', error);
    return null;
  }
}

// Update user session types
declare module 'express-session' {
  interface SessionData {
    whitelabelUser?: {
      id: number;
      username: string;
      email?: string;
      usdBalance: string;
      level: number;
      experience: number;
      whitelabelId: string;
      isAdmin: boolean;
    };
  }
}