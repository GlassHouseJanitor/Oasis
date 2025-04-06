import { Client } from '@replit/object-storage';
import { files, type InsertFile } from '@shared/schema';
import { db } from '../db';

const storage = new Client();

export class FileService {
  async saveBase64File(
    base64Data: string,
    originalFilename: string,
    fileType: string,
    residentId?: number
  ): Promise<any> {
    try {
      // Remove the data:image/xyz;base64, prefix
      const base64Content = base64Data.split(';base64,').pop() || '';
      const buffer = Buffer.from(base64Content, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${fileType}_${timestamp}_${originalFilename}`;

      // Upload to Object Storage
      await storage.putObject(filename, buffer);

      // Create file record in database
      const [file] = await db.insert(files)
        .values({
          filename,
          originalName: originalFilename,
          mimeType: this.getMimeType(originalFilename),
          size: buffer.length,
          path: filename,
          url: `/api/files/${filename}`,
          fileType,
          residentId: residentId || null,
          status: 'pending'
        })
        .returning();

      return file;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  async getFile(filename: string): Promise<Buffer> {
    try {
      return await storage.getObject(filename);
    } catch (error) {
      console.error('Error retrieving file:', error);
      throw new Error('File not found');
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

export const fileService = new FileService();