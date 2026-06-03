import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const linksTable = pgTable("links", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  destinationUrl: text("destination_url").notNull(),
  status: text("status").notNull().default("active"),
  expiryDate: text("expiry_date"),
  clicks: integer("clicks").notNull().default(0),
  scans: integer("scans").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({ id: true, createdAt: true, updatedAt: true, clicks: true, scans: true });
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;
