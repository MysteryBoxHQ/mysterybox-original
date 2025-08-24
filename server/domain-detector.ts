import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { whitelabelSites } from '@shared/schema';
import { eq, or } from 'drizzle-orm';

export interface DomainRequest extends Request {
  whitelabelSite?: {
    id: number;
    whitelabelId: string;
    displayName: string;
    brandingConfig: any;
    contentConfig: any;
    featureConfig: any;
  };
}

/**
 * Middleware to detect whitelabel site from hostname
 * Supports both custom domains and subdomains
 */
export async function detectWhitelabelFromDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const hostname = req.hostname || req.get('host')?.split(':')[0] || '';
    
    console.log(`🌐 Domain Detection: ${hostname}`);
    
    // Skip detection for localhost/development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('replit')) {
      // For development, check for whitelabel parameter or use demo
      const whitelabelId = req.query.whitelabel as string || 'rollingdrop-demo';
      await setWhitelabelFromId(req, whitelabelId);
      return next();
    }
    
    // Look up whitelabel site by domain
    const [whitelabelSite] = await db
      .select()
      .from(whitelabelSites)
      .where(or(
        eq(whitelabelSites.primaryDomain, hostname),
        eq(whitelabelSites.subdomain, hostname)
      ));
    
    if (whitelabelSite) {
      (req as DomainRequest).whitelabelSite = {
        id: whitelabelSite.id,
        whitelabelId: whitelabelSite.whitelabelId,
        displayName: whitelabelSite.displayName,
        brandingConfig: whitelabelSite.brandingConfig,
        contentConfig: whitelabelSite.contentConfig,
        featureConfig: whitelabelSite.featureConfig
      };
      
      console.log(`✅ Whitelabel detected: ${whitelabelSite.whitelabelId} (${whitelabelSite.displayName})`);
    } else {
      console.log(`❌ No whitelabel found for domain: ${hostname}`);
    }
    
    next();
  } catch (error) {
    console.error('Domain detection error:', error);
    next();
  }
}

/**
 * Helper function to set whitelabel from ID (for development)
 */
async function setWhitelabelFromId(req: Request, whitelabelId: string) {
  try {
    const [whitelabelSite] = await db
      .select()
      .from(whitelabelSites)
      .where(eq(whitelabelSites.whitelabelId, whitelabelId));
    
    if (whitelabelSite) {
      (req as DomainRequest).whitelabelSite = {
        id: whitelabelSite.id,
        whitelabelId: whitelabelSite.whitelabelId,
        displayName: whitelabelSite.displayName,
        brandingConfig: whitelabelSite.brandingConfig,
        contentConfig: whitelabelSite.contentConfig,
        featureConfig: whitelabelSite.featureConfig
      };
      
      console.log(`🔧 Development whitelabel set: ${whitelabelSite.whitelabelId}`);
    }
  } catch (error) {
    console.error('Error setting whitelabel from ID:', error);
  }
}

/**
 * API endpoint to show domain detection demo
 */
export function getDomainInfo(req: Request, res: Response) {
  const hostname = req.hostname || req.get('host')?.split(':')[0] || '';
  const whitelabelSite = (req as DomainRequest).whitelabelSite;
  
  res.json({
    hostname,
    detected: !!whitelabelSite,
    whitelabel: whitelabelSite ? {
      id: whitelabelSite.whitelabelId,
      name: whitelabelSite.displayName,
      branding: whitelabelSite.brandingConfig
    } : null,
    examples: {
      customDomains: [
        'casino1.com → Casino1 Whitelabel',
        'casino2.com → Casino2 Whitelabel', 
        'store3.com → Store3 Whitelabel'
      ],
      subdomains: [
        'casino1.rollingdrop.com → Casino1 Whitelabel',
        'casino2.rollingdrop.com → Casino2 Whitelabel',
        'store3.rollingdrop.com → Store3 Whitelabel'
      ]
    }
  });
}