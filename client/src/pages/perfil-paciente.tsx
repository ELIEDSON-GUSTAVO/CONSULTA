import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, FileText, Trash2, Plus } from "lucide-react";
import { type Paciente, type Consulta } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PerfilPaciente() {
  const [, params] = useRoute("/pacientes/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const pacienteId = params?.id || "";

  const { data: paciente, isLoading: loadingPaciente } = useQuery<Paciente>({
    queryKey: [`/api/pacientes/${pacienteId}`],
  });

  const { data: consultas = [], isLoading: loadingConsultas } = useQuery<Consulta[]>({
    queryKey: [`/api/pacientes/${pacienteId}/consultas`],
  });

  const deleteMutation = useMutation({
    mutationFn: async (consultaId: string) => {
      await apiRequest("DELETE", `/api/consultas/${consultaId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/pacientes/${pacienteId}/consultas`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/consultas"] });
      toast({
        title: "Consulta excluída",
        description: "A consulta foi removida do histórico.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a consulta.",
        variant: "destructive",
      });
    },
  });

  if (loadingPaciente || loadingConsultas) {
    return <div className="space-y-6"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;
  }

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <p>Paciente não encontrado</p>
        <Button onClick={() => setLocation("/pacientes")} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "realizada": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "cancelada": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getCompareceuColor = (compareceu: string) => {
    switch (compareceu) {
      case "sim": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "nao": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setLocation("/pacientes")} data-testid="button-voltar">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{paciente.nome}</CardTitle>
              <CardDescription className="mt-2 font-mono text-lg">{paciente.codigoProntuario}</CardDescription>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {paciente.genero && (
            <p className="text-sm"><span className="font-medium">Gênero:</span> {paciente.genero}</p>
          )}
          {paciente.setor && (
            <p className="text-sm"><span className="font-medium">Setor:</span> {paciente.setor}</p>
          )}
          {paciente.email && (
            <p className="text-sm"><span className="font-medium">Email:</span> {paciente.email}</p>
          )}
          {paciente.telefone && (
            <p className="text-sm"><span className="font-medium">Telefone:</span> {paciente.telefone}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Consultas</CardTitle>
              <CardDescription>{consultas.length} consulta{consultas.length !== 1 ? 's' : ''} registrada{consultas.length !== 1 ? 's' : ''}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {consultas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma consulta registrada</p>
          ) : (
            <div className="space-y-4">
              {consultas.map((consulta) => (
                <Card key={consulta.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(consulta.data + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{consulta.horario}</span>
                          </div>
                          <Badge className={getStatusColor(consulta.status)}>
                            {consulta.status}
                          </Badge>
                          {consulta.compareceu && (
                            <Badge className={getCompareceuColor(consulta.compareceu)}>
                              {consulta.compareceu === "sim" ? "Compareceu" : consulta.compareceu === "nao" ? "Não compareceu" : "Pendente"}
                            </Badge>
                          )}
                        </div>
                        {consulta.motivo && (
                          <p className="text-sm"><span className="font-medium">Motivo:</span> {consulta.motivo}</p>
                        )}
                        {consulta.observacoes && (
                          <p className="text-sm text-muted-foreground">{consulta.observacoes}</p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-delete-${consulta.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir consulta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A consulta será permanentemente removida do histórico.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(consulta.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
