import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Clock, Calendar, User, FileText } from "lucide-react";
import { type Solicitacao } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AcompanharSolicitacao() {
  const [codigo, setCodigo] = useState("");
  const [codigoParaBuscar, setCodigoParaBuscar] = useState<string | null>(null);

  const { data: solicitacao, isLoading, error } = useQuery<Solicitacao>({
    queryKey: [`/api/solicitacoes/codigo/${codigoParaBuscar}`],
    enabled: !!codigoParaBuscar,
  });

  const handleBuscar = () => {
    if (codigo.trim()) {
      setCodigoParaBuscar(codigo.trim().toUpperCase());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case "aprovada":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" /> Aprovada</Badge>;
      case "rejeitada":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" /> Rejeitada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Acompanhar Solicitação</h1>
        <p className="text-muted-foreground mt-2">Digite seu código de rastreamento para verificar o status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Solicitação</CardTitle>
          <CardDescription>Insira o código que você recebeu ao enviar a solicitação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: S-00001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              className="font-mono"
              data-testid="input-codigo-rastreamento"
            />
            <Button onClick={handleBuscar} disabled={!codigo.trim()} data-testid="button-buscar">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </CardContent>
        </Card>
      )}

      {error && codigoParaBuscar && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium">Solicitação não encontrada</p>
              <p className="text-muted-foreground mt-2">
                Verifique se o código foi digitado corretamente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {solicitacao && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Status da sua Solicitação</CardTitle>
                <CardDescription className="mt-2 font-mono text-lg">
                  Código: {solicitacao.codigoRastreamento}
                </CardDescription>
              </div>
              {getStatusBadge(solicitacao.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm"><span className="font-medium">Nome:</span> {solicitacao.nomeFuncionario}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm"><span className="font-medium">Motivo:</span> {solicitacao.motivo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Solicitado em:</span>{" "}
                  {format(new Date(solicitacao.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {solicitacao.status === "pendente" && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mt-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Aguardando análise:</strong> Sua solicitação está sendo analisada pela psicóloga. Você será notificado quando houver uma resposta.
                </p>
              </div>
            )}

            {solicitacao.status === "aprovada" && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg mt-4">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>Solicitação aprovada!</strong> Sua consulta foi agendada. Em breve você receberá mais informações sobre data e horário.
                </p>
                {solicitacao.observacoesPsicologo && (
                  <p className="text-sm text-green-900 dark:text-green-100 mt-2">
                    <strong>Observações:</strong> {solicitacao.observacoesPsicologo}
                  </p>
                )}
              </div>
            )}

            {solicitacao.status === "rejeitada" && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg mt-4">
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>Solicitação não aprovada.</strong>
                </p>
                {solicitacao.observacoesPsicologo && (
                  <p className="text-sm text-red-900 dark:text-red-100 mt-2">
                    <strong>Motivo:</strong> {solicitacao.observacoesPsicologo}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
