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
import { insertSolicitacaoSchema, type InsertSolicitacao } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

export default function SolicitarAtendimento() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      status: "pendente",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSolicitacao) => {
      await apiRequest("POST", "/api/solicitacoes", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/solicitacoes"] });
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para análise da psicóloga.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSolicitacao) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Solicitar Atendimento Psicológico</h1>
          <p className="text-muted-foreground mt-2">Preencha o formulário para solicitar um atendimento</p>
        </div>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-setor">
                            <SelectValue placeholder="Selecione seu setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Administrativo">Administrativo</SelectItem>
                          <SelectItem value="Operacional">Operacional</SelectItem>
                          <SelectItem value="Comercial">Comercial</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="RH">RH</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="Logística">Logística</SelectItem>
                          <SelectItem value="Produção">Produção</SelectItem>
                        </SelectContent>
                      </Select>
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
                <Link href="/">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
