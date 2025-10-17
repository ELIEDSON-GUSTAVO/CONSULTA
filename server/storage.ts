// Reference: javascript_database blueprint
import { consultas, solicitacoes, pacientes, type Consulta, type InsertConsulta, type UpdateConsulta, type Solicitacao, type InsertSolicitacao, type UpdateSolicitacao, type Paciente, type InsertPaciente, type UpdatePaciente } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, like } from "drizzle-orm";

export interface IStorage {
  getPacientes(): Promise<Paciente[]>;
  getPaciente(id: string): Promise<Paciente | undefined>;
  getPacienteByCodigo(codigo: string): Promise<Paciente | undefined>;
  searchPacientes(query: string): Promise<Paciente[]>;
  createPaciente(paciente: InsertPaciente): Promise<Paciente>;
  updatePaciente(id: string, paciente: UpdatePaciente): Promise<Paciente | undefined>;
  deletePaciente(id: string): Promise<boolean>;
  
  getConsultas(): Promise<Consulta[]>;
  getConsulta(id: string): Promise<Consulta | undefined>;
  getConsultasByPaciente(pacienteId: string): Promise<Consulta[]>;
  createConsulta(consulta: InsertConsulta): Promise<Consulta>;
  updateConsulta(id: string, consulta: UpdateConsulta): Promise<Consulta | undefined>;
  deleteConsulta(id: string): Promise<boolean>;
  
  getSolicitacoes(): Promise<Solicitacao[]>;
  getSolicitacao(id: string): Promise<Solicitacao | undefined>;
  getSolicitacaoByCodigo(codigo: string): Promise<Solicitacao | undefined>;
  createSolicitacao(solicitacao: InsertSolicitacao): Promise<Solicitacao>;
  updateSolicitacao(id: string, solicitacao: UpdateSolicitacao): Promise<Solicitacao | undefined>;
  deleteSolicitacao(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private async generateCodigoProntuario(): Promise<string> {
    const allPacientes = await db.select().from(pacientes).orderBy(desc(pacientes.createdAt));
    
    if (allPacientes.length === 0) {
      return "P-00001";
    }
    
    const lastCodigo = allPacientes[0].codigoProntuario;
    const numeroMatch = lastCodigo.match(/P-(\d+)/);
    
    if (numeroMatch) {
      const numero = parseInt(numeroMatch[1]) + 1;
      return `P-${String(numero).padStart(5, '0')}`;
    }
    
    return "P-00001";
  }

  private async generateCodigoRastreamento(): Promise<string> {
    const allSolicitacoes = await db.select().from(solicitacoes).orderBy(desc(solicitacoes.createdAt));
    
    if (allSolicitacoes.length === 0) {
      return "S-00001";
    }
    
    const lastCodigo = allSolicitacoes[0].codigoRastreamento;
    const numeroMatch = lastCodigo.match(/S-(\d+)/);
    
    if (numeroMatch) {
      const numero = parseInt(numeroMatch[1]) + 1;
      return `S-${String(numero).padStart(5, '0')}`;
    }
    
    return "S-00001";
  }

  async getPacientes(): Promise<Paciente[]> {
    return await db.select().from(pacientes).orderBy(desc(pacientes.createdAt));
  }

  async getPaciente(id: string): Promise<Paciente | undefined> {
    try {
      const [paciente] = await db.select().from(pacientes).where(eq(pacientes.id, id));
      return paciente || undefined;
    } catch (error) {
      console.error("Error fetching paciente:", error);
      return undefined;
    }
  }

  async getPacienteByCodigo(codigo: string): Promise<Paciente | undefined> {
    try {
      const [paciente] = await db.select().from(pacientes).where(eq(pacientes.codigoProntuario, codigo));
      return paciente || undefined;
    } catch (error) {
      console.error("Error fetching paciente by codigo:", error);
      return undefined;
    }
  }

  async searchPacientes(query: string): Promise<Paciente[]> {
    try {
      return await db.select().from(pacientes).where(
        sql`${pacientes.nome} ILIKE ${`%${query}%`} OR ${pacientes.codigoProntuario} ILIKE ${`%${query}%`}`
      ).orderBy(desc(pacientes.createdAt));
    } catch (error) {
      console.error("Error searching pacientes:", error);
      return [];
    }
  }

  async createPaciente(insertPaciente: InsertPaciente): Promise<Paciente> {
    // Retry logic para evitar conflitos de código de prontuário
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        const codigoProntuario = await this.generateCodigoProntuario();
        const [paciente] = await db
          .insert(pacientes)
          .values({ ...insertPaciente, codigoProntuario })
          .returning();
        return paciente;
      } catch (error: any) {
        // Se for erro de constraint de unicidade, tentar novamente
        if (error?.code === '23505' && attempts < maxAttempts - 1) {
          attempts++;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        throw error;
      }
    }
    
    throw new Error('Não foi possível criar paciente após múltiplas tentativas');
  }

