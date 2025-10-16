import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConsultaSchema, updateConsultaSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
