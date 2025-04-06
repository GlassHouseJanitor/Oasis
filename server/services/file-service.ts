import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { db } from '../db';
import { files, type File, type InsertFile } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class FileService {
  /**
   * Save a base64 encoded file to the file system and database
   */
  async saveBase64File(
    base64Data: string,
    originalName: string,
    fileType: 'photo' | 'document' | 'invoice' | 'medical' | 'legal' | 'other',
    residentId?: number
  ): Promise<File> {
    try {
      // Extract MIME type from base64 data
      const mimeTypeMatch = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : '';
      const base64FileData = base64Data.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
      
      // Generate a unique filename
      const extension = this.getFileExtensionFromMimeType(mimeType, originalName);
      const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Create type-specific subdirectory
      const typeDir = path.join(uploadsDir, fileType);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
      
      // Save file to disk
      const filePath = path.join(typeDir, uniqueFilename);
      const relativePath = path.relative(process.cwd(), filePath);
      fs.writeFileSync(filePath, Buffer.from(base64FileData, 'base64'));
      
      // Generate URL for file access
      const fileUrl = `/api/files/${uniqueFilename}`;
      
      // Save file metadata to database
      const newFile: InsertFile = {
        filename: uniqueFilename,
        originalName,
        path: relativePath,
        url: fileUrl,
        mimeType,
        fileType,
        size: Buffer.from(base64FileData, 'base64').length,
        residentId: residentId || null,
        uploadedAt: new Date()
      };
      
      const [file] = await db.insert(files).values(newFile).returning();
      return file;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }
  
  /**
   * Get file extension from MIME type or original filename
   */
  private getFileExtensionFromMimeType(mimeType: string, originalName: string): string {
    // Try to get extension from MIME type first
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'text/csv': 'csv'
    };
    
    if (mimeType && mimeToExtension[mimeType]) {
      return mimeToExtension[mimeType];
    }
    
    // Fallback to extracting extension from original filename
    const extensionMatch = originalName.match(/\.([^.]+)$/);
    return extensionMatch ? extensionMatch[1] : 'bin';
  }
  
  /**
   * Get file by ID
   */
  async getFileById(id: number): Promise<File | undefined> {
    try {
      const [file] = await db.select().from(files).where(eq(files.id, id));
      return file;
    } catch (error) {
      console.error('Error retrieving file:', error);
      return undefined;
    }
  }
  
  /**
   * Get files by resident ID
   */
  async getFilesByResidentId(residentId: number): Promise<File[]> {
    try {
      return await db.select().from(files).where(eq(files.residentId, residentId));
    } catch (error) {
      console.error('Error retrieving resident files:', error);
      return [];
    }
  }
  
  /**
   * Delete file by ID (from filesystem and database)
   */
  async deleteFile(id: number): Promise<boolean> {
    try {
      // Get file info
      const [file] = await db.select().from(files).where(eq(files.id, id));
      
      if (!file) {
        return false;
      }
      
      // Delete from filesystem if it exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      // Delete from database
      await db.delete(files).where(eq(files.id, id));
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const fileService = new FileService();