  async updatePaciente(id: string, updatePaciente: UpdatePaciente): Promise<Paciente | undefined> {
    try {
      const [paciente] = await db
        .update(pacientes)
        .set(updatePaciente)
        .where(eq(pacientes.id, id))
        .returning();
      return paciente || undefined;
    } catch (error) {
      console.error("Error updating paciente:", error);
      return undefined;
    }
  }

  async deletePaciente(id: string): Promise<boolean> {
    try {
      // Primeiro, deletar todas as consultas associadas ao paciente
      await db.delete(consultas).where(eq(consultas.pacienteId, id));
      
      // Depois, deletar o paciente
      const result = await db.delete(pacientes).where(eq(pacientes.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting paciente:", error);
      return false;
    }
  }

  async getConsultas(): Promise<Consulta[]> {
    // Buscar consultas com join de pacientes para preencher o nome
    const consultasRaw = await db.select().from(consultas).orderBy(desc(consultas.createdAt));
    
    // Para cada consulta, buscar o nome do paciente se tiver pacienteId
    const consultasComPaciente = await Promise.all(
      consultasRaw.map(async (consulta) => {
        if (consulta.pacienteId && !consulta.paciente) {
          const paciente = await this.getPaciente(consulta.pacienteId);
          if (paciente) {
            return { ...consulta, paciente: paciente.nome, genero: paciente.genero, setor: paciente.setor };
          }
        }
        return consulta;
      })
    );
    
    return consultasComPaciente;
  }

  async getConsultasByPaciente(pacienteId: string): Promise<Consulta[]> {
    return await db.select().from(consultas).where(eq(consultas.pacienteId, pacienteId)).orderBy(desc(consultas.createdAt));
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

  async getSolicitacoes(): Promise<Solicitacao[]> {
    return await db.select().from(solicitacoes).orderBy(desc(solicitacoes.createdAt));
  }

  async getSolicitacao(id: string): Promise<Solicitacao | undefined> {
    try {
      const [solicitacao] = await db.select().from(solicitacoes).where(eq(solicitacoes.id, id));
      return solicitacao || undefined;
    } catch (error) {
      console.error("Error fetching solicitacao:", error);
      return undefined;
    }
  }

  async getSolicitacaoByCodigo(codigo: string): Promise<Solicitacao | undefined> {
    try {
      const [solicitacao] = await db.select().from(solicitacoes).where(eq(solicitacoes.codigoRastreamento, codigo));
      return solicitacao || undefined;
    } catch (error) {
      console.error("Error fetching solicitacao by codigo:", error);
      return undefined;
    }
  }

  async createSolicitacao(insertSolicitacao: InsertSolicitacao): Promise<Solicitacao> {
    // Retry logic para evitar conflitos de código de rastreamento
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        const codigoRastreamento = await this.generateCodigoRastreamento();
        const [solicitacao] = await db
          .insert(solicitacoes)
          .values({ ...insertSolicitacao, codigoRastreamento })
          .returning();
        return solicitacao;
      } catch (error: any) {
        // Se for erro de constraint de unicidade, tentar novamente
        if (error?.code === '23505' && attempts < maxAttempts - 1) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        throw error;
      }
    }
    
    throw new Error('Não foi possível criar solicitação após múltiplas tentativas');
  }

  async updateSolicitacao(id: string, updateSolicitacao: UpdateSolicitacao): Promise<Solicitacao | undefined> {
    try {
      const [solicitacao] = await db
        .update(solicitacoes)
        .set(updateSolicitacao)
        .where(eq(solicitacoes.id, id))
        .returning();
      return solicitacao || undefined;
    } catch (error) {
      console.error("Error updating solicitacao:", error);
      return undefined;
    }
  }

  async deleteSolicitacao(id: string): Promise<boolean> {
    try {
      const result = await db.delete(solicitacoes).where(eq(solicitacoes.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting solicitacao:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
