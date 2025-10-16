import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { insertSolicitacaoSchema, type InsertSolicitacao, type Solicitacao } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SolicitarAtendimento() {
  const { toast } = useToast();
  const [codigoRastreamento, setCodigoRastreamento] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<InsertSolicitacao>({
    resolver: zodResolver(insertSolicitacaoSchema),
    defaultValues: {
      nomeFuncionario: "",
      genero: undefined,
      setor: "",
      motivo: "",
      descricao: "",
      dataPreferencial: "",
      horarioPreferencial: "",
      email: "",
      telefone: "",
      status: "pendente",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSolicitacao) => {
      const solicitacao = await apiRequest("POST", "/api/solicitacoes", data) as unknown as Solicitacao;
      return solicitacao;
    },
    onSuccess: async (solicitacao) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/solicitacoes"] });
      setCodigoRastreamento(solicitacao.codigoRastreamento);
      setShowSuccessDialog(true);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const handleCopyCodigo = () => {
    if (codigoRastreamento) {
      navigator.clipboard.writeText(codigoRastreamento);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Código copiado!",
        description: "O código de rastreamento foi copiado para a área de transferência.",
      });
    }
  };

  const onSubmit = (data: InsertSolicitacao) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Solicitar Atendimento Psicológico</h1>
        <p className="text-muted-foreground mt-2">Preencha o formulário para solicitar um atendimento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Formulário de Solicitação</CardTitle>
          <CardDescription>
            Sua solicitação será analisada pela psicóloga responsável
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nomeFuncionario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Seu Nome <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome completo"
                        {...field}
                        data-testid="input-nome-funcionario"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-genero">
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="setor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Setor <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu setor (Ex: Administrativo, RH, TI...)"
                          {...field}
                          data-testid="input-setor"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Motivo Principal <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-motivo">
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                        <SelectItem value="Depressão">Depressão</SelectItem>
                        <SelectItem value="Estresse no Trabalho">Estresse no Trabalho</SelectItem>
                        <SelectItem value="Relacionamentos">Relacionamentos</SelectItem>
                        <SelectItem value="Autoestima">Autoestima</SelectItem>
                        <SelectItem value="Luto">Luto</SelectItem>
                        <SelectItem value="Transtornos de Ansiedade">Transtornos de Ansiedade</SelectItem>
                        <SelectItem value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Descrição <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva brevemente o motivo da solicitação e o que você gostaria de abordar nas sessões..."
                        rows={5}
                        {...field}
                        data-testid="input-descricao"
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo de 10 caracteres. Essa informação é confidencial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dataPreferencial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Data Preferencial (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-data-preferencial"
                        />
                      </FormControl>
                      <FormDescription>
                        Sugestão de data para o atendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horarioPreferencial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Horário Preferencial (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-horario-preferencial">
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manhã (8h-12h)">Manhã (8h-12h)</SelectItem>
                          <SelectItem value="Tarde (13h-17h)">Tarde (13h-17h)</SelectItem>
                          <SelectItem value="Sem preferência">Sem preferência</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sugestão de período para o atendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormDescription>
                        Receba confirmação quando sua consulta for aprovada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          {...field}
                          data-testid="input-telefone"
                        />
                      </FormControl>
                      <FormDescription>
                        Número para contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                  className="gap-2"
                >
                  {createMutation.isPending ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitação enviada com sucesso!</DialogTitle>
            <DialogDescription>
              Sua solicitação foi enviada para análise da psicóloga. Use o código abaixo para acompanhar o status da sua solicitação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Código de rastreamento:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-2xl font-mono font-semibold tracking-wider" data-testid="text-codigo-rastreamento">
                  {codigoRastreamento}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCodigo}
                  data-testid="button-copiar-codigo"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Importante:</strong> Guarde este código! Você pode usar a página de "Acompanhar Solicitação" para verificar o status a qualquer momento.
              </p>
            </div>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
              data-testid="button-fechar-dialog"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
