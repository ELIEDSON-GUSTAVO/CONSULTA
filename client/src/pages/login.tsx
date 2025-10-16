import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Stethoscope, ArrowRight } from "lucide-react";
import nextLogoUrl from "@assets/e4e65a_fe3ebb908b914ff3b921b1c684c4eba0~mv2_1760629074249.jpg";

interface LoginProps {
  onLogin: (userType: "funcionario" | "psicologa") => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [showPsicologaLogin, setShowPsicologaLogin] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleFuncionarioClick = () => {
    onLogin("funcionario");
    setLocation("/solicitar-atendimento");
  };

  const handlePsicologaLogin = () => {
    if (senha === "NEXTPY@2026") {
      onLogin("psicologa");
      setLocation("/");
    } else {
      setErro("Senha incorreta");
      setSenha("");
    }
  };

  if (showPsicologaLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={nextLogoUrl} 
                alt="NEXT Implementos" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">Login da Psicóloga</CardTitle>
              <CardDescription>Digite sua senha para acessar o sistema</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePsicologaLogin()}
                data-testid="input-senha"
                autoFocus
              />
              {erro && <p className="text-sm text-destructive">{erro}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPsicologaLogin(false);
                  setSenha("");
                  setErro("");
                }}
                data-testid="button-voltar"
              >
                Voltar
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handlePsicologaLogin}
                data-testid="button-entrar"
              >
                <ArrowRight className="h-4 w-4" />
                Entrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={nextLogoUrl} 
              alt="NEXT Implementos" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold">NEXT Implementos</CardTitle>
            <CardDescription className="text-base mt-2">
              Sistema de Gestão de Consultas Psicológicas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
              onClick={handleFuncionarioClick}
              data-testid="card-funcionario"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <UserCircle className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Sou Funcionário</CardTitle>
                <CardDescription className="mt-2">
                  Acesse para solicitar atendimento psicológico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" data-testid="button-funcionario">
                  Acessar <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
              onClick={() => setShowPsicologaLogin(true)}
              data-testid="card-psicologa"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Stethoscope className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Sou Psicóloga</CardTitle>
                <CardDescription className="mt-2">
                  Acesse o sistema completo de gestão de consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" data-testid="button-psicologa">
                  Fazer Login <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sistema de atendimento psicológico corporativo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
