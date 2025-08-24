import type { Express } from "express";
import multer from "multer";

// CDN Provider Configurations
export interface CDNProvider {
  name: string;
  upload: (file: Buffer, filename: string, contentType: string) => Promise<string>;
  delete?: (url: string) => Promise<boolean>;
  getUrl: (filename: string) => string;
}

// MinIO / S3-Compatible CDN Provider
class MinIOProvider implements CDNProvider {
  name = 'MinIO';
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  }) {
    this.endpoint = config.endpoint;
    this.bucket = config.bucket;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `boxes/${timestamp}_${safeFilename}`;

      // For MinIO, we'd use the AWS SDK or MinIO client
      // This is a placeholder for the actual upload logic
      const uploadUrl = `${this.endpoint}/${this.bucket}/${uniqueFilename}`;
      
      // Store in temporary memory for now
      if (!global.cdnStorage) {
        global.cdnStorage = new Map();
      }
      
      global.cdnStorage.set(uniqueFilename, {
        buffer: file,
        contentType,
        uploadedAt: new Date(),
        originalName: filename,
        provider: 'MinIO',
        url: uploadUrl
      });

      return uploadUrl;
    } catch (error) {
      console.error('MinIO upload error:', error);
      throw new Error('Failed to upload to MinIO');
    }
  }

  getUrl(filename: string): string {
    return `${this.endpoint}/${this.bucket}/${filename}`;
  }
}

// ImageKit CDN Provider
class ImageKitProvider implements CDNProvider {
  name = 'ImageKit';
  private publicKey: string;
  private privateKey: string;
  private urlEndpoint: string;

  constructor(config: {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  }) {
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    this.urlEndpoint = config.urlEndpoint;
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `boxes/${timestamp}_${safeFilename}`;

      // ImageKit upload implementation would go here
      const uploadUrl = `${this.urlEndpoint}/${uniqueFilename}`;
      
      // Store in temporary memory for now
      if (!global.cdnStorage) {
        global.cdnStorage = new Map();
      }
      
      global.cdnStorage.set(uniqueFilename, {
        buffer: file,
        contentType,
        uploadedAt: new Date(),
        originalName: filename,
        provider: 'ImageKit',
        url: uploadUrl
      });

      return uploadUrl;
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw new Error('Failed to upload to ImageKit');
    }
  }

  getUrl(filename: string): string {
    return `${this.urlEndpoint}/${filename}`;
  }
}

// Cloudinary CDN Provider
class CloudinaryProvider implements CDNProvider {
  name = 'Cloudinary';
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(config: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  }) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `boxes/${timestamp}_${safeFilename}`;

      // Cloudinary upload implementation would go here
      const uploadUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/${uniqueFilename}`;
      
      // Store in temporary memory for now
      if (!global.cdnStorage) {
        global.cdnStorage = new Map();
      }
      
      global.cdnStorage.set(uniqueFilename, {
        buffer: file,
        contentType,
        uploadedAt: new Date(),
        originalName: filename,
        provider: 'Cloudinary',
        url: uploadUrl
      });

      return uploadUrl;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload to Cloudinary');
    }
  }

  getUrl(filename: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${filename}`;
  }
}

// Local CDN Provider (current implementation)
class LocalProvider implements CDNProvider {
  name = 'Local';

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}_${safeFilename}`;

    if (!global.cdnStorage) {
      global.cdnStorage = new Map();
    }

    global.cdnStorage.set(uniqueFilename, {
      buffer: file,
      contentType,
      uploadedAt: new Date(),
      originalName: filename,
      provider: 'Local'
    });

    return `/api/cdn/images/${uniqueFilename}`;
  }

  getUrl(filename: string): string {
    return `/api/cdn/images/${filename}`;
  }
}

// CDN Manager
export class CDNManager {
  private provider: CDNProvider;

  constructor() {
    this.provider = this.initializeProvider();
  }

  private initializeProvider(): CDNProvider {
    // Check environment variables for CDN configuration
    const cdnType = process.env.CDN_PROVIDER || 'local';

    switch (cdnType.toLowerCase()) {
      case 'minio':
        if (process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY) {
          return new MinIOProvider({
            endpoint: process.env.MINIO_ENDPOINT,
            bucket: process.env.MINIO_BUCKET || 'rollingdrop',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
          });
        }
        break;

      case 'imagekit':
        if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
          return new ImageKitProvider({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
          });
        }
        break;

      case 'cloudinary':
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          return new CloudinaryProvider({
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
          });
        }
        break;
    }

    console.log(`CDN Provider: Using Local storage (${cdnType} credentials not found)`);
    return new LocalProvider();
  }

  async uploadImage(file: Buffer, filename: string, contentType: string): Promise<string> {
    return await this.provider.upload(file, filename, contentType);
  }

  getImageUrl(filename: string): string {
    return this.provider.getUrl(filename);
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

// Setup CDN endpoints
export function setupCDN(app: Express) {
  const cdnManager = new CDNManager();
  
  // Configure multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    }
  });

  // Modern file upload endpoint
  app.post('/api/cdn/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const filename = req.file.originalname;
      const contentType = req.file.mimetype;
      const file = req.file.buffer;

      const imageUrl = await cdnManager.uploadImage(file, filename, contentType);

      res.json({
        success: true,
        url: imageUrl,
        filename,
        size: file.length,
        provider: cdnManager.getProviderName()
      });

    } catch (error) {
      console.error('CDN upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  });

  // Legacy base64 upload endpoint (keep for compatibility)
  app.post("/api/cdn/upload-base64", async (req, res) => {
    try {
      const { imageData, filename, contentType } = req.body;
      
      if (!imageData || !filename) {
        return res.status(400).json({ 
          success: false,
          message: "Image data and filename required" 
        });
      }

      // Extract base64 data
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const imageUrl = await cdnManager.uploadImage(buffer, filename, contentType || 'image/jpeg');
      
      res.json({
        success: true,
        url: imageUrl,
        filename,
        size: buffer.length,
        provider: cdnManager.getProviderName()
      });
      
    } catch (error) {
      console.error("CDN upload error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to upload image" 
      });
    }
  });

  // CDN status endpoint
  app.get('/api/cdn/status', (req, res) => {
    res.json({
      provider: cdnManager.getProviderName(),
      status: 'active',
      uploadEndpoint: '/api/cdn/upload',
      supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      maxFileSize: '10MB'
    });
  });

  console.log(`CDN System initialized with provider: ${cdnManager.getProviderName()}`);
  console.log('CDN Endpoints:');
  console.log('  POST /api/cdn/upload - Upload images (multipart/form-data)');
  console.log('  POST /api/cdn/upload-base64 - Upload base64 images');
  console.log('  GET  /api/cdn/status - CDN status and configuration');

  return cdnManager;
}