import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, X } from "lucide-react";
import { type Consulta } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Historico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [mesFilter, setMesFilter] = useState<string>("todos");
  const [anoFilter, setAnoFilter] = useState<string>("todos");
  const [periodoFilter, setPeriodoFilter] = useState<string>("todos");
  const [motivoFilter, setMotivoFilter] = useState<string>("todos");
  const [compareceuFilter, setCompareceuFilter] = useState<string>("todos");
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>("todas");
  const [setorFilter, setSetorFilter] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);

  const { data: consultas = [], isLoading } = useQuery<Consulta[]>({
    queryKey: ["/api/consultas"],
  });

  const getPeriodo = (horario: string) => {
    const hora = parseInt(horario.split(":")[0]);
    if (hora >= 6 && hora < 12) return "Manhã";
    if (hora >= 12 && hora < 18) return "Tarde";
    return "Noite";
  };

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();
    consultas.forEach(c => {
      const date = new Date(c.data + "T00:00:00");
      meses.add(String(date.getMonth() + 1).padStart(2, "0"));
    });
    return Array.from(meses).sort();
  }, [consultas]);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<string>();
    consultas.forEach(c => {
      const date = new Date(c.data + "T00:00:00");
      anos.add(String(date.getFullYear()));
    });
    return Array.from(anos).sort();
  }, [consultas]);

  const motivosDisponiveis = useMemo(() => {
    const motivos = new Set<string>();
    consultas.forEach(c => {
      if (c.motivo) motivos.add(c.motivo);
    });
    return Array.from(motivos).sort();
  }, [consultas]);

  const especialidadesDisponiveis = useMemo(() => {
    const especialidades = new Set<string>();
    consultas.forEach(c => {
      if (c.especialidade) especialidades.add(c.especialidade);
    });
    return Array.from(especialidades).sort();
  }, [consultas]);

  const setoresDisponiveis = useMemo(() => {
    const setores = new Set<string>();
    consultas.forEach(c => {
      if (c.setor) setores.add(c.setor);
    });
    return Array.from(setores).sort();
  }, [consultas]);

  const filteredConsultas = consultas.filter((consulta) => {
    const matchesSearch = consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || consulta.status === statusFilter;
    
    const date = new Date(consulta.data + "T00:00:00");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = String(date.getFullYear());
    const matchesMes = mesFilter === "todos" || mes === mesFilter;
    const matchesAno = anoFilter === "todos" || ano === anoFilter;
    
    const periodo = getPeriodo(consulta.horario);
    const matchesPeriodo = periodoFilter === "todos" || periodo === periodoFilter;
    
    const matchesMotivo = motivoFilter === "todos" || consulta.motivo === motivoFilter;
    const matchesCompareceu = compareceuFilter === "todos" || consulta.compareceu === compareceuFilter;
    const matchesEspecialidade = especialidadeFilter === "todas" || consulta.especialidade === especialidadeFilter;
    const matchesSetor = setorFilter === "todos" || consulta.setor === setorFilter;
    
    return matchesSearch && matchesStatus && matchesMes && matchesAno && matchesPeriodo && 
           matchesMotivo && matchesCompareceu && matchesEspecialidade && matchesSetor;
  });

  const limparFiltros = () => {
    setSearchTerm("");
    setStatusFilter("todas");
    setMesFilter("todos");
    setAnoFilter("todos");
    setPeriodoFilter("todos");
    setMotivoFilter("todos");
    setCompareceuFilter("todos");
    setEspecialidadeFilter("todas");
    setSetorFilter("todos");
  };

  const temFiltrosAtivos = statusFilter !== "todas" || mesFilter !== "todos" || anoFilter !== "todos" || 
                          periodoFilter !== "todos" || motivoFilter !== "todos" || compareceuFilter !== "todos" ||
                          especialidadeFilter !== "todas" || setorFilter !== "todos" || searchTerm !== "";

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

  const getCompareceuBadge = (compareceu: string | null) => {
    if (!compareceu || compareceu === "pendente") {
      return <Badge variant="outline" className="text-muted-foreground">Pendente</Badge>;
    }
    if (compareceu === "sim") {
      return <Badge className="bg-chart-2 text-white">Compareceu</Badge>;
    }
    return <Badge className="bg-destructive text-white">Não Compareceu</Badge>;
  };

  const mesesNomes: Record<string, string> = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Histórico</h1>
        <p className="text-muted-foreground mt-2">Visualize todas as consultas cadastradas com filtros avançados</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold">Todas as Consultas</CardTitle>
                <CardDescription>
                  {filteredConsultas.length} {filteredConsultas.length === 1 ? "consulta" : "consultas"} encontradas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avançados
                </Button>
                {temFiltrosAtivos && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-paciente"
                />
              </div>

              {showFilters && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 bg-muted/50 rounded-lg">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todos os Status</SelectItem>
                      <SelectItem value="agendada">Agendadas</SelectItem>
                      <SelectItem value="realizada">Realizadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={mesFilter} onValueChange={setMesFilter}>
                    <SelectTrigger data-testid="select-mes-filter">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Meses</SelectItem>
                      {mesesDisponiveis.map(mes => (
                        <SelectItem key={mes} value={mes}>{mesesNomes[mes]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={anoFilter} onValueChange={setAnoFilter}>
                    <SelectTrigger data-testid="select-ano-filter">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Anos</SelectItem>
                      {anosDisponiveis.map(ano => (
                        <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                    <SelectTrigger data-testid="select-periodo-filter">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Períodos</SelectItem>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={compareceuFilter} onValueChange={setCompareceuFilter}>
                    <SelectTrigger data-testid="select-compareceu-filter">
                      <SelectValue placeholder="Comparecimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="sim">Compareceu</SelectItem>
                      <SelectItem value="nao">Não Compareceu</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={especialidadeFilter} onValueChange={setEspecialidadeFilter}>
                    <SelectTrigger data-testid="select-especialidade-filter">
                      <SelectValue placeholder="Especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Especialidades</SelectItem>
                      {especialidadesDisponiveis.map(esp => (
                        <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={motivoFilter} onValueChange={setMotivoFilter}>
                    <SelectTrigger data-testid="select-motivo-filter">
                      <SelectValue placeholder="Motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Motivos</SelectItem>
                      {motivosDisponiveis.map(mot => (
                        <SelectItem key={mot} value={mot}>{mot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={setorFilter} onValueChange={setSetorFilter}>
                    <SelectTrigger data-testid="select-setor-filter">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Setores</SelectItem>
                      {setoresDisponiveis.map(setor => (
                        <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredConsultas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma consulta encontrada</h3>
              <p className="text-muted-foreground">
                {temFiltrosAtivos
                  ? "Tente ajustar os filtros de busca"
                  : "O histórico está vazio"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConsultas.map((consulta) => (
                <Card key={consulta.id} className="hover-elevate" data-testid={`card-consulta-${consulta.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold" data-testid={`text-paciente-${consulta.id}`}>
                              {consulta.paciente}
                            </h3>
                            {getStatusBadge(consulta.status)}
                            {getCompareceuBadge(consulta.compareceu)}
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-mono">
                                {format(new Date(consulta.data + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <span className="font-mono ml-2">{consulta.horario}</span>
                              <span className="ml-2">({getPeriodo(consulta.horario)})</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {consulta.especialidade && (
                              <Badge variant="outline" className="font-normal">
                                {consulta.especialidade}
                              </Badge>
                            )}
                            {consulta.motivo && (
                              <Badge variant="outline" className="font-normal">
                                {consulta.motivo}
                              </Badge>
                            )}
                            {consulta.setor && (
                              <Badge variant="outline" className="font-normal">
                                Setor: {consulta.setor}
                              </Badge>
                            )}
                            {consulta.genero && (
                              <Badge variant="outline" className="font-normal">
                                {consulta.genero === "masculino" ? "M" : consulta.genero === "feminino" ? "F" : "Outro"}
                              </Badge>
                            )}
                          </div>
                          {consulta.observacoes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {consulta.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
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
