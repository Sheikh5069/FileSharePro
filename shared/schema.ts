import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  shareId: text("share_id").notNull().unique(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  shareId: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
