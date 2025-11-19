import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas, verificando se o usuário está autenticado
 * Redireciona para /login se não houver sessão válida
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verifica sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        // Verifica se há preferência de "lembrar de mim"
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        
        if (session || rememberMe) {
          setIsAuthenticated(true);
          
          // Atualiza nome do usuário se não estiver salvo
          if (session?.user && !localStorage.getItem("userName")) {
            const userName = session.user.user_metadata?.name || 
                           session.user.user_metadata?.display_name || 
                           session.user.email?.split("@")[0] || 
                           "Usuário";
            localStorage.setItem("userName", userName);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // Atualiza nome do usuário quando a sessão muda
      if (session?.user) {
        const userName = session.user.user_metadata?.name || 
                       session.user.user_metadata?.display_name || 
                       session.user.email?.split("@")[0] || 
                       "Usuário";
        localStorage.setItem("userName", userName);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

