import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Solicitacao, Paciente, InsertPaciente } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Calendar, User, Briefcase, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarSolicitacoes() {
  const { toast } = useToast();
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [horarioConsulta, setHorarioConsulta] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const { data: solicitacoes = [], isLoading } = useQuery<Solicitacao[]>({
    queryKey: ["/api/solicitacoes"],
  });

  const { data: pacientes = [], isFetching: isFetchingPacientes } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const aprovarMutation = useMutation({
    mutationFn: async (data: { id: string; observacoes: string; dataConsulta: string; horarioConsulta: string; especialidade: string }) => {
      if (isFetchingPacientes) {
        throw new Error("Aguardando carregamento dos pacientes...");
      }

      // Primeiro, criar ou encontrar o paciente
      let pacienteId: string;
      
      const pacienteExistente = pacientes.find(
        (p) => p.nome.toLowerCase() === selectedSolicitacao?.nomeFuncionario.toLowerCase()
      );

      if (pacienteExistente) {
        pacienteId = pacienteExistente.id;
      } else {
        const genero = selectedSolicitacao?.genero;
        const novoPacienteData: InsertPaciente = {
          nome: selectedSolicitacao?.nomeFuncionario || "",
          genero: genero === "masculino" || genero === "feminino" || genero === "outro" ? genero : undefined,
          setor: selectedSolicitacao?.setor || undefined,
          telefone: selectedSolicitacao?.telefone || undefined,
          email: selectedSolicitacao?.email || undefined,
        };
        const novoPaciente = await apiRequest("POST", "/api/pacientes", novoPacienteData) as unknown as Paciente;
        pacienteId = novoPaciente.id;
      }

      // Atualizar a solicitação
      await apiRequest("PATCH", `/api/solicitacoes/${data.id}`, {
        status: "aprovada",
        observacoesPsicologo: data.observacoes,
      });

      // Criar a consulta vinculada ao paciente
      await apiRequest("POST", "/api/consultas", {
        pacienteId,
        genero: selectedSolicitacao?.genero,
        setor: selectedSolicitacao?.setor,
        data: data.dataConsulta,
        horario: data.horarioConsulta,
        status: "agendada",
        especialidade: data.especialidade,
        motivo: selectedSolicitacao?.motivo || "",
        observacoes: `Solicitação aprovada. ${data.observacoes}`,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/solicitacoes"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/consultas"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/pacientes"] });
      toast({
        title: "Solicitação aprovada!",
        description: "O paciente foi cadastrado e a consulta foi agendada com sucesso.",
      });
      setIsApproveDialogOpen(false);
      setSelectedSolicitacao(null);
      setObservacoes("");
      setDataConsulta("");
      setHorarioConsulta("");
      setEspecialidade("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: async (data: { id: string; observacoes: string }) => {
      await apiRequest("PATCH", `/api/solicitacoes/${data.id}`, {
        status: "rejeitada",
        observacoesPsicologo: data.observacoes,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/solicitacoes"] });
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi rejeitada.",
      });
      setIsRejectDialogOpen(false);
      setSelectedSolicitacao(null);
      setObservacoes("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const handleAprovar = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setDataConsulta(solicitacao.dataPreferencial || "");
    setHorarioConsulta("");
    setEspecialidade("");
    setObservacoes("");
    setIsApproveDialogOpen(true);
  };

  const handleRejeitar = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setObservacoes("");
    setIsRejectDialogOpen(true);
  };

  const confirmAprovar = () => {
    if (selectedSolicitacao && dataConsulta && horarioConsulta) {
      aprovarMutation.mutate({
        id: selectedSolicitacao.id,
        observacoes,
        dataConsulta,
        horarioConsulta,
        especialidade,
      });
    }
  };

  const confirmRejeitar = () => {
    if (selectedSolicitacao) {
      rejeitarMutation.mutate({
        id: selectedSolicitacao.id,
        observacoes,
      });
    }
  };

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === "pendente");
  const solicitacoesAprovadas = solicitacoes.filter(s => s.status === "aprovada");
  const solicitacoesRejeitadas = solicitacoes.filter(s => s.status === "rejeitada");

  const renderSolicitacaoCard = (solicitacao: Solicitacao) => (
    <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {solicitacao.nomeFuncionario}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {solicitacao.setor}
              {solicitacao.genero && ` • ${solicitacao.genero.charAt(0).toUpperCase() + solicitacao.genero.slice(1)}`}
            </CardDescription>
          </div>
          {solicitacao.status === "pendente" && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Pendente
            </Badge>
          )}
          {solicitacao.status === "aprovada" && (
            <Badge className="gap-1 bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Aprovada
            </Badge>
          )}
          {solicitacao.status === "rejeitada" && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Rejeitada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Motivo</p>
              <p className="text-sm text-muted-foreground">{solicitacao.motivo}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Descrição</p>
              <p className="text-sm text-muted-foreground">{solicitacao.descricao}</p>
            </div>
          </div>

          {solicitacao.dataPreferencial && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data Preferencial</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(solicitacao.dataPreferencial + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  {solicitacao.horarioPreferencial && ` • ${solicitacao.horarioPreferencial}`}
                </p>
              </div>
            </div>
          )}

          {solicitacao.observacoesPsicologo && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Observações da Psicóloga</p>
              <p className="text-sm text-muted-foreground">{solicitacao.observacoesPsicologo}</p>
            </div>
          )}
        </div>

        {solicitacao.status === "pendente" && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => handleAprovar(solicitacao)}
              className="flex-1 gap-2"
              data-testid={`button-aprovar-${solicitacao.id}`}
            >
              <CheckCircle className="h-4 w-4" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejeitar(solicitacao)}
              className="flex-1 gap-2"
              data-testid={`button-rejeitar-${solicitacao.id}`}
            >
              <XCircle className="h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Solicitado em {format(new Date(solicitacao.createdAt), "dd/MM/yyyy 'às' HH:mm")}
        </p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Gerenciar Solicitações</h1>
        <p className="text-muted-foreground">Carregando solicitações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Gerenciar Solicitações</h1>
        <p className="text-muted-foreground mt-2">Aprove ou rejeite solicitações de atendimento psicológico</p>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes" className="gap-2" data-testid="tab-pendentes">
            <Clock className="h-4 w-4" />
            Pendentes ({solicitacoesPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="aprovadas" className="gap-2" data-testid="tab-aprovadas">
            <CheckCircle className="h-4 w-4" />
            Aprovadas ({solicitacoesAprovadas.length})
          </TabsTrigger>
          <TabsTrigger value="rejeitadas" className="gap-2" data-testid="tab-rejeitadas">
            <XCircle className="h-4 w-4" />
            Rejeitadas ({solicitacoesRejeitadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {solicitacoesPendentes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {solicitacoesPendentes.map(renderSolicitacaoCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aprovadas" className="space-y-4">
          {solicitacoesAprovadas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação aprovada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {solicitacoesAprovadas.map(renderSolicitacaoCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejeitadas" className="space-y-4">
          {solicitacoesRejeitadas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação rejeitada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {solicitacoesRejeitadas.map(renderSolicitacaoCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aprovar Solicitação</DialogTitle>
            <DialogDescription>
              Agende a consulta para {selectedSolicitacao?.nomeFuncionario}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Consulta *</Label>
              <Input
                id="data"
                type="date"
                value={dataConsulta}
                onChange={(e) => setDataConsulta(e.target.value)}
                data-testid="input-data-consulta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horário da Consulta *</Label>
              <Input
                id="horario"
                type="time"
                value={horarioConsulta}
                onChange={(e) => setHorarioConsulta(e.target.value)}
                data-testid="input-horario-consulta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                placeholder="Ex: Terapia Cognitiva"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                data-testid="input-especialidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes-aprovar">Observações</Label>
              <Textarea
                id="observacoes-aprovar"
                placeholder="Adicione observações sobre a aprovação..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                data-testid="input-observacoes-aprovar"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} data-testid="button-cancelar-aprovar">
              Cancelar
            </Button>
            <Button
              onClick={confirmAprovar}
              disabled={!dataConsulta || !horarioConsulta || aprovarMutation.isPending || isFetchingPacientes}
              data-testid="button-confirmar-aprovar"
            >
              {aprovarMutation.isPending ? "Aprovando..." : isFetchingPacientes ? "Carregando..." : "Aprovar e Agendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja rejeitar a solicitação de {selectedSolicitacao?.nomeFuncionario}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observacoes-rejeitar">Motivo da Rejeição</Label>
              <Textarea
                id="observacoes-rejeitar"
                placeholder="Explique o motivo da rejeição..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                data-testid="input-observacoes-rejeitar"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} data-testid="button-cancelar-rejeitar">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejeitar}
              disabled={rejeitarMutation.isPending}
              data-testid="button-confirmar-rejeitar"
            >
              {rejeitarMutation.isPending ? "Rejeitando..." : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
