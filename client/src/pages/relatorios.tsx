import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Consulta } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Relatorios() {
  const { data: consultas = [], isLoading } = useQuery<Consulta[]>({
    queryKey: ["/api/consultas"],
  });

  const getPeriodo = (horario: string) => {
    const hora = parseInt(horario.split(":")[0]);
    if (hora >= 6 && hora < 12) return "Manhã";
    if (hora >= 12 && hora < 18) return "Tarde";
    return "Noite";
  };

  const totalConsultas = consultas.length;
  
  const comparecimento = {
    sim: consultas.filter(c => c.compareceu === "sim").length,
    nao: consultas.filter(c => c.compareceu === "nao").length,
    pendente: consultas.filter(c => c.compareceu === "pendente" || !c.compareceu).length,
  };

  const porPeriodo = consultas.reduce((acc, c) => {
    const periodo = getPeriodo(c.horario);
    acc[periodo] = (acc[periodo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const porEspecialidade = consultas.reduce((acc, c) => {
    if (c.especialidade) {
      acc[c.especialidade] = (acc[c.especialidade] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const porMotivo = consultas.reduce((acc, c) => {
    if (c.motivo) {
      acc[c.motivo] = (acc[c.motivo] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const evolucaoMensal = consultas.reduce((acc, c) => {
    const date = new Date(c.data + "T00:00:00");
    const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[mesAno] = (acc[mesAno] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const periodoData = Object.entries(porPeriodo).map(([name, value]) => ({
    name,
    total: value,
    percentual: totalConsultas > 0 ? ((value / totalConsultas) * 100).toFixed(1) : "0.0",
  }));

  const especialidadeData = Object.entries(porEspecialidade).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + "..." : name,
    total: value,
    percentual: totalConsultas > 0 ? ((value / totalConsultas) * 100).toFixed(1) : "0.0",
  }));

  const motivoData = Object.entries(porMotivo).map(([name, value]) => ({
    name,
    total: value,
    percentual: totalConsultas > 0 ? ((value / totalConsultas) * 100).toFixed(1) : "0.0",
  }));

  const evolucaoData = Object.entries(evolucaoMensal)
    .map(([mesAno, value]) => {
      const [ano, mes] = mesAno.split("-");
      const mesNome = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString("pt-BR", { 
        month: "short", 
        year: "numeric" 
      });
      return {
        mes: mesNome,
        consultas: value,
        sortKey: mesAno,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Relatórios e Estatísticas</h1>
        <p className="text-muted-foreground mt-2">Análise completa dos atendimentos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Total de Consultas</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-consultas">{totalConsultas}</div>
            <p className="text-xs text-muted-foreground mt-2">Consultas marcadas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Compareceram</CardTitle>
            <CheckCircle className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2" data-testid="text-compareceram">
              {comparecimento.sim}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalConsultas > 0 ? ((comparecimento.sim / totalConsultas) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Não Compareceram</CardTitle>
            <XCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive" data-testid="text-nao-compareceram">
              {comparecimento.nao}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalConsultas > 0 ? ((comparecimento.nao / totalConsultas) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Atendimentos por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {periodoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={periodoData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
            )}
            <div className="mt-4 space-y-2">
              {periodoData.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.total} ({item.percentual}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Atendimentos por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            {especialidadeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={especialidadeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
            )}
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {especialidadeData.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.name}</span>
                  <span className="font-medium whitespace-nowrap">{item.total} ({item.percentual}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Atendimentos por Motivo</CardTitle>
        </CardHeader>
        <CardContent>
          {motivoData.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {motivoData.map((item) => (
                <div key={item.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.percentual}% do total</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{item.total}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Evolução Mensal de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {evolucaoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="consultas"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
