import { Express, Request, Response } from 'express';
import { fileService } from '../services/file-service';
import { residentService } from '../services/resident-service';
import * as path from 'path';
import * as fs from 'fs';
import { db } from '../db';
import { files } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const registerFileRoutes = (app: Express) => {
  // Get file by ID
  app.get('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Handle direct filename access
      if (isNaN(id)) {
        const filename = req.params.id;
        // Search for file by filename
        const [file] = await db.select().from(files).where(eq(files.filename, filename));
        
        if (!file) {
          return res.status(404).json({ error: 'File not found' });
        }
        
        // Check if file exists on disk
        const filePath = path.join(process.cwd(), file.path);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: 'File not found on disk' });
        }
        
        // Determine content type
        const contentType = file.mimeType || 'application/octet-stream';
        
        // Set content type and send file
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        return res.sendFile(filePath);
      }
      
      // Handle numeric ID access
      const file = await fileService.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      res.json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get files by resident ID
  app.get('/api/residents/:id/files', async (req: Request, res: Response) => {
    try {
      const residentId = parseInt(req.params.id);
      const files = await fileService.getFilesByResidentId(residentId);
      res.json(files);
    } catch (error) {
      console.error('Error retrieving resident files:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Upload resident photo
  app.post('/api/residents/:id/photo', async (req: Request, res: Response) => {
    try {
      const residentId = parseInt(req.params.id);
      const { base64Data, originalFilename } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({ error: 'Missing base64Data in request body' });
      }
      
      const photo = await residentService.saveResidentPhoto(
        residentId, 
        base64Data, 
        originalFilename || 'photo.jpg'
      );
      
      res.status(201).json(photo);
    } catch (error) {
      console.error('Error uploading resident photo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Upload resident document
  app.post('/api/residents/:id/documents', async (req: Request, res: Response) => {
    try {
      const residentId = parseInt(req.params.id);
      const { 
        base64Data, 
        originalFilename, 
        documentType, 
        title, 
        description, 
        expiryDate 
      } = req.body;
      
      if (!base64Data || !documentType || !title) {
        return res.status(400).json({ 
          error: 'Missing required fields in request body' 
        });
      }
      
      const result = await residentService.addResidentDocument(
        residentId,
        base64Data,
        originalFilename || 'document.pdf',
        documentType,
        title,
        description,
        expiryDate ? new Date(expiryDate) : undefined
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error uploading resident document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Delete file
  app.delete('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await fileService.deleteFile(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};