import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NovaConsulta from "@/pages/nova-consulta";
import EditarConsulta from "@/pages/editar-consulta";
import Historico from "@/pages/historico";
import Relatorios from "@/pages/relatorios";
import SolicitarAtendimento from "@/pages/solicitar-atendimento";
import AcompanharSolicitacao from "@/pages/acompanhar-solicitacao";
import GerenciarSolicitacoes from "@/pages/gerenciar-solicitacoes";
import Pacientes from "@/pages/pacientes";
import PerfilPaciente from "@/pages/perfil-paciente";
import NotFound from "@/pages/not-found";

type UserType = "funcionario" | "psicologa" | null;

function Router({ userType }: { userType: UserType }) {
  if (userType === "funcionario") {
    return (
      <Switch>
        <Route path="/solicitar-atendimento" component={SolicitarAtendimento} />
        <Route path="/acompanhar-solicitacao" component={AcompanharSolicitacao} />
        <Route path="/" component={SolicitarAtendimento} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (userType === "psicologa") {
    return (
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pacientes" component={Pacientes} />
        <Route path="/pacientes/:id" component={PerfilPaciente} />
        <Route path="/nova-consulta" component={NovaConsulta} />
        <Route path="/editar-consulta/:id" component={EditarConsulta} />
        <Route path="/historico" component={Historico} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/gerenciar-solicitacoes" component={GerenciarSolicitacoes} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return null;
}

function App() {
  const [userType, setUserType] = useState<UserType>(null);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleLogout = () => {
    setUserType(null);
  };

  if (!userType) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Login onLogin={setUserType} />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar userType={userType} />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {userType === "psicologa" ? "Psicóloga" : "Funcionário"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                  <Router userType={userType} />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
