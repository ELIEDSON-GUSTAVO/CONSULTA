import { Home, Plus, History, BarChart3, UserPlus, ClipboardCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import nextLogoUrl from "@assets/e4e65a_fe3ebb908b914ff3b921b1c684c4eba0~mv2_1760629074249.jpg";

const psicologaMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Gerenciar Solicitações",
    url: "/gerenciar-solicitacoes",
    icon: ClipboardCheck,
  },
  {
    title: "Nova Consulta",
    url: "/nova-consulta",
    icon: Plus,
  },
  {
    title: "Histórico",
    url: "/historico",
    icon: History,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
];

const funcionarioMenuItems = [
  {
    title: "Solicitar Atendimento",
    url: "/solicitar-atendimento",
    icon: UserPlus,
  },
];

interface AppSidebarProps {
  userType: "funcionario" | "psicologa";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const [location] = useLocation();
  const menuItems = userType === "psicologa" ? psicologaMenuItems : funcionarioMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <img 
            src={nextLogoUrl} 
            alt="NEXT Implementos" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-lg font-semibold">NEXT Implementos</h1>
            <p className="text-xs text-muted-foreground">Gestão de Consultas</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {userType === "psicologa" ? "Menu Principal" : "Funcionário"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, "-")}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
