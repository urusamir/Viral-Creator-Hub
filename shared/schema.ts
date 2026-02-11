import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("brand"),
  companyName: text("company_name"),
  website: text("website"),
  platforms: text("platforms").array(),
  monthlyBudget: integer("monthly_budget"),
  howFoundUs: text("how_found_us"),
  position: text("position"),
  department: text("department"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const onboardingStep1Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  website: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  monthlyBudget: z.number().optional(),
  howFoundUs: z.string().optional(),
});

export const onboardingStep2Schema = z.object({
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
