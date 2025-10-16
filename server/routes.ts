import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConsultaSchema, updateConsultaSchema, insertSolicitacaoSchema, updateSolicitacaoSchema } from "@shared/schema";
import { sendConfirmationEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // POST create new consulta
  app.post("/api/consultas", async (req, res) => {
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

  // PATCH update consulta
  app.patch("/api/consultas/:id", async (req, res) => {
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

  // DELETE consulta
  app.delete("/api/consultas/:id", async (req, res) => {
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

  // POST create new solicitacao
  app.post("/api/solicitacoes", async (req, res) => {
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

  // PATCH update solicitacao (aprovar/rejeitar)
  app.patch("/api/solicitacoes/:id", async (req, res) => {
    try {
      const validated = updateSolicitacaoSchema.parse(req.body);
      const solicitacao = await storage.updateSolicitacao(req.params.id, validated);
      if (!solicitacao) {
        return res.status(404).json({ error: "Solicitacao not found" });
      }

      // Se a solicitação foi aprovada e tem email, enviar confirmação
      if (validated.status === "aprovada" && solicitacao.email && validated.consultaId) {
        const consulta = await storage.getConsulta(validated.consultaId);
        if (consulta) {
          await sendConfirmationEmail({
            to: solicitacao.email,
            funcionarioNome: solicitacao.nomeFuncionario,
            data: consulta.data,
            horario: consulta.horario,
          });
        }
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

  // DELETE solicitacao
  app.delete("/api/solicitacoes/:id", async (req, res) => {
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
