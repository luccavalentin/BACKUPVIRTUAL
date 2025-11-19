import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ImportData = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const importAllData = async () => {
    setLoading(true);
    setProgress("Iniciando importação...");

    try {
      // ETAPA 1: Clientes
      setProgress("Importando clientes...");
      const clientsData = [
        { name: 'Rafael', type: 'Pessoa Física' },
        { name: 'Gilmar', type: 'Pessoa Física' },
        { name: 'Jari', type: 'Pessoa Física' },
        { name: 'Tal', type: 'Pessoa Física' },
        { name: 'Leonardo', type: 'Pessoa Física' },
        { name: 'Pita', type: 'Pessoa Física' },
        { name: 'Du Frasson', type: 'Pessoa Física' },
        { name: 'Silvio Felix', type: 'Pessoa Física' },
        { name: 'Eduardo', type: 'Pessoa Física' },
        { name: 'Daniel Bertanha', type: 'Pessoa Física' },
        { name: 'Juninho Jaguariuna', type: 'Pessoa Física' },
        { name: 'Miro', type: 'Pessoa Física' },
        { name: 'Roberto Manara', type: 'Pessoa Física' },
        { name: 'Marco Buck', type: 'Pessoa Física' },
        { name: 'Simonetti', type: 'Pessoa Física' },
        { name: 'Emiliana', type: 'Pessoa Física' },
        { name: 'Genil', type: 'Pessoa Física' },
        { name: 'Roseildo', type: 'Pessoa Física' },
        { name: 'Nazare', type: 'Pessoa Física' },
        { name: 'Vantame/Dimas', type: 'Pessoa Física' },
        { name: 'Narciso Nicola', type: 'Pessoa Física' },
        { name: 'Reinaldo', type: 'Pessoa Física' },
        { name: 'H.Stefani', type: 'Pessoa Física' },
        { name: 'Ruth Leusa', type: 'Pessoa Física' },
        { name: 'Eunice', type: 'Pessoa Física' },
        { name: 'Andrea', type: 'Pessoa Física' },
        { name: 'Betinha', type: 'Pessoa Física' },
        { name: 'Gaga', type: 'Pessoa Física' },
        { name: 'Lorival', type: 'Pessoa Física' },
        { name: 'Le', type: 'Pessoa Física' },
        { name: 'Carlinho', type: 'Pessoa Física' },
        { name: 'João', type: 'Pessoa Física' },
        { name: 'Ricardo', type: 'Pessoa Física' },
        { name: 'Silas', type: 'Pessoa Física' },
        { name: 'Eliana', type: 'Pessoa Física' },
        { name: 'Magda', type: 'Pessoa Física' },
        { name: 'Felipe Gerato', type: 'Pessoa Física' },
        { name: 'Daniel Padron', type: 'Pessoa Física' },
        { name: 'Edilaine', type: 'Pessoa Física' },
        { name: 'Luis Carlos Bergamo', type: 'Pessoa Física' },
        { name: 'Carla', type: 'Pessoa Física' },
        { name: 'Berbel', type: 'Pessoa Física' },
        { name: 'Paulo Zanqueta', type: 'Pessoa Física' },
        { name: 'Juliane', type: 'Pessoa Física' },
        { name: 'Zé Antonio', type: 'Pessoa Física' },
        { name: 'Miguel', type: 'Pessoa Física' },
        { name: 'Aqualax', type: 'Pessoa Jurídica' },
        { name: 'Master', type: 'Pessoa Jurídica' },
        { name: 'OTM', type: 'Pessoa Jurídica' },
        { name: 'Rodotec', type: 'Pessoa Jurídica' },
        { name: 'Luzia', type: 'Pessoa Física' },
        { name: 'Renata Zacharias', type: 'Pessoa Física' },
        { name: 'ARI', type: 'Pessoa Física' },
        { name: 'Alexandre Wenzel', type: 'Pessoa Física' },
        { name: 'Scama', type: 'Pessoa Jurídica' },
        { name: 'Capela', type: 'Pessoa Jurídica' },
        { name: 'Via Campos', type: 'Pessoa Jurídica' },
        { name: 'Ind. Du Frasson', type: 'Pessoa Jurídica' },
        { name: 'Alfa', type: 'Pessoa Jurídica' },
        { name: 'Empresa Sul', type: 'Pessoa Jurídica' },
        { name: 'Móveis Cassimiro', type: 'Pessoa Jurídica' },
        { name: 'Maqtiva', type: 'Pessoa Jurídica' },
        { name: 'Empresa de Americana', type: 'Pessoa Jurídica' },
        { name: 'Morungada', type: 'Pessoa Jurídica' },
        { name: 'Servcool', type: 'Pessoa Jurídica' },
        { name: 'Felix', type: 'Pessoa Física' },
        { name: 'Fernando Entulhos', type: 'Pessoa Física' },
        { name: 'Ederson', type: 'Pessoa Física' },
        { name: 'Mulher do General', type: 'Pessoa Física' },
        { name: 'Damiana', type: 'Pessoa Física' },
        { name: 'Cake', type: 'Pessoa Física' }
      ];

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .insert(clientsData)
        .select();

      if (clientsError) throw clientsError;
      
      const clientMap = new Map(clients.map(c => [c.name, c.id]));

      // ETAPA 2: Imóveis
      setProgress("Importando imóveis...");
      const propertiesData = [
        { address: 'Reinaldo Kuntz Busch, 54, Jardim Florença', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'Palchoal Marmo, 1460', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'Alferes Franco, 641', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'Alcides Carlos Graf, 89, Graminha', city: 'Limeira', documentation_status: 'PENDENTE' },
        { address: 'Jardim Piratininga 91', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'Jardim Piratininga 101', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'Jardim São Paulo - Gaz', city: 'Limeira', documentation_status: 'PENDENTE' },
        { address: 'Morar Mais - Avenida Academico Luiz Antonio Azevedo Bitencourt, 200', city: 'Limeira', documentation_status: 'PENDENTE' },
        { address: 'Jardim São Paulo - Garagem', city: 'Limeira', documentation_status: 'PENDENTE' },
        { address: 'Colinas do Engenho 1, 39', city: 'Limeira', documentation_status: 'PAGO' },
        { address: 'NOVA ODESSA - FRENTE', city: 'Nova Odessa', documentation_status: 'PAGO' },
        { address: 'BERENICE', city: 'Nova Odessa', documentation_status: 'PAGO' }
      ];

      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .insert(propertiesData)
        .select();

      if (propertiesError) throw propertiesError;

      const propertyMap = new Map(properties.map(p => [p.address, p.id]));

      // ETAPA 3: Receitas
      setProgress("Importando receitas...");
      const revenueData = [
        {
          description: 'Aluguel N.Odessa',
          amount: 650,
          date: '2025-09-01',
          category: 'Aluguel',
          frequency: 'Mensal',
          property_id: propertyMap.get('NOVA ODESSA - FRENTE')
        },
        {
          description: 'Aluguel N.Odessa 2',
          amount: 1000,
          date: '2025-09-01',
          category: 'Aluguel',
          frequency: 'Mensal',
          property_id: propertyMap.get('BERENICE')
        },
        {
          description: 'Rafael',
          amount: 4333,
          date: '2025-09-01',
          category: 'Serviços',
          frequency: 'Mensal',
          client_id: clientMap.get('Rafael')
        },
        {
          description: 'Gilmar Bomba Dies',
          amount: 1000,
          date: '2025-09-01',
          category: 'Serviços',
          frequency: 'Mensal',
          client_id: clientMap.get('Gilmar')
        },
        {
          description: 'Jari',
          amount: 1300,
          date: '2025-09-01',
          category: 'Serviços',
          frequency: 'Mensal',
          client_id: clientMap.get('Jari')
        },
        {
          description: 'Diversos',
          amount: 2500,
          date: '2025-09-01',
          category: 'Diversos',
          frequency: 'Mensal'
        },
        {
          description: 'Pro Labore',
          amount: 15000,
          date: '2025-09-01',
          category: 'Pro Labore',
          frequency: 'Mensal'
        },
        {
          description: 'Aluguel Gáz + Cana Brava + Enxuto',
          amount: 6800,
          date: '2025-09-01',
          category: 'Arrendamento Rural',
          frequency: 'Mensal'
        },
        {
          description: 'Aluguel vizinho da mãe',
          amount: 850,
          date: '2025-09-01',
          category: 'Aluguel',
          frequency: 'Mensal'
        },
        {
          description: 'Venda de Gado',
          amount: 200000,
          date: '2026-01-01',
          category: 'Venda Gado',
          frequency: 'Mensal'
        },
        {
          description: 'Acordo poupança',
          amount: 125000,
          date: '2026-06-01',
          category: 'Acordos',
          frequency: 'Única'
        },
        {
          description: 'Comissões',
          amount: 114000,
          date: '2026-03-01',
          category: 'Comissões',
          frequency: 'Única'
        },
        {
          description: 'Dividendos',
          amount: 100000,
          date: '2026-12-01',
          category: 'Investimentos',
          frequency: 'Única'
        }
      ];

      const { error: revenueError } = await supabase
        .from('revenue')
        .insert(revenueData);

      if (revenueError) throw revenueError;

      // ETAPA 4: Gado
      setProgress("Importando gado...");
      const cattleData = [
        { category: 'Fêmea', quantity: 185, origin: 'MT', age_months: 30, location: 'MT' },
        { category: 'Macho', quantity: 44, origin: 'MT', location: 'MT' },
        { category: 'Bezerra', quantity: 22, origin: 'SP', location: 'Strada' },
        { category: 'Bezerra', quantity: 22, origin: 'SP', location: 'Soja' },
        { category: 'Bezerra', quantity: 22, origin: 'SP', location: 'Estiva Gerbi' },
        { category: 'Bezerra', quantity: 7, origin: 'SP', location: 'Tanque Vermelho' },
        { category: 'Bezerra', quantity: 4, origin: 'SP', location: 'Tanque Branco' },
        { category: 'Bezerra', quantity: 8, origin: 'SP', location: 'Fiesta' },
        { category: 'Bezerra', quantity: 3, origin: 'SP', location: 'Simental' },
        { category: 'Bezerra', quantity: 8, origin: 'SP', location: 'Vacas Leite' },
        { category: 'Novilha', quantity: 12, origin: 'SP', location: 'Miguel', purchase_date: '2025-09-20' },
        { category: 'Macho', quantity: 17, origin: 'SP', location: 'Tal', purchase_date: '2025-07-20' }
      ];

      const { error: cattleError } = await supabase
        .from('cattle')
        .insert(cattleData);

      if (cattleError) throw cattleError;

      // ETAPA 5: Processos
      setProgress("Importando processos...");
      const processesData = [
        { client_id: clientMap.get('Aqualax'), description: 'Processo Aqualax', has_sentence: true, estimated_value: 4000, payment_forecast: '2025-12-01' },
        { client_id: clientMap.get('Ederson'), description: 'Processo Ederson', has_sentence: true, estimated_value: 18354, payment_forecast: '2025-12-01' },
        { client_id: clientMap.get('Mulher do General'), description: 'Processo Mulher do General', has_sentence: false, estimated_value: 3000, payment_forecast: '2025-12-01' },
        { client_id: clientMap.get('Damiana'), description: 'Processo Damiana', has_sentence: false },
        { client_id: clientMap.get('Cake'), description: 'Processo Cake', has_sentence: false }
      ];

      const { error: processesError } = await supabase
        .from('legal_processes')
        .insert(processesData);

      if (processesError) throw processesError;

      // ETAPA 6: Leads
      setProgress("Importando leads...");
      const leadsData = [
        { name: 'VIA CAMPOS', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'INTERCAMBIO', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'SILVIO FELIX', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'IND. DU FRASSON', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'EDUARDO - ALFA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'ACORDO CORONEL', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'EMPRESA SUL', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'DANIEL BERTANHA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'MOVEIS CASSIMIRO', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'CONTRATOS BANCOS', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'BIDS/LEILÕES', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'LICITAÇÕES', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'MAQTIVA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'VENDA TERRENO PITA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'EMPRESA DE AMERICANA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'INGRED', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'AÇÕES DE COBRANCA', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' },
        { name: 'CONTRATOS PJ INTERCAMBIO', start_date: '2025-09-01', end_date: '2026-12-31', status: 'Em andamento' }
      ];

      const { error: leadsError } = await supabase
        .from('leads')
        .insert(leadsData);

      if (leadsError) throw leadsError;

      // ETAPA 7: Empréstimos
      setProgress("Importando empréstimos...");
      const loansData = [
        { description: 'SALDO SANTANDER', amount: 15000, type: 'Empréstimo', status: 'Ativo' },
        { description: 'CARTÃO SICRED', amount: 10000, type: 'Empréstimo', status: 'Ativo' },
        { description: 'ARRENDAMENTO AGOSTO', amount: 16000, type: 'Empréstimo', status: 'Ativo' },
        { description: 'VENDA GADO', amount: 81000, type: 'Recebível', status: 'Pendente' },
        { description: 'COTAS CONS', amount: 30000, type: 'Recebível', status: 'Pendente' },
        { description: 'BARDINI', amount: 65000, type: 'Recebível', status: 'Pendente' }
      ];

      const { error: loansError } = await supabase
        .from('loans')
        .insert(loansData);

      if (loansError) throw loansError;

      setProgress("Importação concluída com sucesso!");
      toast({
        title: "Sucesso!",
        description: "Todos os dados foram importados com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
      setProgress(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Importação de Dados</CardTitle>
          <CardDescription>
            Clique no botão abaixo para importar todos os dados da planilha para o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={importAllData} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              'Iniciar Importação'
            )}
          </Button>
          
          {progress && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">{progress}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;
