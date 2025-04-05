import {
  houses, 
  rooms, 
  beds, 
  residents, 
  inventoryItems, 
  payments, 
  messages, 
  maintenanceRequests,
  type House,
  type Room,
  type Bed,
  type Resident,
  type InventoryItem,
  type Payment,
  type Message,
  type MaintenanceRequest,
  type InsertHouse,
  type InsertRoom,
  type InsertBed,
  type InsertResident,
  type InsertInventoryItem,
  type InsertPayment,
  type InsertMessage,
  type InsertMaintenanceRequest,
  type BedWithRoom,
  type ResidentWithBed
} from "@shared/schema";

export interface IStorage {
  // House operations
  getHouses(): Promise<House[]>;
  getHouse(id: number): Promise<House | undefined>;
  createHouse(house: InsertHouse): Promise<House>;
  updateHouse(id: number, house: Partial<InsertHouse>): Promise<House | undefined>;
  deleteHouse(id: number): Promise<boolean>;
  
  // Room operations
  getRooms(houseId?: number): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Bed operations
  getBeds(roomId?: number): Promise<Bed[]>;
  getBedsWithRooms(houseId?: number): Promise<BedWithRoom[]>;
  getBed(id: number): Promise<Bed | undefined>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed | undefined>;
  deleteBed(id: number): Promise<boolean>;
  
  // Resident operations
  getResidents(): Promise<Resident[]>;
  getResidentsWithBeds(): Promise<ResidentWithBed[]>;
  getResident(id: number): Promise<Resident | undefined>;
  getResidentByBedId(bedId: number): Promise<Resident | undefined>;
  createResident(resident: InsertResident): Promise<Resident>;
  updateResident(id: number, resident: Partial<InsertResident>): Promise<Resident | undefined>;
  deleteResident(id: number): Promise<boolean>;
  
