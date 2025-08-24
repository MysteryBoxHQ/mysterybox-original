import type { Express } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

// Free local CDN implementation
export class FreeCDN {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadImage(file: Buffer, originalName: string, contentType: string): Promise<string> {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, '_');
    const filename = `${timestamp}_${safeBaseName}${extension}`;
    
    const filePath = path.join(this.uploadDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filePath, file);
    
    // Return public URL
    return `/api/cdn/images/${filename}`;
  }

  getImagePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  imageExists(filename: string): boolean {
    const filePath = this.getImagePath(filename);
    return fs.existsSync(filePath);
  }

  deleteImage(filename: string): boolean {
    try {
      const filePath = this.getImagePath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  listImages(): Array<{filename: string; url: string; size: number; uploadedAt: Date}> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      return files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => {
          const filePath = path.join(this.uploadDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            url: `/api/cdn/images/${file}`,
            size: stats.size,
            uploadedAt: stats.birthtime
          };
        })
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      console.error('Error listing images:', error);
      return [];
    }
  }
}

export function setupFreeCDN(app: Express) {
  const cdn = new FreeCDN();

  // Configure multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
      }
    }
  });

  // File upload endpoint
  app.post('/api/cdn/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageUrl = await cdn.uploadImage(
        req.file.buffer, 
        req.file.originalname, 
        req.file.mimetype
      );

      res.json({
        success: true,
        url: imageUrl,
        filename: path.basename(imageUrl),
        size: req.file.buffer.length,
        contentType: req.file.mimetype
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  });

  // Base64 upload endpoint (for compatibility)
  app.post('/api/cdn/upload-base64', async (req, res) => {
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

      const imageUrl = await cdn.uploadImage(buffer, filename, contentType || 'image/jpeg');
      
      res.json({
        success: true,
        url: imageUrl,
        filename: path.basename(imageUrl),
        size: buffer.length
      });
      
    } catch (error) {
      console.error("Base64 upload error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to upload image" 
      });
    }
  });

  // Serve images
  app.get('/api/cdn/images/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!cdn.imageExists(filename)) {
        return res.status(404).json({ message: 'Image not found' });
      }

      const filePath = cdn.getImagePath(filename);
      
      // Set caching headers
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader('ETag', `"${filename}"`);
      
      // Serve the file
      res.sendFile(filePath);
      
    } catch (error) {
      console.error("Image serve error:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  // List all images
  app.get('/api/cdn/images', (req, res) => {
    try {
      const images = cdn.listImages();
      res.json({ 
        success: true,
        images,
        total: images.length 
      });
    } catch (error) {
      console.error("List images error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to list images" 
      });
    }
  });

  // Delete image
  app.delete('/api/cdn/images/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      const deleted = cdn.deleteImage(filename);
      
      if (deleted) {
        res.json({ 
          success: true,
          message: 'Image deleted successfully' 
        });
      } else {
        res.status(404).json({ 
          success: false,
          message: 'Image not found' 
        });
      }
    } catch (error) {
      console.error("Delete image error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete image" 
      });
    }
  });

  // CDN status
  app.get('/api/cdn/status', (req, res) => {
    const images = cdn.listImages();
    res.json({
      provider: 'Free Local CDN',
      status: 'active',
      totalImages: images.length,
      totalSize: images.reduce((sum, img) => sum + img.size, 0),
      uploadEndpoint: '/api/cdn/upload',
      supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      maxFileSize: '10MB',
      storageLocation: 'Local file system'
    });
  });

  console.log('Free CDN System initialized');
  console.log('CDN Endpoints:');
  console.log('  POST /api/cdn/upload - Upload images (multipart/form-data)');
  console.log('  POST /api/cdn/upload-base64 - Upload base64 images');
  console.log('  GET  /api/cdn/images/:filename - Serve images');
  console.log('  GET  /api/cdn/images - List all images');
  console.log('  DELETE /api/cdn/images/:filename - Delete image');
  console.log('  GET  /api/cdn/status - CDN status');

  return cdn;
}