import { files, type File, type InsertFile } from "@shared/schema";

export interface IStorage {
  createFile(file: InsertFile): Promise<File>;
  getFileByShareId(shareId: string): Promise<File | undefined>;
  getAllFiles(): Promise<File[]>;
  incrementViews(id: number): Promise<void>;
  incrementDownloads(id: number): Promise<void>;
  deleteFile(id: number): Promise<void>;
  getStats(): Promise<{
    totalFiles: number;
    totalViews: number;
    totalDownloads: number;
    totalSize: number;
  }>;
}

export class MemStorage implements IStorage {
  private files: Map<number, File>;
  private currentId: number;

  constructor() {
    this.files = new Map();
    this.currentId = 1;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentId++;
    const file: File = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
      views: 0,
      downloads: 0,
    };
    this.files.set(id, file);
    return file;
  }

  async getFileByShareId(shareId: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareId === shareId,
    );
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async incrementViews(id: number): Promise<void> {
    const file = this.files.get(id);
    if (file) {
      file.views++;
      this.files.set(id, file);
    }
  }

  async incrementDownloads(id: number): Promise<void> {
    const file = this.files.get(id);
    if (file) {
      file.downloads++;
      this.files.set(id, file);
    }
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalViews: number;
    totalDownloads: number;
    totalSize: number;
  }> {
    const allFiles = Array.from(this.files.values());
    return {
      totalFiles: allFiles.length,
      totalViews: allFiles.reduce((sum, file) => sum + file.views, 0),
      totalDownloads: allFiles.reduce((sum, file) => sum + file.downloads, 0),
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
    };
  }
}

export const storage = new MemStorage();
