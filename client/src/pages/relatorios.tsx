import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type Consulta } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const PERIOD_COLORS = {
  'Manhã': 'hsl(var(--chart-2))',
  'Tarde': 'hsl(var(--chart-3))',
  'Noite': 'hsl(var(--chart-4))'
};
const GENDER_COLORS = {
  'masculino': '#3b82f6',
  'feminino': '#ec4899',
  'outro': '#8b5cf6'
};

export default function Relatorios() {
  const [selectedSetor, setSelectedSetor] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const porSetor = consultas.reduce((acc, c) => {
    const setor = c.setor || "Não informado";
    if (!acc[setor]) {
      acc[setor] = {
        total: 0,
        compareceram: 0,
        naoCompareceram: 0,
        pendentes: 0
      };
    }
    acc[setor].total += 1;
    if (c.compareceu === "sim") acc[setor].compareceram += 1;
    if (c.compareceu === "nao") acc[setor].naoCompareceram += 1;
    if (c.compareceu === "pendente" || !c.compareceu) acc[setor].pendentes += 1;
    return acc;
  }, {} as Record<string, { total: number; compareceram: number; naoCompareceram: number; pendentes: number }>);

  const evolucaoMensal = consultas.reduce((acc, c) => {
    const date = new Date(c.data + "T00:00:00");
    const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!acc[mesAno]) {
      acc[mesAno] = { total: 0, agendadas: 0, realizadas: 0, canceladas: 0, masculino: 0, feminino: 0, outro: 0 };
    }
    
    acc[mesAno].total += 1;
    
    if (c.status === "agendada") acc[mesAno].agendadas += 1;
    if (c.status === "realizada") acc[mesAno].realizadas += 1;
    if (c.status === "cancelada") acc[mesAno].canceladas += 1;
    
    if (c.genero === "masculino") acc[mesAno].masculino += 1;
    if (c.genero === "feminino") acc[mesAno].feminino += 1;
    if (c.genero === "outro") acc[mesAno].outro += 1;
    
    return acc;
  }, {} as Record<string, { total: number; agendadas: number; realizadas: number; canceladas: number; masculino: number; feminino: number; outro: number }>);

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

  const setorData = Object.entries(porSetor).map(([name, value]) => ({
    name,
    nameShort: name.length > 15 ? name.substring(0, 12) + "..." : name,
    total: value.total,
    compareceram: value.compareceram,
    naoCompareceram: value.naoCompareceram,
    pendentes: value.pendentes,
    percentualParticipacao: totalConsultas > 0 ? ((value.total / totalConsultas) * 100).toFixed(1) : "0.0",
    percentualComparecimento: value.total > 0 ? ((value.compareceram / value.total) * 100).toFixed(1) : "0.0",
  })).sort((a, b) => b.total - a.total);

  const evolucaoData = Object.entries(evolucaoMensal)
    .map(([mesAno, value]) => {
      const [ano, mes] = mesAno.split("-");
      const mesNome = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString("pt-BR", { 
        month: "short", 
        year: "numeric" 
      }).replace(/\./g, '');
      return {
        mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
        total: value.total,
        agendadas: value.agendadas,
        realizadas: value.realizadas,
        canceladas: value.canceladas,
        masculino: value.masculino,
        feminino: value.feminino,
        outro: value.outro,
        sortKey: mesAno,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  
  const calcularTendencia = () => {
    if (evolucaoData.length < 2) return { tipo: "neutro", percentual: 0 };
    
    const ultimoMes = evolucaoData[evolucaoData.length - 1].total;
    const penultimoMes = evolucaoData[evolucaoData.length - 2].total;
    
    if (penultimoMes === 0) return { tipo: "neutro", percentual: 0 };
    
    const variacao = ((ultimoMes - penultimoMes) / penultimoMes) * 100;
    
    return {
      tipo: variacao > 0 ? "alta" : variacao < 0 ? "baixa" : "neutro",
      percentual: Math.abs(variacao).toFixed(1)
    };
  };
  
  const tendencia = calcularTendencia();

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
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={periodoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentual }) => `${name}: ${percentual}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="total"
                    >
                      {periodoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PERIOD_COLORS[entry.name as keyof typeof PERIOD_COLORS] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {periodoData.map((item, index) => (
                    <div key={item.name} className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: PERIOD_COLORS[item.name as keyof typeof PERIOD_COLORS] || COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.total} ({item.percentual}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
            )}
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
            <div className="grid gap-6 md:grid-cols-2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={motivoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentual }) => `${percentual}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="total"
                  >
                    {motivoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col justify-center space-y-2">
                {motivoData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.percentual}% do total</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">{item.total}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Estatísticas por Setor</CardTitle>
          <CardDescription>Total de consultas, participação e comparecimento por setor</CardDescription>
        </CardHeader>
        <CardContent>
          {setorData.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Setor</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Total</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">% Participação</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Compareceram</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">% Comparecimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setorData.map((item) => (
                      <tr key={item.name} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-medium">{item.name}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">
                            {item.total}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {item.percentualParticipacao}%
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{item.compareceram}</span>
                            <span className="text-xs text-muted-foreground">
                              ({item.naoCompareceram} não / {item.pendentes} pendentes)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                            parseFloat(item.percentualComparecimento) >= 80 
                              ? "bg-chart-2/10 text-chart-2"
                              : parseFloat(item.percentualComparecimento) >= 50
                              ? "bg-chart-3/10 text-chart-3"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {item.percentualComparecimento}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Clique nas barras para ver detalhes do setor
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={setorData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        const setor = data.activePayload[0].payload.name;
                        setSelectedSetor(setor);
                        setDialogOpen(true);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                    <XAxis 
                      dataKey="nameShort" 
                      className="text-xs" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      angle={0}
                      height={60}
                      interval={0}
                    />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        padding: "12px"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "600" }}
                      formatter={(value, name, props) => {
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const item = setorData.find(d => d.nameShort === label);
                        return item?.name || label;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar 
                      dataKey="compareceram" 
                      fill="#10b981" 
                      name="Compareceram" 
                      radius={[8, 8, 0, 0]}
                      cursor="pointer"
                    />
                    <Bar 
                      dataKey="naoCompareceram" 
                      fill="#ef4444" 
                      name="Não Compareceram" 
                      radius={[8, 8, 0, 0]}
                      cursor="pointer"
                    />
                    <Bar 
                      dataKey="pendentes" 
                      fill="#94a3b8" 
                      name="Pendentes" 
                      radius={[8, 8, 0, 0]}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Evolução Mensal de Consultas</CardTitle>
              <CardDescription>Acompanhamento detalhado por status ao longo dos meses</CardDescription>
            </div>
            {evolucaoData.length >= 2 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                tendencia.tipo === "alta" 
                  ? "bg-chart-2/10 text-chart-2" 
                  : tendencia.tipo === "baixa" 
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tendencia.tipo === "alta" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : tendencia.tipo === "baixa" ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span className="text-sm font-semibold">
                  {tendencia.tipo === "neutro" ? "Estável" : `${tendencia.percentual}%`}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {evolucaoData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs" 
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "12px"
                    }}
                    labelStyle={{ 
                      color: "hsl(var(--foreground))",
                      fontWeight: "600",
                      marginBottom: "8px"
                    }}
                    itemStyle={{ padding: "4px 0" }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Bar dataKey="realizadas" fill="hsl(var(--chart-2))" name="Realizadas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="agendadas" fill="hsl(var(--chart-3))" name="Agendadas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="canceladas" fill="hsl(var(--destructive))" name="Canceladas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 border-t pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Média Mensal</p>
                  <p className="text-2xl font-bold">
                    {evolucaoData.length > 0 
                      ? Math.round(evolucaoData.reduce((acc, m) => acc + m.total, 0) / evolucaoData.length)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">consultas/mês</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Melhor Mês</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {evolucaoData.length > 0
                      ? Math.max(...evolucaoData.map(m => m.total))
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {evolucaoData.length > 0
                      ? evolucaoData.find(m => m.total === Math.max(...evolucaoData.map(d => d.total)))?.mes
                      : "-"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxa de Realização</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {totalConsultas > 0
                      ? Math.round((consultas.filter(c => c.status === "realizada").length / totalConsultas) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">consultas concluídas</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxa de Cancelamento</p>
                  <p className="text-2xl font-bold text-destructive">
                    {totalConsultas > 0
                      ? Math.round((consultas.filter(c => c.status === "cancelada").length / totalConsultas) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">consultas canceladas</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Distribuição por Gênero - Evolução Mensal</CardTitle>
          <CardDescription>Análise da distribuição de gênero dos pacientes ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {evolucaoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolucaoData}>
                <defs>
                  <linearGradient id="colorMasculino" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorFeminino" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOutro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                <XAxis 
                  dataKey="mes" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "12px"
                  }}
                  labelStyle={{ 
                    color: "hsl(var(--foreground))",
                    fontWeight: "600",
                    marginBottom: "8px"
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="masculino"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorMasculino)"
                  name="Masculino"
                />
                <Area
                  type="monotone"
                  dataKey="feminino"
                  stackId="1"
                  stroke="#ec4899"
                  fill="url(#colorFeminino)"
                  name="Feminino"
                />
                <Area
                  type="monotone"
                  dataKey="outro"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="url(#colorOutro)"
                  name="Outro"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Setor: {selectedSetor}</DialogTitle>
            <DialogDescription>
              Estatísticas completas e detalhadas do setor selecionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedSetor && (() => {
            const setorInfo = setorData.find(s => s.name === selectedSetor);
            const consultasDoSetor = consultas.filter(c => (c.setor || "Não informado") === selectedSetor);
            
            if (!setorInfo || consultasDoSetor.length === 0) {
              return <p className="text-center text-muted-foreground py-8">Nenhum dado disponível para este setor</p>;
            }

            const porStatus = {
              agendada: consultasDoSetor.filter(c => c.status === "agendada").length,
              realizada: consultasDoSetor.filter(c => c.status === "realizada").length,
              cancelada: consultasDoSetor.filter(c => c.status === "cancelada").length,
            };

            const porGenero = {
              masculino: consultasDoSetor.filter(c => c.genero === "masculino").length,
              feminino: consultasDoSetor.filter(c => c.genero === "feminino").length,
              outro: consultasDoSetor.filter(c => c.genero === "outro").length,
            };

            const especialidades = consultasDoSetor.reduce((acc, c) => {
              if (c.especialidade) {
                acc[c.especialidade] = (acc[c.especialidade] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);

            const motivos = consultasDoSetor.reduce((acc, c) => {
              if (c.motivo) {
                acc[c.motivo] = (acc[c.motivo] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);

            return (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total de Consultas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{setorInfo.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setorInfo.percentualParticipacao}% do total geral
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Comparecimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-2">{setorInfo.percentualComparecimento}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setorInfo.compareceram} de {setorInfo.total} consultas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-muted-foreground">{setorInfo.pendentes}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setorInfo.naoCompareceram} não compareceram
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status das Consultas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Agendadas</span>
                          <span className="text-sm font-bold text-chart-3">{porStatus.agendada}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Realizadas</span>
                          <span className="text-sm font-bold text-chart-2">{porStatus.realizada}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Canceladas</span>
                          <span className="text-sm font-bold text-destructive">{porStatus.cancelada}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS.masculino }} />
                            <span className="text-sm">Masculino</span>
                          </div>
                          <span className="text-sm font-bold">{porGenero.masculino}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS.feminino }} />
                            <span className="text-sm">Feminino</span>
                          </div>
                          <span className="text-sm font-bold">{porGenero.feminino}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS.outro }} />
                            <span className="text-sm">Outro</span>
                          </div>
                          <span className="text-sm font-bold">{porGenero.outro}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {Object.keys(especialidades).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Especialidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(especialidades)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([esp, count]) => (
                            <div key={esp} className="flex items-center justify-between py-2 border-b last:border-0">
                              <span className="text-sm">{esp}</span>
                              <span className="text-sm font-bold text-primary">{count}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {Object.keys(motivos).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Principais Motivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(motivos)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([motivo, count]) => (
                            <div key={motivo} className="flex items-center justify-between py-2 border-b last:border-0">
                              <span className="text-sm">{motivo}</span>
                              <span className="text-sm font-bold text-primary">{count}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
