import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Clock, FileText, Trash2, Plus, Save, UserX } from "lucide-react";
import { type Paciente, type Consulta } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
  const [observacoes, setObservacoes] = useState("");
  const [isEditingObservacoes, setIsEditingObservacoes] = useState(false);

  const { data: paciente, isLoading: loadingPaciente } = useQuery<Paciente>({
    queryKey: [`/api/pacientes/${pacienteId}`],
  });

  const { data: consultas = [], isLoading: loadingConsultas } = useQuery<Consulta[]>({
    queryKey: [`/api/pacientes/${pacienteId}/consultas`],
  });

  useEffect(() => {
    if (paciente) {
      setObservacoes(paciente.observacoes || "");
    }
  }, [paciente]);

  const deleteConsultaMutation = useMutation({
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

  const updateObservacoesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/pacientes/${pacienteId}`, {
        observacoes,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/pacientes/${pacienteId}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/pacientes"] });
      toast({
        title: "Observações atualizadas",
        description: "As observações do paciente foram salvas com sucesso.",
      });
      setIsEditingObservacoes(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as observações.",
        variant: "destructive",
      });
    },
  });

  const deletePacienteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/pacientes/${pacienteId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/pacientes"] });
      toast({
        title: "Paciente excluído",
        description: "O paciente foi removido do sistema.",
      });
      setLocation("/pacientes");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o paciente.",
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
            <div className="flex-1">
              <CardTitle className="text-2xl">{paciente.nome}</CardTitle>
              <CardDescription className="mt-2 font-mono text-lg">{paciente.codigoProntuario}</CardDescription>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" data-testid="button-excluir-paciente">
                    <UserX className="h-4 w-4 mr-2" />
                    Excluir Paciente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O paciente e todo seu histórico de consultas serão permanentemente removidos do sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deletePacienteMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="button-confirmar-excluir-paciente"
                    >
                      Excluir Permanentemente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
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
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Observações da Psicóloga</label>
              {!isEditingObservacoes ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditingObservacoes(true)}
                  data-testid="button-editar-observacoes"
                >
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setObservacoes(paciente.observacoes || "");
                      setIsEditingObservacoes(false);
                    }}
                    data-testid="button-cancelar-observacoes"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => updateObservacoesMutation.mutate()}
                    disabled={updateObservacoesMutation.isPending}
                    data-testid="button-salvar-observacoes"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateObservacoesMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              )}
            </div>
            {isEditingObservacoes ? (
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre o paciente..."
                rows={5}
                data-testid="textarea-observacoes"
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {paciente.observacoes || "Nenhuma observação registrada"}
              </p>
            )}
          </div>
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
                              onClick={() => deleteConsultaMutation.mutate(consulta.id)}
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
