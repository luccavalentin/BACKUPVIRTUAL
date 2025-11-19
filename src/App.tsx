import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Emprestimos from "./pages/Emprestimos";
import Clientes from "./pages/Clientes";
import Imoveis from "./pages/Imoveis";
import Gado from "./pages/Gado";
import Processos from "./pages/Processos";
import Leads from "./pages/Leads";
import Anotacoes from "./pages/Anotacoes";
import Tarefas from "./pages/Tarefas";
import Relatorios from "./pages/Relatorios";
import Aplicacoes from "./pages/Aplicacoes";
import Faturamento from "./pages/Faturamento";
import ImportData from "./pages/ImportData";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Rotas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex min-h-screen bg-background">
                    <AppSidebar />
                    <main className="flex-1 md:ml-64 p-4 md:p-8 w-full">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/receitas" element={<Receitas />} />
                        <Route path="/despesas" element={<Despesas />} />
                        <Route path="/emprestimos" element={<Emprestimos />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/imoveis" element={<Imoveis />} />
                        <Route path="/gado" element={<Gado />} />
                        <Route path="/processos" element={<Processos />} />
                        <Route path="/leads" element={<Leads />} />
                        <Route path="/anotacoes" element={<Anotacoes />} />
                        <Route path="/tarefas" element={<Tarefas />} />
                        <Route path="/aplicacoes" element={<Aplicacoes />} />
                        <Route path="/faturamento" element={<Faturamento />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                        <Route path="/dashboards-financeiros" element={<Relatorios />} />
                        <Route path="/importar-dados" element={<ImportData />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
