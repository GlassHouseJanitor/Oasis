import { files, type InsertFile, type File } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class FileService {
  /**
   * Save a base64 encoded file directly to the database
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
      
      // Generate a unique filename (for reference only, file is stored in DB)
      const extension = this.getFileExtensionFromMimeType(mimeType, originalName);
      const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
      
      // Convert base64 to binary Buffer
      const binaryData = Buffer.from(base64FileData, 'base64');
      
      // Save file metadata and binary data to database
      const newFile: InsertFile = {
        filename: uniqueFilename,
        originalName,
        mimeType,
        fileType,
        size: binaryData.length,
        binaryData, // Store the actual file data in the database
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
   * Get file by filename
   */
  async getFileByFilename(filename: string): Promise<File | undefined> {
    try {
      const [file] = await db.select().from(files).where(eq(files.filename, filename));
      return file;
    } catch (error) {
      console.error('Error retrieving file by filename:', error);
      return undefined;
    }
  }
  
  /**
   * Get files by resident ID (exclude binary data to reduce payload size)
   */
  async getFilesByResidentId(residentId: number): Promise<Omit<File, 'binaryData'>[]> {
    try {
      const result = await db.select({
        id: files.id,
        filename: files.filename,
        originalName: files.originalName,
        mimeType: files.mimeType,
        size: files.size,
        fileType: files.fileType,
        residentId: files.residentId,
        invoiceId: files.invoiceId,
        paymentId: files.paymentId,
        uploadedAt: files.uploadedAt,
        status: files.status,
        metadata: files.metadata,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt
      }).from(files).where(eq(files.residentId, residentId));
      
      return result;
    } catch (error) {
      console.error('Error retrieving resident files:', error);
      return [];
    }
  }
  
  /**
   * Delete file by ID from database
   */
  async deleteFile(id: number): Promise<boolean> {
    try {
      // Get file info to verify it exists
      const [file] = await db.select().from(files).where(eq(files.id, id));
      
      if (!file) {
        return false;
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