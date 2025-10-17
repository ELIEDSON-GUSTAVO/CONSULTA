import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import healthRouter from "./routes/health";
import { jwtMiddleware } from "./middleware/auth";
import { insertConsultaSchema, updateConsultaSchema, insertSolicitacaoSchema, updateSolicitacaoSchema, insertPacienteSchema, updatePacienteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.use('/health', healthRouter);
  // GET all pacientes
  app.get("/api/pacientes", async (req, res) => {
    try {
      const { search } = req.query;
      let pacientes;
      
      if (search && typeof search === "string") {
        pacientes = await storage.searchPacientes(search);
      } else {
        pacientes = await storage.getPacientes();
      }
      
      res.json(pacientes);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
      res.status(500).json({ error: "Failed to fetch pacientes" });
    }
  });

  // GET single paciente by id
  app.get("/api/pacientes/:id", async (req, res) => {
    try {
      const paciente = await storage.getPaciente(req.params.id);
      if (!paciente) {
        return res.status(404).json({ error: "Paciente not found" });
      }
      res.json(paciente);
    } catch (error) {
      console.error("Error fetching paciente:", error);
      res.status(500).json({ error: "Failed to fetch paciente" });
    }
  });

  // GET consultas by paciente
  app.get("/api/pacientes/:id/consultas", async (req, res) => {
    try {
      const consultas = await storage.getConsultasByPaciente(req.params.id);
      res.json(consultas);
    } catch (error) {
      console.error("Error fetching consultas:", error);
      res.status(500).json({ error: "Failed to fetch consultas" });
    }
  });

  // POST create new paciente (protected)
  app.post("/api/pacientes", jwtMiddleware, async (req, res) => {
    try {
      const validated = insertPacienteSchema.parse(req.body);
      const paciente = await storage.createPaciente(validated);
      res.status(201).json(paciente);
    } catch (error) {
      console.error("Error creating paciente:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to create paciente" });
    }
  });

  // PATCH update paciente (protected)
  app.patch("/api/pacientes/:id", jwtMiddleware, async (req, res) => {
    try {
      const validated = updatePacienteSchema.parse(req.body);
      const paciente = await storage.updatePaciente(req.params.id, validated);
      if (!paciente) {
        return res.status(404).json({ error: "Paciente not found" });
      }
      res.json(paciente);
    } catch (error) {
      console.error("Error updating paciente:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to update paciente" });
    }
  });

  // DELETE paciente (protected)
  app.delete("/api/pacientes/:id", jwtMiddleware, async (req, res) => {
    try {
      const success = await storage.deletePaciente(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Paciente not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting paciente:", error);
      res.status(500).json({ error: "Failed to delete paciente" });
    }
  });

  // GET all consultas
  app.get("/api/consultas", async (req, res) => {
    try {
      const consultas = await storage.getConsultas();
      res.json(consultas);
    } catch (error) {
      console.error("Error fetching consultas:", error);
      res.status(500).json({ error: "Failed to fetch consultas" });
    }
  });

  // GET single consulta by id
  app.get("/api/consultas/:id", async (req, res) => {
    try {
      const consulta = await storage.getConsulta(req.params.id);
      if (!consulta) {
        return res.status(404).json({ error: "Consulta not found" });
      }
      res.json(consulta);
    } catch (error) {
      console.error("Error fetching consulta:", error);
      res.status(500).json({ error: "Failed to fetch consulta" });
    }
  });

  // POST create new consulta (protected)
  app.post("/api/consultas", jwtMiddleware, async (req, res) => {
    try {
      const validated = insertConsultaSchema.parse(req.body);
      const consulta = await storage.createConsulta(validated);
      res.status(201).json(consulta);
    } catch (error) {
      console.error("Error creating consulta:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to create consulta" });
    }
  });

  // PATCH update consulta (protected)
  app.patch("/api/consultas/:id", jwtMiddleware, async (req, res) => {
    try {
      const validated = updateConsultaSchema.parse(req.body);
      const consulta = await storage.updateConsulta(req.params.id, validated);
      if (!consulta) {
        return res.status(404).json({ error: "Consulta not found" });
      }
      res.json(consulta);
    } catch (error) {
      console.error("Error updating consulta:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to update consulta" });
    }
  });

  // DELETE consulta (protected)
  app.delete("/api/consultas/:id", jwtMiddleware, async (req, res) => {
    try {
      const success = await storage.deleteConsulta(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Consulta not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consulta:", error);
      res.status(500).json({ error: "Failed to delete consulta" });
    }
  });

  // GET all solicitacoes
  app.get("/api/solicitacoes", async (req, res) => {
    try {
      const solicitacoes = await storage.getSolicitacoes();
      res.json(solicitacoes);
    } catch (error) {
      console.error("Error fetching solicitacoes:", error);
      res.status(500).json({ error: "Failed to fetch solicitacoes" });
    }
  });

  // GET single solicitacao by id
  app.get("/api/solicitacoes/:id", async (req, res) => {
    try {
      const solicitacao = await storage.getSolicitacao(req.params.id);
      if (!solicitacao) {
        return res.status(404).json({ error: "Solicitacao not found" });
      }
      res.json(solicitacao);
    } catch (error) {
      console.error("Error fetching solicitacao:", error);
      res.status(500).json({ error: "Failed to fetch solicitacao" });
    }
  });

  // GET solicitacao by tracking code
  app.get("/api/solicitacoes/codigo/:codigo", async (req, res) => {
    try {
      const solicitacao = await storage.getSolicitacaoByCodigo(req.params.codigo);
      if (!solicitacao) {
        return res.status(404).json({ error: "Solicitacao not found" });
      }
      res.json(solicitacao);
    } catch (error) {
      console.error("Error fetching solicitacao by codigo:", error);
      res.status(500).json({ error: "Failed to fetch solicitacao" });
    }
  });

  // POST create new solicitacao (protected)
  app.post("/api/solicitacoes", jwtMiddleware, async (req, res) => {
    try {
      const validated = insertSolicitacaoSchema.parse(req.body);
      const solicitacao = await storage.createSolicitacao(validated);
      res.status(201).json(solicitacao);
    } catch (error) {
      console.error("Error creating solicitacao:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to create solicitacao" });
    }
  });

  // PATCH update solicitacao (aprovar/rejeitar) (protected)
  app.patch("/api/solicitacoes/:id", jwtMiddleware, async (req, res) => {
    try {
      const validated = updateSolicitacaoSchema.parse(req.body);
      const solicitacao = await storage.updateSolicitacao(req.params.id, validated);
      if (!solicitacao) {
        return res.status(404).json({ error: "Solicitacao not found" });
      }
      res.json(solicitacao);
    } catch (error) {
      console.error("Error updating solicitacao:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error });
      }
      res.status(500).json({ error: "Failed to update solicitacao" });
    }
  });

  // DELETE solicitacao (protected)
  app.delete("/api/solicitacoes/:id", jwtMiddleware, async (req, res) => {
    try {
      const success = await storage.deleteSolicitacao(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Solicitacao not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting solicitacao:", error);
      res.status(500).json({ error: "Failed to delete solicitacao" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
