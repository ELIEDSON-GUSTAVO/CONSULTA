import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";
import { type Consulta } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Historico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");

  const { data: consultas = [], isLoading } = useQuery<Consulta[]>({
    queryKey: ["/api/consultas"],
  });

  const filteredConsultas = consultas.filter((consulta) => {
    const matchesSearch = consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || consulta.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      agendada: "bg-chart-3 text-white",
      realizada: "bg-chart-2 text-white",
      cancelada: "bg-muted text-muted-foreground",
    };
    const labels = {
      agendada: "Agendada",
      realizada: "Realizada",
      cancelada: "Cancelada",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]} data-testid={`badge-status-${status}`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Histórico</h1>
        <p className="text-muted-foreground mt-2">Visualize todas as consultas cadastradas</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Todas as Consultas</CardTitle>
              <CardDescription>
                {filteredConsultas.length} {filteredConsultas.length === 1 ? "consulta" : "consultas"} encontradas
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-paciente"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="agendada">Agendadas</SelectItem>
                  <SelectItem value="realizada">Realizadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredConsultas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma consulta encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "todas"
                  ? "Tente ajustar os filtros de busca"
                  : "O histórico está vazio"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConsultas.map((consulta) => (
                <Card key={consulta.id} className="hover-elevate" data-testid={`card-consulta-${consulta.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold" data-testid={`text-paciente-${consulta.id}`}>
                            {consulta.paciente}
                          </h3>
                          {getStatusBadge(consulta.status)}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-mono">
                              {format(new Date(consulta.data + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="font-mono ml-2">{consulta.horario}</span>
                          </div>
                        </div>
                        {consulta.observacoes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {consulta.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
