import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const consultas = pgTable("consultas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paciente: text("paciente").notNull(),
  data: date("data").notNull(),
  horario: time("horario").notNull(),
  status: text("status").notNull().default("agendada"),
  compareceu: text("compareceu"),
  especialidade: text("especialidade"),
  motivo: text("motivo"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsultaSchema = createInsertSchema(consultas).omit({
  id: true,
  createdAt: true,
}).extend({
  paciente: z.string().min(1, "Nome do paciente é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  horario: z.string().min(1, "Horário é obrigatório"),
  status: z.enum(["agendada", "realizada", "cancelada"]).default("agendada"),
  compareceu: z.enum(["sim", "nao", "pendente"]).optional(),
  especialidade: z.string().optional(),
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

export const updateConsultaSchema = insertConsultaSchema.partial();

export type InsertConsulta = z.infer<typeof insertConsultaSchema>;
export type UpdateConsulta = z.infer<typeof updateConsultaSchema>;
export type Consulta = typeof consultas.$inferSelect;
