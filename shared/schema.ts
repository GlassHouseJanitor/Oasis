import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, json, uniqueIndex, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'partial', 'unpaid', 'overdue']);

// Define bed status enum
export const bedStatusEnum = pgEnum('bed_status', ['available', 'occupied', 'maintenance']);

// Define file type enum
export const fileTypeEnum = pgEnum('file_type', ['photo', 'document', 'invoice', 'medical', 'legal', 'other']);

// Define document status enum
export const documentStatusEnum = pgEnum('document_status', ['pending', 'approved', 'rejected', 'expired']);

// Define house table
export const houses = pgTable('houses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define room table
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  houseId: integer('house_id').references(() => houses.id).notNull(),
  name: text('name').notNull(),
  floor: integer('floor').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define bed table
export const beds = pgTable('beds', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).default('available').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  photoUrl: text('photo_url'), // Storing URL or file path to resident photo
  bedId: integer('bed_id').references(() => beds.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the invoice table
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  amount: integer('amount').notNull(), // stored in cents
  dueDate: date('due_date').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'overdue', 'cancelled'] }).default('pending').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define payment table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id).notNull(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  amount: integer('amount').notNull(), // stored in cents
  datePaid: timestamp('date_paid').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define files table for all uploads (photos, documents, invoices)
export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // in bytes
  path: text('path').notNull(), // storage path
  url: text('url'), // URL for access if different from path
  fileType: text('file_type', { enum: ['photo', 'document', 'invoice', 'medical', 'legal', 'other'] }).notNull(),
  residentId: integer('resident_id').references(() => residents.id),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  paymentId: integer('payment_id').references(() => payments.id),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'expired'] }).default('pending'),
  metadata: json('metadata'), // For additional file metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define resident documents table (for important resident-specific documents)
export const residentDocuments = pgTable('resident_documents', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id).notNull(),
  fileId: integer('file_id').references(() => files.id).notNull(),
  documentType: text('document_type', { enum: ['id', 'medical', 'insurance', 'agreement', 'other'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  expiryDate: date('expiry_date'),
  isRequired: boolean('is_required').default(false),
  isVerified: boolean('is_verified').default(false),
  verifiedBy: integer('verified_by'), // Staff ID if we add staff table later
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations between tables
export const houseRelations = relations(houses, ({ many }) => ({
  rooms: many(rooms),
  inventoryItems: many(inventoryItems),
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  house: one(houses, {
    fields: [rooms.houseId],
    references: [houses.id],
  }),
  beds: many(beds),
  maintenanceRequests: many(maintenanceRequests),
}));

export const bedRelations = relations(beds, ({ one, many }) => ({
  room: one(rooms, {
    fields: [beds.roomId],
    references: [rooms.id],
  }),
  residents: many(residents),
}));

export const residentRelations = relations(residents, ({ one, many }) => ({
  bed: one(beds, {
    fields: [residents.bedId],
    references: [beds.id],
  }),
  invoices: many(invoices),
  payments: many(payments),
  files: many(files),
  documents: many(residentDocuments),
}));

export const invoiceRelations = relations(invoices, ({ one, many }) => ({
  resident: one(residents, {
    fields: [invoices.residentId],
    references: [residents.id],
  }),
  payments: many(payments),
  files: many(files),
}));

export const paymentRelations = relations(payments, ({ one, many }) => ({
  resident: one(residents, {
    fields: [payments.residentId],
    references: [residents.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  files: many(files),
}));

export const fileRelations = relations(files, ({ one, many }) => ({
  resident: one(residents, {
    fields: [files.residentId],
    references: [residents.id],
  }),
  invoice: one(invoices, {
    fields: [files.invoiceId],
    references: [invoices.id],
  }),
  payment: one(payments, {
    fields: [files.paymentId],
    references: [payments.id],
  }),
  residentDocuments: many(residentDocuments),
}));

export const residentDocumentRelations = relations(residentDocuments, ({ one }) => ({
  resident: one(residents, {
    fields: [residentDocuments.residentId],
    references: [residents.id],
  }),
  file: one(files, {
    fields: [residentDocuments.fileId],
    references: [files.id],
  }),
}));

// Define insert schemas
export const insertHouseSchema = createInsertSchema(houses);
export const insertRoomSchema = createInsertSchema(rooms);
export const insertBedSchema = createInsertSchema(beds);
export const insertResidentSchema = createInsertSchema(residents);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertFileSchema = createInsertSchema(files);
export const insertResidentDocumentSchema = createInsertSchema(residentDocuments);
export const insertInventoryItemSchema = createInsertSchema(inventoryItems);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests);

// Define insert types
export type InsertHouse = z.infer<typeof insertHouseSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertBed = z.infer<typeof insertBedSchema>;
export type InsertResident = z.infer<typeof insertResidentSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type InsertResidentDocument = z.infer<typeof insertResidentDocumentSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

// Define select types
export type House = typeof houses.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Bed = typeof beds.$inferSelect;
export type Resident = typeof residents.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type File = typeof files.$inferSelect;
export type ResidentDocument = typeof residentDocuments.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;

// Extended types (for combined data needs)
export type BedWithRoom = Bed & { room: Room };
export type ResidentWithBed = Resident & { bed?: BedWithRoom };
export type ResidentWithDocuments = Resident & { documents: ResidentDocument[] & { file: File }[] };
export type InvoiceWithFiles = Invoice & { files: File[] };
