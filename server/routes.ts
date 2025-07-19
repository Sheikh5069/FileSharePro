import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertFileSchema } from "@shared/schema";
import { nanoid } from "nanoid";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all files (public endpoint)
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const shareId = nanoid(10);
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        shareId,
      };

      const validatedData = insertFileSchema.parse(fileData);
      const file = await storage.createFile(validatedData);

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get file by share ID (public)
  app.get("/api/files/:shareId", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Increment view count
      await storage.incrementViews(file.id);

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  // Download file by share ID
  app.get("/api/download/:shareId", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const filePath = path.join(uploadsDir, file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      // Increment download count
      await storage.incrementDownloads(file.id);

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Serve file for preview
  app.get("/api/preview/:shareId", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const filePath = path.join(uploadsDir, file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Type', file.mimeType);
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to preview file" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.delete("/api/admin/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getAllFiles().then(files => 
        files.find(f => f.id === id)
      );

      if (file) {
        // Delete file from disk
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        // Delete from storage
        await storage.deleteFile(id);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
