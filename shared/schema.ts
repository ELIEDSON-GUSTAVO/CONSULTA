import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const consultas = pgTable("consultas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paciente: text("paciente").notNull(),
  genero: text("genero"),
  setor: text("setor"),
  data: date("data").notNull(),
  horario: time("horario").notNull(),
  status: text("status").notNull().default("agendada"),
  compareceu: text("compareceu"),
  especialidade: text("especialidade"),
  motivo: text("motivo"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const solicitacoes = pgTable("solicitacoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nomeFuncionario: text("nome_funcionario").notNull(),
  genero: text("genero"),
  setor: text("setor").notNull(),
  motivo: text("motivo").notNull(),
  descricao: text("descricao").notNull(),
  dataPreferencial: date("data_preferencial"),
  horarioPreferencial: text("horario_preferencial"),
  status: text("status").notNull().default("pendente"),
  consultaId: varchar("consulta_id"),
  observacoesPsicologo: text("observacoes_psicologo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsultaSchema = createInsertSchema(consultas).omit({
  id: true,
  createdAt: true,
}).extend({
  paciente: z.string().min(1, "Nome do paciente é obrigatório"),
  genero: z.enum(["masculino", "feminino", "outro"]).optional(),
  setor: z.string().optional(),
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

export const insertSolicitacaoSchema = createInsertSchema(solicitacoes).omit({
  id: true,
  createdAt: true,
  consultaId: true,
  observacoesPsicologo: true,
}).extend({
  nomeFuncionario: z.string().min(1, "Nome é obrigatório"),
  genero: z.enum(["masculino", "feminino", "outro"]).optional(),
  setor: z.string().min(1, "Setor é obrigatório"),
  motivo: z.string().min(1, "Motivo é obrigatório"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  dataPreferencial: z.string().optional(),
  horarioPreferencial: z.string().optional(),
  status: z.enum(["pendente", "aprovada", "rejeitada"]).default("pendente"),
});

export const updateSolicitacaoSchema = z.object({
  status: z.enum(["pendente", "aprovada", "rejeitada"]),
  observacoesPsicologo: z.string().optional(),
  consultaId: z.string().optional(),
});

export type InsertSolicitacao = z.infer<typeof insertSolicitacaoSchema>;
export type UpdateSolicitacao = z.infer<typeof updateSolicitacaoSchema>;
export type Solicitacao = typeof solicitacoes.$inferSelect;
