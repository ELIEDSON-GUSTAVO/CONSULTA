import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { insertConsultaSchema, type InsertConsulta, type Consulta } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function EditarConsulta() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: consulta, isLoading } = useQuery<Consulta>({
    queryKey: ["/api/consultas", id],
    enabled: !!id,
  });

  const form = useForm<InsertConsulta>({
    resolver: zodResolver(insertConsultaSchema),
    defaultValues: {
      paciente: "",
      data: "",
      horario: "",
      status: "agendada",
      compareceu: "pendente",
      especialidade: "",
      motivo: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (consulta) {
      form.reset({
        paciente: consulta.paciente,
        data: consulta.data,
        horario: consulta.horario,
        status: consulta.status as "agendada" | "realizada" | "cancelada",
        compareceu: (consulta.compareceu as "sim" | "nao" | "pendente") || "pendente",
        especialidade: consulta.especialidade || "",
        motivo: consulta.motivo || "",
        observacoes: consulta.observacoes || "",
      });
    }
  }, [consulta, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertConsulta) => {
      await apiRequest("PATCH", `/api/consultas/${id}`, data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/consultas"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/consultas", id] }),
      ]);
      toast({
        title: "Consulta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a consulta.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertConsulta) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!consulta) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Consulta não encontrada</h2>
        <p className="text-muted-foreground mb-6">A consulta solicitada não existe.</p>
        <Link href="/">
          <Button>Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Editar Consulta</h1>
          <p className="text-muted-foreground mt-2">Atualize as informações da consulta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Informações da Consulta</CardTitle>
          <CardDescription>Atualize os dados da consulta abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="paciente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Nome do Paciente <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome completo do paciente"
                        {...field}
                        data-testid="input-paciente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Data <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-data"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Horário <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          data-testid="input-horario"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="realizada">Realizada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="especialidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Especialidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-especialidade">
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Psicologia Clínica">Psicologia Clínica</SelectItem>
                          <SelectItem value="Psicologia Organizacional">Psicologia Organizacional</SelectItem>
                          <SelectItem value="Terapia Cognitivo-Comportamental">Terapia Cognitivo-Comportamental</SelectItem>
                          <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                          <SelectItem value="Orientação Vocacional">Orientação Vocacional</SelectItem>
                          <SelectItem value="Avaliação Psicológica">Avaliação Psicológica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compareceu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Comparecimento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-compareceu">
                            <SelectValue placeholder="Paciente compareceu?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
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
                    <FormLabel className="text-sm font-medium">Motivo da Consulta</FormLabel>
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
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite observações sobre a consulta (opcional)"
                        rows={5}
                        {...field}
                        data-testid="input-observacoes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
