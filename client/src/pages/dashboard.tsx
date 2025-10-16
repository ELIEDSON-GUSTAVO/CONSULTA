import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Pencil, Trash2, Search, Plus } from "lucide-react";
import { type Consulta } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: consultas = [], isLoading } = useQuery<Consulta[]>({
    queryKey: ["/api/consultas"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/consultas/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/consultas"] });
      toast({
        title: "Consulta excluída",
        description: "A consulta foi removida com sucesso.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a consulta.",
        variant: "destructive",
      });
    },
  });

  const filteredConsultas = consultas.filter((consulta) =>
    consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split("T")[0];
  const consultasHoje = consultas.filter((c) => c.data === today);
  const consultasAgendadas = consultas.filter((c) => c.status === "agendada");
  const pacientesUnicos = new Set(consultas.map((c) => c.paciente)).size;

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
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral das consultas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-consultas-hoje">{consultasHoje.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total de consultas agendadas para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Total Pacientes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-pacientes">{pacientesUnicos}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Pacientes únicos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Pendentes</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-consultas-pendentes">{consultasAgendadas.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Consultas agendadas e não realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Consultas Recentes</CardTitle>
              <CardDescription>Histórico completo de atendimentos</CardDescription>
            </div>
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-paciente"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredConsultas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma consulta encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Tente ajustar sua busca"
                  : "Comece cadastrando sua primeira consulta"}
              </p>
              <Link href="/nova-consulta">
                <Button data-testid="button-nova-consulta-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Paciente</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Horário</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Observações</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsultas.map((consulta) => (
                    <tr
                      key={consulta.id}
                      className="border-b hover-elevate"
                      data-testid={`row-consulta-${consulta.id}`}
                    >
                      <td className="py-4 px-4 font-medium" data-testid={`text-paciente-${consulta.id}`}>
                        {consulta.paciente}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground font-mono text-sm">
                        {format(new Date(consulta.data + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground font-mono text-sm">
                        {consulta.horario}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(consulta.status)}</td>
                      <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                        {consulta.observacoes || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/editar-consulta/${consulta.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-edit-${consulta.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(consulta.id)}
                            data-testid={`button-delete-${consulta.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
