// Reference: javascript_database blueprint
import { consultas, type Consulta, type InsertConsulta, type UpdateConsulta } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getConsultas(): Promise<Consulta[]>;
  getConsulta(id: string): Promise<Consulta | undefined>;
  createConsulta(consulta: InsertConsulta): Promise<Consulta>;
  updateConsulta(id: string, consulta: UpdateConsulta): Promise<Consulta | undefined>;
  deleteConsulta(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getConsultas(): Promise<Consulta[]> {
    return await db.select().from(consultas).orderBy(desc(consultas.createdAt));
  }

  async getConsulta(id: string): Promise<Consulta | undefined> {
    try {
      const [consulta] = await db.select().from(consultas).where(eq(consultas.id, id));
      return consulta || undefined;
    } catch (error) {
      console.error("Error fetching consulta:", error);
      return undefined;
    }
  }

  async createConsulta(insertConsulta: InsertConsulta): Promise<Consulta> {
    const [consulta] = await db
      .insert(consultas)
      .values(insertConsulta)
      .returning();
    return consulta;
  }

  async updateConsulta(id: string, updateConsulta: UpdateConsulta): Promise<Consulta | undefined> {
    try {
      const [consulta] = await db
        .update(consultas)
        .set(updateConsulta)
        .where(eq(consultas.id, id))
        .returning();
      return consulta || undefined;
    } catch (error) {
      console.error("Error updating consulta:", error);
      return undefined;
    }
  }

  async deleteConsulta(id: string): Promise<boolean> {
    try {
      const result = await db.delete(consultas).where(eq(consultas.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting consulta:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
