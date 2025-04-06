import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'partial', 'unpaid', 'overdue']);

// Define bed status enum
export const bedStatusEnum = pgEnum('bed_status', ['available', 'occupied', 'maintenance']);

// Define house table
export const houses = pgTable('houses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description'),
});

// Define room table
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  houseId: integer('house_id').references(() => houses.id).notNull(),
  name: text('name').notNull(),
  floor: integer('floor').default(1),
});

// Define bed table
export const beds = pgTable('beds', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).default('available').notNull(),
  notes: text('notes'),
});

// Define resident table
export const residents = pgTable('residents', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  emergencyContact: text('emergency_contact'),
  paymentStatus: text('payment_status', { enum: ['paid', 'partial', 'unpaid', 'overdue'] }).default('unpaid').notNull(),
  moveInDate: timestamp('move_in_date'),
  expectedDuration: text('expected_duration'),
  notes: text('notes'),
  photoUrl: text('photo_url'),
  bedId: integer('bed_id').references(() => beds.id),
});

// Define inventory item table
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  currentQuantity: integer('current_quantity').default(0).notNull(),
  minimumQuantity: integer('minimum_quantity').default(5).notNull(),
  amazonUrl: text('amazon_url'),
  notes: text('notes'),
  houseId: integer('house_id').references(() => houses.id).notNull(),
});

// Define payment table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id).notNull(),
  amount: integer('amount').notNull(), // stored in cents
  datePaid: timestamp('date_paid').notNull(),
  paymentMethod: text('payment_method').notNull(),
  notes: text('notes'),
  invoiceId: text('invoice_id'),
});

// Define messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  sentAt: timestamp('sent_at').notNull(),
  sender: text('sender').notNull(),
  recipientType: text('recipient_type', { enum: ['individual', 'house', 'all'] }).notNull(),
  recipientId: integer('recipient_id'), // Optional: if individual or house
});

// Define maintenance requests table
export const maintenanceRequests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  description: text('description').notNull(),
  requestedBy: integer('requested_by').references(() => residents.id),
  requestedAt: timestamp('requested_at').notNull(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed'] }).default('pending').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
  notes: text('notes'),
});

// Define insert schemas
export const insertHouseSchema = createInsertSchema(houses);
export const insertRoomSchema = createInsertSchema(rooms);
export const insertBedSchema = createInsertSchema(beds);
export const insertResidentSchema = createInsertSchema(residents);
export const insertInventoryItemSchema = createInsertSchema(inventoryItems);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests);

// Define insert types
export type InsertHouse = z.infer<typeof insertHouseSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertBed = z.infer<typeof insertBedSchema>;
export type InsertResident = z.infer<typeof insertResidentSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

// Define select types
export type House = typeof houses.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Bed = typeof beds.$inferSelect;
export type Resident = typeof residents.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;

// Extended types (for combined data needs)
export type BedWithRoom = Bed & { room: Room };
export type ResidentWithBed = Resident & { bed?: BedWithRoom };
