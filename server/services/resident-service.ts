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
      // Save the file directly to database
      const photo = await fileService.saveBase64File(
        base64Data,
        originalFilename,
        'photo',
        residentId
      );
      
      // Create a proper URL reference for the photo
      const photoUrl = `/api/files/${photo.filename}`;
      
      // Update the resident's photoUrl in the residents table
      await db.update(residents)
        .set({ photoUrl, updatedAt: new Date() })
        .where(eq(residents.id, residentId));
      
      // Ensure the file is associated with the resident
      await db.update(files)
        .set({ residentId })
        .where(eq(files.id, photo.id));
      
      // Don't return the binary data to reduce payload size
      const { binaryData, ...photoWithoutBinary } = photo;
      
      return {
        ...photoWithoutBinary,
        // Add synthetic URL property for client compatibility
        url: photoUrl
      } as File;
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
      
      // Enrich with file data (excluding binary data)
      const result = [];
      for (const doc of docRecords) {
        // Select all fields except binary data
        const [file] = await db.select({
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
        })
        .from(files)
        .where(eq(files.id, doc.fileId));
        
        if (file) {
          // Add URL reference for client
          const fileUrl = `/api/files/${file.filename}`;
          
          result.push({
            ...doc,
            file: {
              ...file,
              url: fileUrl
            }
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
      // Save the file directly to database
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
      
      // Don't include binary data in response
      const { binaryData, ...fileWithoutBinary } = file;
      
      // Create a URL reference for the document
      const fileUrl = `/api/files/${file.filename}`;
      
      return {
        ...document,
        file: {
          ...fileWithoutBinary,
          url: fileUrl
        }
      };
    } catch (error) {
      console.error('Error adding resident document:', error);
      throw new Error('Failed to add resident document');
    }
  }
}

export const residentService = new ResidentService();