  // Inventory operations
  getInventoryItems(houseId?: number): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Payment operations
  getPayments(residentId?: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  
  // Message operations
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Maintenance operations
  getMaintenanceRequests(roomId?: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
}

export class MemStorage implements IStorage {
  private houses: Map<number, House>;
  private rooms: Map<number, Room>;
  private beds: Map<number, Bed>;
  private residents: Map<number, Resident>;
  private inventoryItems: Map<number, InventoryItem>;
  private payments: Map<number, Payment>;
  private messages: Map<number, Message>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  
  private houseId: number = 1;
  private roomId: number = 1;
  private bedId: number = 1;
  private residentId: number = 1;
  private inventoryItemId: number = 1;
  private paymentId: number = 1;
  private messageId: number = 1;
  private maintenanceRequestId: number = 1;
  
  constructor() {
    this.houses = new Map();
    this.rooms = new Map();
    this.beds = new Map();
    this.residents = new Map();
    this.inventoryItems = new Map();
    this.payments = new Map();
    this.messages = new Map();
    this.maintenanceRequests = new Map();
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Create Houses
    const house1 = this.createHouse({ name: 'Serenity House', address: '123 Main St', description: 'Main recovery house' });
    const house2 = this.createHouse({ name: 'Recovery Haven', address: '456 Oak Ave', description: 'Secondary recovery house' });
    
    // Create Rooms for Serenity House
    const room1 = this.createRoom({ houseId: house1.id, name: 'Room 1', floor: 1 });
    const room2 = this.createRoom({ houseId: house1.id, name: 'Room 2', floor: 1 });
    const room3 = this.createRoom({ houseId: house1.id, name: 'Room 3', floor: 1 });
    const room4 = this.createRoom({ houseId: house1.id, name: 'Room 4', floor: 2 });
    const room5 = this.createRoom({ houseId: house1.id, name: 'Room 5', floor: 2 });
    const room6 = this.createRoom({ houseId: house1.id, name: 'Room 6', floor: 2 });
    
    // Create Beds for each room
    const bed1 = this.createBed({ roomId: room1.id, name: 'Bed 1', status: 'available' });
    const bed2 = this.createBed({ roomId: room1.id, name: 'Bed 2', status: 'occupied' });
    
    const bed3 = this.createBed({ roomId: room2.id, name: 'Bed 3', status: 'occupied' });
    const bed4 = this.createBed({ roomId: room2.id, name: 'Bed 4', status: 'maintenance', notes: 'Frame needs repair' });
    const bed5 = this.createBed({ roomId: room2.id, name: 'Bed 5', status: 'occupied' });
    
    const bed6 = this.createBed({ roomId: room3.id, name: 'Bed 6', status: 'available' });
    const bed7 = this.createBed({ roomId: room3.id, name: 'Bed 7', status: 'available' });
    
    const bed8 = this.createBed({ roomId: room4.id, name: 'Bed 8', status: 'occupied' });
    const bed9 = this.createBed({ roomId: room4.id, name: 'Bed 9', status: 'occupied' });
    
    const bed10 = this.createBed({ roomId: room5.id, name: 'Bed 10', status: 'available' });
    const bed11 = this.createBed({ roomId: room5.id, name: 'Bed 11', status: 'occupied' });
    const bed12 = this.createBed({ roomId: room5.id, name: 'Bed 12', status: 'available' });
    
    const bed13 = this.createBed({ roomId: room6.id, name: 'Bed 13', status: 'maintenance', notes: 'Mattress replacement needed' });
    const bed14 = this.createBed({ roomId: room6.id, name: 'Bed 14', status: 'occupied' });
    
    // Create Residents
    const resident1 = this.createResident({
      firstName: 'Michael', 
      lastName: 'Johnson', 
      email: 'michael.j@example.com',
      phone: '555-123-4567',
      emergencyContact: 'Jane Johnson, 555-987-6543',
      paymentStatus: 'paid',
      moveInDate: new Date(2023, 5, 15),
      expectedDuration: '3 months',
      bedId: bed3.id
    });
    
    const resident2 = this.createResident({
      firstName: 'Sarah', 
      lastName: 'Thompson', 
      email: 'sarah.t@example.com',
      phone: '555-222-3333',
      emergencyContact: 'Mark Thompson, 555-444-5555',
      paymentStatus: 'partial',
      moveInDate: new Date(2023, 3, 22),
      expectedDuration: '6 months',
      bedId: bed2.id
    });
    
    const resident3 = this.createResident({
      firstName: 'Robert', 
      lastName: 'Davis', 
      email: 'robert.d@example.com',
      phone: '555-666-7777',
      emergencyContact: 'Lisa Davis, 555-888-9999',
      paymentStatus: 'overdue',
      moveInDate: new Date(2023, 6, 3),
      expectedDuration: '3 months',
      bedId: bed8.id
    });
    
    const resident4 = this.createResident({
      firstName: 'Jennifer', 
      lastName: 'Martinez', 
      email: 'jennifer.m@example.com',
      phone: '555-333-2222',
      emergencyContact: 'Carlos Martinez, 555-111-0000',
      paymentStatus: 'paid',
      moveInDate: new Date(2023, 4, 19),
      expectedDuration: '9 months',
      bedId: bed14.id
    });
    
    // Create Inventory Items
    this.createInventoryItem({
      name: 'Toilet Paper',
      category: 'Bathroom',
      currentQuantity: 12,
      minimumQuantity: 10,
      amazonUrl: 'https://www.amazon.com/dp/B07LCNXJMN',
      houseId: house1.id
    });
    
    this.createInventoryItem({
      name: 'Paper Towels',
      category: 'Kitchen',
      currentQuantity: 4,
      minimumQuantity: 6,
      amazonUrl: 'https://www.amazon.com/dp/B07LCNXJMN',
      houseId: house1.id
    });
    
    this.createInventoryItem({
      name: 'Laundry Detergent',
      category: 'Laundry',
      currentQuantity: 2,
      minimumQuantity: 3,
      amazonUrl: 'https://www.amazon.com/dp/B01DABQM0K',
      houseId: house1.id
    });
    
    // Create Payments
    this.createPayment({
      residentId: resident1.id,
      amount: 45000, // $450.00
      datePaid: new Date(2023, 7, 1),
      paymentMethod: 'Credit Card',
      invoiceId: 'INV-2023-001'
    });
    
    this.createPayment({
      residentId: resident2.id,
      amount: 30000, // $300.00
      datePaid: new Date(2023, 7, 3),
      paymentMethod: 'Cash',
      notes: 'Partial payment, remainder due by 15th',
      invoiceId: 'INV-2023-002'
    });
    
    // Create Maintenance Requests
    this.createMaintenanceRequest({
      roomId: room6.id,
      description: 'Bathroom sink is leaking',
      requestedBy: resident4.id,
      requestedAt: new Date(2023, 7, 10),
      priority: 'medium',
      status: 'pending'
    });
    
    this.createMaintenanceRequest({
      roomId: room2.id,
      description: 'Bed frame is broken',
      requestedAt: new Date(2023, 7, 8),
      priority: 'high',
      status: 'in_progress',
      notes: 'Parts ordered, will repair by Friday'
    });
  }
  
  // House operations
  async getHouses(): Promise<House[]> {
    return Array.from(this.houses.values());
  }
  
  async getHouse(id: number): Promise<House | undefined> {
    return this.houses.get(id);
  }
  
  async createHouse(house: InsertHouse): Promise<House> {
    const id = this.houseId++;
    const newHouse: House = { ...house, id };
    this.houses.set(id, newHouse);
    return newHouse;
  }
  
  async updateHouse(id: number, house: Partial<InsertHouse>): Promise<House | undefined> {
    const existingHouse = this.houses.get(id);
    if (!existingHouse) return undefined;
    
    const updatedHouse = { ...existingHouse, ...house };
    this.houses.set(id, updatedHouse);
    return updatedHouse;
  }
  
  async deleteHouse(id: number): Promise<boolean> {
    return this.houses.delete(id);
  }
  
  // Room operations
  async getRooms(houseId?: number): Promise<Room[]> {
    const rooms = Array.from(this.rooms.values());
    if (houseId) {
      return rooms.filter(room => room.houseId === houseId);
    }
    return rooms;
  }
  
  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }
  
  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.roomId++;
    const newRoom: Room = { ...room, id };
    this.rooms.set(id, newRoom);
    return newRoom;
  }
  
  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const existingRoom = this.rooms.get(id);
    if (!existingRoom) return undefined;
    
