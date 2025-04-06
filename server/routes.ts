import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHouseSchema, 
  insertRoomSchema, 
  insertBedSchema, 
  insertResidentSchema, 
  insertInventoryItemSchema, 
  insertPaymentSchema, 
  insertMessageSchema, 
  insertMaintenanceRequestSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { registerFileRoutes } from "./routes/files";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Register file routes
  registerFileRoutes(app);

  // Error handling middleware for Zod validation
  const validateBody = (schema: z.ZodType<any, any>) => (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.details
        });
      } else {
        next(error);
      }
    }
  };

  // House Routes
  app.get('/api/houses', async (req, res) => {
    const houses = await storage.getHouses();
    res.json(houses);
  });

  app.get('/api/houses/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid house ID" });
    }
    
    const house = await storage.getHouse(id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    
    res.json(house);
  });

  app.post('/api/houses', validateBody(insertHouseSchema), async (req, res) => {
    const house = await storage.createHouse(req.validatedBody);
    res.status(201).json(house);
  });

  app.patch('/api/houses/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid house ID" });
    }
    
    const house = await storage.updateHouse(id, req.body);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    
    res.json(house);
  });

  app.delete('/api/houses/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid house ID" });
    }
    
    const success = await storage.deleteHouse(id);
    if (!success) {
      return res.status(404).json({ message: "House not found" });
    }
    
    res.status(204).send();
  });

  // Room Routes
  app.get('/api/rooms', async (req, res) => {
    const houseId = req.query.houseId ? parseInt(req.query.houseId as string) : undefined;
    const rooms = await storage.getRooms(houseId);
    res.json(rooms);
  });

  app.get('/api/rooms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }
    
    const room = await storage.getRoom(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.json(room);
  });

  app.post('/api/rooms', validateBody(insertRoomSchema), async (req, res) => {
    const room = await storage.createRoom(req.validatedBody);
    res.status(201).json(room);
  });

  app.patch('/api/rooms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }
    
    const room = await storage.updateRoom(id, req.body);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.json(room);
  });

  app.delete('/api/rooms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }
    
    const success = await storage.deleteRoom(id);
    if (!success) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.status(204).send();
  });

  // Bed Routes
  app.get('/api/beds', async (req, res) => {
    const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
    const beds = await storage.getBeds(roomId);
    res.json(beds);
  });

  app.get('/api/beds/with-rooms', async (req, res) => {
    const houseId = req.query.houseId ? parseInt(req.query.houseId as string) : undefined;
    const bedsWithRooms = await storage.getBedsWithRooms(houseId);
    res.json(bedsWithRooms);
  });

  app.get('/api/beds/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid bed ID" });
    }
    
    const bed = await storage.getBed(id);
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    
    res.json(bed);
  });

  app.post('/api/beds', validateBody(insertBedSchema), async (req, res) => {
    const bed = await storage.createBed(req.validatedBody);
    res.status(201).json(bed);
  });

  app.patch('/api/beds/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid bed ID" });
    }
    
    const bed = await storage.updateBed(id, req.body);
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    
    res.json(bed);
  });

  app.delete('/api/beds/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid bed ID" });
    }
    
    const success = await storage.deleteBed(id);
    if (!success) {
      return res.status(404).json({ message: "Bed not found" });
    }
    
    res.status(204).send();
  });

  // Resident Routes
  app.get('/api/residents', async (req, res) => {
    const residents = await storage.getResidents();
    res.json(residents);
  });

  app.get('/api/residents/with-beds', async (req, res) => {
    const residentsWithBeds = await storage.getResidentsWithBeds();
    res.json(residentsWithBeds);
  });

  app.get('/api/residents/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resident ID" });
    }
    
    const resident = await storage.getResident(id);
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }
    
    res.json(resident);
  });

  app.get('/api/beds/:bedId/resident', async (req, res) => {
    const bedId = parseInt(req.params.bedId);
    if (isNaN(bedId)) {
      return res.status(400).json({ message: "Invalid bed ID" });
    }
    
    const resident = await storage.getResidentByBedId(bedId);
    if (!resident) {
      return res.status(404).json({ message: "No resident found for this bed" });
    }
    
    res.json(resident);
  });

  app.post('/api/residents', validateBody(insertResidentSchema), async (req, res) => {
    const resident = await storage.createResident(req.validatedBody);
    res.status(201).json(resident);
  });

  app.patch('/api/residents/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resident ID" });
    }
    
    const resident = await storage.updateResident(id, req.body);
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }
    
    res.json(resident);
  });

  app.delete('/api/residents/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resident ID" });
    }
    
    const success = await storage.deleteResident(id);
    if (!success) {
      return res.status(404).json({ message: "Resident not found" });
    }
    
    res.status(204).send();
  });

  // Inventory Routes
  app.get('/api/inventory', async (req, res) => {
    const houseId = req.query.houseId ? parseInt(req.query.houseId as string) : undefined;
    const items = await storage.getInventoryItems(houseId);
    res.json(items);
  });

  app.get('/api/inventory/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inventory item ID" });
    }
    
    const item = await storage.getInventoryItem(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    res.json(item);
  });

  app.post('/api/inventory', validateBody(insertInventoryItemSchema), async (req, res) => {
    const item = await storage.createInventoryItem(req.validatedBody);
    res.status(201).json(item);
  });

  app.patch('/api/inventory/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inventory item ID" });
    }
    
    const item = await storage.updateInventoryItem(id, req.body);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    res.json(item);
  });

  app.delete('/api/inventory/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inventory item ID" });
    }
    
    const success = await storage.deleteInventoryItem(id);
    if (!success) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    res.status(204).send();
  });

  // Payment Routes
  app.get('/api/payments', async (req, res) => {
    const residentId = req.query.residentId ? parseInt(req.query.residentId as string) : undefined;
    const payments = await storage.getPayments(residentId);
    res.json(payments);
  });

  app.get('/api/payments/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }
    
    const payment = await storage.getPayment(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  });

  app.post('/api/payments', validateBody(insertPaymentSchema), async (req, res) => {
    const payment = await storage.createPayment(req.validatedBody);
    res.status(201).json(payment);
  });

  app.patch('/api/payments/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }
    
    const payment = await storage.updatePayment(id, req.body);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  });

  app.delete('/api/payments/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }
    
    const success = await storage.deletePayment(id);
    if (!success) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.status(204).send();
  });

  // Message Routes
  app.get('/api/messages', async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.get('/api/messages/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    
    const message = await storage.getMessage(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    res.json(message);
  });

  app.post('/api/messages', validateBody(insertMessageSchema), async (req, res) => {
    const message = await storage.createMessage(req.validatedBody);
    res.status(201).json(message);
  });

  // Maintenance Request Routes
  app.get('/api/maintenance', async (req, res) => {
    const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
    const requests = await storage.getMaintenanceRequests(roomId);
    res.json(requests);
  });

  app.get('/api/maintenance/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance request ID" });
    }
    
    const request = await storage.getMaintenanceRequest(id);
    if (!request) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    
    res.json(request);
  });

  app.post('/api/maintenance', validateBody(insertMaintenanceRequestSchema), async (req, res) => {
    const request = await storage.createMaintenanceRequest(req.validatedBody);
    res.status(201).json(request);
  });

  app.patch('/api/maintenance/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance request ID" });
    }
    
    const request = await storage.updateMaintenanceRequest(id, req.body);
    if (!request) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    
    res.json(request);
  });

  // Dashboard Stats
  app.get('/api/stats', async (req, res) => {
    const houses = await storage.getHouses();
    const beds = await storage.getBeds();
    const residents = await storage.getResidents();
    const inventory = await storage.getInventoryItems();
    const maintenanceRequests = await storage.getMaintenanceRequests();
    
    // Calculate occupancy rate
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    // Calculate payment stats
    const overduePayments = residents.filter(res => res.paymentStatus === 'overdue').length;
    
    // Calculate maintenance stats
    const pendingMaintenance = maintenanceRequests.filter(req => req.status === 'pending').length;
    const urgentMaintenance = maintenanceRequests.filter(req => req.priority === 'urgent').length;
    
    // Calculate low inventory items
    const lowInventoryItems = inventory.filter(item => item.currentQuantity < item.minimumQuantity).length;
    
    res.json({
      totalHouses: houses.length,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      totalResidents: residents.length,
      overduePayments,
      pendingMaintenance,
      urgentMaintenance,
      lowInventoryItems
    });
  });

  return httpServer;
}
