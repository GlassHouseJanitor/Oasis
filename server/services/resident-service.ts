import { db } from '../db';
import { fileService } from './file-service';
import { 
  files, 
  residents,
  residentDocuments,
  type File,
  type InsertResidentDocument
} from '@shared/schema';
import { and, eq } from 'drizzle-orm';

export class ResidentService {
  /**
   * Save or update a resident's photo
   */
  async saveResidentPhoto(residentId: number, base64Data: string, originalFilename: string): Promise<File> {
    try {
      // Save the file
      const photo = await fileService.saveBase64File(
        base64Data,
        originalFilename,
        'photo',
        residentId
      );
      
      // Create a proper URL for the photo
      const photoUrl = `/api/files/${photo.filename}`;
      
      // Update the resident's photoUrl in the residents table
      await db.update(residents)
        .set({ photoUrl, updatedAt: new Date() })
        .where(eq(residents.id, residentId));
      
      // Ensure the file is associated with the resident
      await db.update(files)
        .set({ residentId })
        .where(eq(files.id, photo.id));
      
      // Return the updated photo with URL
      return {
        ...photo,
        url: photoUrl
      };
    } catch (error) {
      console.error('Error saving resident photo:', error);
      throw new Error('Failed to save resident photo');
    }
  }
  
  /**
   * Get a resident's documents
   */
  async getResidentDocuments(residentId: number): Promise<any[]> {
    try {
      // Get document records
      const docRecords = await db.select()
        .from(residentDocuments)
        .where(eq(residentDocuments.residentId, residentId));
      
      // Enrich with file data
      const result = [];
      for (const doc of docRecords) {
        const [file] = await db.select()
          .from(files)
          .where(eq(files.id, doc.fileId));
        
        if (file) {
          result.push({
            ...doc,
            file
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error retrieving resident documents:', error);
      return [];
    }
  }
  
  /**
   * Add a document to a resident
   */
  async addResidentDocument(
    residentId: number,
    base64Data: string,
    originalFilename: string,
    documentType: string,
    title: string,
    description?: string,
    expiryDate?: Date
  ): Promise<any> {
    try {
      // Save the file first
      const file = await fileService.saveBase64File(
        base64Data,
        originalFilename,
        'document',
        residentId
      );
      
      // Create the document record
      const [document] = await db.insert(residentDocuments)
        .values({
          residentId,
          fileId: file.id,
          title,
          description: description || null,
          documentType,
          status: 'pending',
          expiryDate: expiryDate || null,
          uploadedAt: new Date(),
          verifiedAt: null
        })
        .returning();
      
      return {
        ...document,
        file
      };
    } catch (error) {
      console.error('Error adding resident document:', error);
      throw new Error('Failed to add resident document');
    }
  }
}

export const residentService = new ResidentService();