import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Search, Plus, FileText, ChevronDown, ChevronUp, Mail, Phone, User, Briefcase } from "lucide-react";
import { type Paciente } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Pacientes() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const { data: pacientes = [], isLoading } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes", searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/api/pacientes?search=${encodeURIComponent(searchQuery)}` : "/api/pacientes";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="space-y-6"><div className="h-64 bg-muted animate-pulse rounded-lg" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Pacientes</h1>
          <p className="text-muted-foreground mt-2">Gestão de prontuários e histórico</p>
        </div>
        <Button onClick={() => setLocation("/nova-consulta")} data-testid="button-nova-consulta">
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
          <CardDescription>Pesquise por nome ou código de prontuário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite o nome ou código do paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pacientes.map((paciente) => {
          const isExpanded = expandedCards.has(paciente.id);
          return (
            <Card key={paciente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{paciente.nome}</CardTitle>
                    <CardDescription className="mt-1 font-mono text-sm">
                      {paciente.codigoProntuario}
                    </CardDescription>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={isExpanded} onOpenChange={() => toggleCard(paciente.id)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between mb-2"
                      data-testid={`button-toggle-${paciente.id}`}
                    >
                      <span className="text-sm">Ver detalhes</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 pt-2">
                    {paciente.genero && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="capitalize">{paciente.genero}</span>
                      </div>
                    )}
                    {paciente.setor && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{paciente.setor}</span>
                      </div>
                    )}
                    {paciente.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{paciente.email}</span>
                      </div>
                    )}
                    {paciente.telefone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{paciente.telefone}</span>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation(`/pacientes/${paciente.id}`)}
                      data-testid={`button-view-profile-${paciente.id}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Prontuário Completo
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pacientes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Nenhum paciente encontrado</p>
            <p className="text-muted-foreground mt-2">
              {searchQuery ? "Tente outra busca" : "Cadastre pacientes através de Nova Consulta"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
