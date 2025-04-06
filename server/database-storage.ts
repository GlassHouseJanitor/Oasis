import { db } from './db';
import { 
  houses, rooms, beds, residents, inventoryItems, 
  payments, messages, maintenanceRequests, files,
  invoices, residentDocuments,
  type House, type Room, type Bed, type Resident,
  type InventoryItem, type Payment, type Message, 
  type MaintenanceRequest, type BedWithRoom, type ResidentWithBed
} from '@shared/schema';
import { IStorage } from './storage';
import { eq, and, isNull, desc } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // House operations
  async getHouses(): Promise<House[]> {
    return await db.select().from(houses);
  }

  async getHouse(id: number): Promise<House | undefined> {
    const [house] = await db.select().from(houses).where(eq(houses.id, id));
    return house;
  }

  async createHouse(house: any): Promise<House> {
    const [newHouse] = await db.insert(houses).values(house).returning();
    return newHouse;
  }

  async updateHouse(id: number, house: Partial<any>): Promise<House | undefined> {
    const [updatedHouse] = await db.update(houses)
      .set({ ...house, updatedAt: new Date() })
      .where(eq(houses.id, id))
      .returning();
    return updatedHouse;
  }

  async deleteHouse(id: number): Promise<boolean> {
    const result = await db.delete(houses).where(eq(houses.id, id));
    return true; // Assuming deletion was successful if no error was thrown
  }

  // Room operations
  async getRooms(houseId?: number): Promise<Room[]> {
    if (houseId) {
      return await db.select().from(rooms).where(eq(rooms.houseId, houseId));
    }
    return await db.select().from(rooms);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: any): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<any>): Promise<Room | undefined> {
    const [updatedRoom] = await db.update(rooms)
      .set({ ...room, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    await db.delete(rooms).where(eq(rooms.id, id));
    return true;
  }

  // Bed operations
  async getBeds(roomId?: number): Promise<Bed[]> {
    if (roomId) {
      return await db.select().from(beds).where(eq(beds.roomId, roomId));
    }
    return await db.select().from(beds);
  }

  async getBedsWithRooms(houseId?: number): Promise<BedWithRoom[]> {
    let bedsWithRooms: BedWithRoom[] = [];
    
    if (houseId) {
      // Query all beds in rooms that belong to the specified house
      const roomsInHouse = await db.select().from(rooms).where(eq(rooms.houseId, houseId));
      const roomIds = roomsInHouse.map(r => r.id);
      
      for (const roomId of roomIds) {
        const bedsInRoom = await db.select().from(beds).where(eq(beds.roomId, roomId));
        for (const bed of bedsInRoom) {
          const room = roomsInHouse.find(r => r.id === bed.roomId);
          if (room) {
            bedsWithRooms.push({ ...bed, room });
          }
        }
      }
    } else {
      // Query all beds and their rooms
      const allBeds = await db.select().from(beds);
      for (const bed of allBeds) {
        const [room] = await db.select().from(rooms).where(eq(rooms.id, bed.roomId));
        if (room) {
          bedsWithRooms.push({ ...bed, room });
        }
      }
    }
    
    return bedsWithRooms;
  }

  async getBed(id: number): Promise<Bed | undefined> {
    const [bed] = await db.select().from(beds).where(eq(beds.id, id));
    return bed;
  }

  async createBed(bed: any): Promise<Bed> {
    const [newBed] = await db.insert(beds).values(bed).returning();
    return newBed;
  }

  async updateBed(id: number, bed: Partial<any>): Promise<Bed | undefined> {
    const [updatedBed] = await db.update(beds)
      .set({ ...bed, updatedAt: new Date() })
      .where(eq(beds.id, id))
      .returning();
    return updatedBed;
  }

  async deleteBed(id: number): Promise<boolean> {
    await db.delete(beds).where(eq(beds.id, id));
    return true;
  }

  // Resident operations
  async getResidents(): Promise<Resident[]> {
    return await db.select().from(residents);
  }

  async getResidentsWithBeds(): Promise<ResidentWithBed[]> {
    const allResidents = await db.select().from(residents);
    const residentsWithBeds: ResidentWithBed[] = [];
    
    for (const resident of allResidents) {
      if (resident.bedId) {
        const [bed] = await db.select().from(beds).where(eq(beds.id, resident.bedId));
        if (bed) {
          const [room] = await db.select().from(rooms).where(eq(rooms.id, bed.roomId));
          if (room) {
            residentsWithBeds.push({
              ...resident,
              bed: { ...bed, room }
            });
          }
        }
      } else {
        // Resident without a bed
        residentsWithBeds.push({ ...resident, bed: undefined });
      }
    }
    
    return residentsWithBeds;
  }

  async getResident(id: number): Promise<Resident | undefined> {
    const [resident] = await db.select().from(residents).where(eq(residents.id, id));
    return resident;
  }

  async getResidentByBedId(bedId: number): Promise<Resident | undefined> {
    const [resident] = await db.select().from(residents).where(eq(residents.bedId, bedId));
    return resident;
  }

  async createResident(resident: any): Promise<Resident> {
    const [newResident] = await db.insert(residents).values(resident).returning();
    return newResident;
  }

  async updateResident(id: number, resident: Partial<any>): Promise<Resident | undefined> {
    const [updatedResident] = await db.update(residents)
      .set({ ...resident, updatedAt: new Date() })
      .where(eq(residents.id, id))
      .returning();
    return updatedResident;
  }

  async deleteResident(id: number): Promise<boolean> {
    await db.delete(residents).where(eq(residents.id, id));
    return true;
  }

  // Inventory operations
  async getInventoryItems(houseId?: number): Promise<InventoryItem[]> {
    if (houseId) {
      return await db.select().from(inventoryItems).where(eq(inventoryItems.houseId, houseId));
    }
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(item: any): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<any>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db.update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return true;
  }

  // Payment operations
  async getPayments(residentId?: number): Promise<Payment[]> {
    if (residentId) {
      return await db.select().from(payments).where(eq(payments.residentId, residentId));
    }
    return await db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: any): Promise<Payment> {
    // Convert string invoiceId to number or null
    const processedPayment = { 
      ...payment,
      invoiceId: payment.invoiceId ? Number(payment.invoiceId) : null 
    };
    
    const [newPayment] = await db.insert(payments).values(processedPayment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<any>): Promise<Payment | undefined> {
    // Process invoiceId if present
    const processedPayment = { ...payment };
    if (payment.invoiceId !== undefined) {
      processedPayment.invoiceId = payment.invoiceId ? Number(payment.invoiceId) : null;
    }
    
    const [updatedPayment] = await db.update(payments)
      .set({ ...processedPayment, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    await db.delete(payments).where(eq(payments.id, id));
    return true;
  }

  // Message operations
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(message: any): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Maintenance operations
  async getMaintenanceRequests(roomId?: number): Promise<MaintenanceRequest[]> {
    if (roomId) {
      return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.roomId, roomId));
    }
    return await db.select().from(maintenanceRequests);
  }

  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    const [request] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
    return request;
  }

  async createMaintenanceRequest(request: any): Promise<MaintenanceRequest> {
    const [newRequest] = await db.insert(maintenanceRequests).values(request).returning();
    return newRequest;
  }

  async updateMaintenanceRequest(id: number, request: Partial<any>): Promise<MaintenanceRequest | undefined> {
    const [updatedRequest] = await db.update(maintenanceRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return updatedRequest;
  }
}