    const updatedRoom = { ...existingRoom, ...room };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }
  
  async deleteRoom(id: number): Promise<boolean> {
    return this.rooms.delete(id);
  }
  
  // Bed operations
  async getBeds(roomId?: number): Promise<Bed[]> {
    const beds = Array.from(this.beds.values());
    if (roomId) {
      return beds.filter(bed => bed.roomId === roomId);
    }
    return beds;
  }
  
  async getBedsWithRooms(houseId?: number): Promise<BedWithRoom[]> {
    const beds = Array.from(this.beds.values());
    const bedsWithRooms: BedWithRoom[] = [];
    
    for (const bed of beds) {
      const room = this.rooms.get(bed.roomId);
      if (room) {
        if (houseId && room.houseId !== houseId) continue;
        bedsWithRooms.push({ ...bed, room });
      }
    }
    
    return bedsWithRooms;
  }
  
  async getBed(id: number): Promise<Bed | undefined> {
    return this.beds.get(id);
  }
  
  async createBed(bed: InsertBed): Promise<Bed> {
    const id = this.bedId++;
    const newBed: Bed = { ...bed, id };
    this.beds.set(id, newBed);
    return newBed;
  }
  
  async updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed | undefined> {
    const existingBed = this.beds.get(id);
    if (!existingBed) return undefined;
    
    const updatedBed = { ...existingBed, ...bed };
    this.beds.set(id, updatedBed);
    return updatedBed;
  }
  
  async deleteBed(id: number): Promise<boolean> {
    return this.beds.delete(id);
  }
  
  // Resident operations
  async getResidents(): Promise<Resident[]> {
    return Array.from(this.residents.values());
  }
  
  async getResidentsWithBeds(): Promise<ResidentWithBed[]> {
    const residents = Array.from(this.residents.values());
    const residentsWithBeds: ResidentWithBed[] = [];
    
    for (const resident of residents) {
      if (resident.bedId) {
        const bed = this.beds.get(resident.bedId);
        if (bed) {
          const room = this.rooms.get(bed.roomId);
          if (room) {
            residentsWithBeds.push({
              ...resident,
              bed: { ...bed, room }
            });
            continue;
          }
        }
      }
      
      residentsWithBeds.push({ ...resident });
    }
    
    return residentsWithBeds;
  }
  
  async getResident(id: number): Promise<Resident | undefined> {
    return this.residents.get(id);
  }
  
  async getResidentByBedId(bedId: number): Promise<Resident | undefined> {
    for (const resident of this.residents.values()) {
      if (resident.bedId === bedId) {
        return resident;
      }
    }
    return undefined;
  }
  
  async createResident(resident: InsertResident): Promise<Resident> {
    const id = this.residentId++;
    const newResident: Resident = { ...resident, id };
    this.residents.set(id, newResident);
    
    // Update bed status if bed is assigned
    if (resident.bedId) {
      const bed = this.beds.get(resident.bedId);
      if (bed) {
        this.updateBed(resident.bedId, { status: 'occupied' });
      }
    }
    
    return newResident;
  }
  
  async updateResident(id: number, resident: Partial<InsertResident>): Promise<Resident | undefined> {
    const existingResident = this.residents.get(id);
    if (!existingResident) return undefined;
    
    // Handle bed changes
    if (resident.bedId !== undefined && resident.bedId !== existingResident.bedId) {
      // If old bed exists, mark it as available
      if (existingResident.bedId) {
        const oldBed = this.beds.get(existingResident.bedId);
        if (oldBed) {
          this.updateBed(existingResident.bedId, { status: 'available' });
        }
      }
      
      // If new bed exists, mark it as occupied
      if (resident.bedId) {
        const newBed = this.beds.get(resident.bedId);
        if (newBed) {
          this.updateBed(resident.bedId, { status: 'occupied' });
        }
      }
    }
    
    const updatedResident = { ...existingResident, ...resident };
    this.residents.set(id, updatedResident);
    return updatedResident;
  }
  
  async deleteResident(id: number): Promise<boolean> {
    const resident = this.residents.get(id);
    if (resident && resident.bedId) {
      const bed = this.beds.get(resident.bedId);
      if (bed) {
        this.updateBed(resident.bedId, { status: 'available' });
      }
    }
    return this.residents.delete(id);
  }
  
  // Inventory operations
  async getInventoryItems(houseId?: number): Promise<InventoryItem[]> {
    const items = Array.from(this.inventoryItems.values());
    if (houseId) {
      return items.filter(item => item.houseId === houseId);
    }
    return items;
  }
  
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemId++;
    const newItem: InventoryItem = { ...item, id };
    this.inventoryItems.set(id, newItem);
    return newItem;
  }
  
  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
  
  // Payment operations
  async getPayments(residentId?: number): Promise<Payment[]> {
    const payments = Array.from(this.payments.values());
    if (residentId) {
      return payments.filter(payment => payment.residentId === residentId);
    }
    return payments;
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const newPayment: Payment = { ...payment, id };
    this.payments.set(id, newPayment);
    
    // Update resident payment status
    const resident = this.residents.get(payment.residentId);
    if (resident) {
      // Simple logic - could be more sophisticated
      this.updateResident(payment.residentId, { paymentStatus: 'paid' });
    }
    
    return newPayment;
  }
  
  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }
  
  // Message operations
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  // Maintenance operations
  async getMaintenanceRequests(roomId?: number): Promise<MaintenanceRequest[]> {
    const requests = Array.from(this.maintenanceRequests.values());
    if (roomId) {
      return requests.filter(request => request.roomId === roomId);
    }
    return requests;
  }
  
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }
  
  async createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = this.maintenanceRequestId++;
    const newRequest: MaintenanceRequest = { ...request, id };
    this.maintenanceRequests.set(id, newRequest);
    return newRequest;
  }
  
  async updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const existingRequest = this.maintenanceRequests.get(id);
    if (!existingRequest) return undefined;
    
    const updatedRequest = { ...existingRequest, ...request };
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
