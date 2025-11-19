import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verifica se já existe sessão válida
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Verifica se há sessão válida ou se o usuário marcou "lembrar de mim"
        const rememberMeStored = localStorage.getItem("rememberMe") === "true";
        
        if (session || rememberMeStored) {
          // Se há sessão válida, redireciona para dashboard
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();
  }, [navigate]);

  // Handler para login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Autentica com Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        // Salva preferência de "lembrar de mim"
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // Salva informações do usuário
        localStorage.setItem("userEmail", email.trim());
        
        // Busca o nome do usuário do perfil
        const userName = data.user.user_metadata?.name || data.user.user_metadata?.display_name || email.trim().split("@")[0];
        localStorage.setItem("userName", userName);

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userName}!`,
        });

        // Redireciona para dashboard
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      // Mensagens de erro específicas
      if (error.message.includes("Invalid login credentials")) {
        setError("Email ou senha inválidos. Verifique suas credenciais.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Por favor, confirme seu email antes de fazer login.");
      } else if (error.message.includes("Too many requests")) {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError(error.message || "Erro ao fazer login. Tente novamente.");
      }

      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para reset de senha
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Por favor, informe seu email para redefinir a senha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de reset:", error);
      setError(error.message || "Erro ao enviar email de redefinição de senha.");
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de redefinição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-1.61-2.31 0-3.35-.89-3.35-2.56 0-1.51 1.22-2.48 3.12-2.84V6h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.39s3.35.83 3.35 2.61c.01 1.6-1.21 2.48-3.29 2.84z" fill="white"/>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Sistema de Gestão VANDE
          </CardTitle>
          <CardDescription className="text-base">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

