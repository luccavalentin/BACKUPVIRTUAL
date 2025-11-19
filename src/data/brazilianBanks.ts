// Lista completa de bancos e instituições financeiras do Brasil
// Fonte: https://github.com/guibranco/BancosBrasileiros
// Atualizado automaticamente com dados oficiais do Banco Central do Brasil
// Total de instituições: 484

export interface Bank {
  code: string;
  name: string;
  logo?: string; // URL da logomarca
  type: 'Banco' | 'Cooperativa' | 'Fintech' | 'Outros';
  ispb?: string;
  shortName?: string;
  url?: string;
}

export const brazilianBanks: Bank[] = [
  {
    code: '001',
    name: 'Banco do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/001.svg',
    type: 'Banco',
    ispb: '00000000',
    shortName: 'BCO DO BRASIL S.A.',
    url: 'https://www.bb.com.br',
  },
  {
    code: '003',
    name: 'Banco da Amazônia S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/003.svg',
    type: 'Banco',
    ispb: '04902979',
    shortName: 'BCO DA AMAZONIA S.A.',
    url: 'https://www.bancoamazonia.com.br',
  },
  {
    code: '004',
    name: 'Banco do Nordeste do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/004.svg',
    type: 'Banco',
    ispb: '07237373',
    shortName: 'BCO DO NORDESTE DO BRASIL S.A.',
    url: 'https://www.banconordeste.gov.br',
  },
  {
    code: '007',
    name: 'BANCO NACIONAL DE DESENVOLVIMENTO ECONOMICO E SOCIAL',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/007.svg',
    type: 'Banco',
    ispb: '33657248',
    shortName: 'BNDES',
    url: 'https://www.bndes.gov.br/wps/portal/site/home',
  },
  {
    code: '010',
    name: 'CREDICOAMO CREDITO RURAL COOPERATIVA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/010.svg',
    type: 'Cooperativa',
    ispb: '81723108',
    shortName: 'CREDICOAMO',
    url: 'https://www.credicoamo.com.br/',
  },
  {
    code: '011',
    name: 'UBS (BRASIL) CORRETORA DE VALORES S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/011.svg',
    type: 'Outros',
    ispb: '61809182',
    shortName: 'UBS (BRASIL) CORRETORA DE VALORES S.A.',
    url: 'https://www.ubs.com/br/pt.html',
  },
  {
    code: '012',
    name: 'Banco Inbursa S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/012.svg',
    type: 'Banco',
    ispb: '04866275',
    shortName: 'BANCO INBURSA',
    url: 'https://www.bancoinbursa.com',
  },
  {
    code: '014',
    name: 'STATE STREET BRASIL S.A. - BANCO COMERCIAL',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/014.svg',
    type: 'Banco',
    ispb: '09274232',
    shortName: 'STATE STREET BR S.A. BCO COMERCIAL',
    url: 'https://www.statestreet.com/br/en/individual#',
  },
  {
    code: '015',
    name: 'UBS BB CORRETORA DE CÂMBIO, TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/015.svg',
    type: 'Outros',
    ispb: '02819125',
    shortName: 'UBS BB CCTVM S.A.',
    url: 'https://www.ubs.com/br/pt.html',
  },
  {
    code: '016',
    name: 'COOPERATIVA DE CRÉDITO MÚTUO DOS DESPACHANTES DE TRÂNSITO DE SANTA CATARINA E RIO GRANDE DO SUL - SICOOB CREDITRAN',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/016.svg',
    type: 'Cooperativa',
    ispb: '04715685',
    shortName: 'CCM DESP TRÂNS SC E RS',
    url: 'https://www.sicoob.com.br/web/sicoobcreditran/sicoob-creditran',
  },
  {
    code: '017',
    name: 'BNY Mellon Banco S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/017.svg',
    type: 'Banco',
    ispb: '42272526',
    shortName: 'BNY MELLON BCO S.A.',
    url: 'https://www.bnymellon.com/br/pt.html',
  },
  {
    code: '018',
    name: 'Banco Tricury S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/018.svg',
    type: 'Banco',
    ispb: '57839805',
    shortName: 'BCO TRICURY S.A.',
    url: 'https://www.bancotricury.com.br',
  },
  {
    code: '021',
    name: 'BANESTES S.A. Banco do Estado do Espírito Santo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/021.svg',
    type: 'Banco',
    ispb: '28127603',
    shortName: 'BCO BANESTES S.A.',
    url: 'https://www.banestes.com.br',
  },
  {
    code: '024',
    name: 'Banco Bandepe S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/024.svg',
    type: 'Banco',
    ispb: '10866788',
    shortName: 'BCO BANDEPE S.A.',
    url: 'https://www.santander.com.br',
  },
  {
    code: '025',
    name: 'Banco Alfa S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/025.svg',
    type: 'Banco',
    ispb: '03323840',
    shortName: 'BCO ALFA S.A.',
    
  },
  {
    code: '029',
    name: 'Banco Itaú Consignado S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/029.svg',
    type: 'Banco',
    ispb: '33885724',
    shortName: 'BANCO ITAÚ CONSIGNADO S.A.',
    url: 'https://www.itau.com.br',
  },
  {
    code: '033',
    name: 'BANCO SANTANDER (BRASIL) S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/033.svg',
    type: 'Banco',
    ispb: '90400888',
    shortName: 'BCO SANTANDER (BRASIL) S.A.',
    url: 'https://www.santander.com.br',
  },
  {
    code: '036',
    name: 'Banco Bradesco BBI S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/036.svg',
    type: 'Banco',
    ispb: '06271464',
    shortName: 'BCO BBI S.A.',
    url: 'https://www.bradescobbi.com.br',
  },
  {
    code: '037',
    name: 'Banco do Estado do Pará S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/037.svg',
    type: 'Banco',
    ispb: '04913711',
    shortName: 'BCO DO EST. DO PA S.A.',
    url: 'https://www.banpara.b.br',
  },
  {
    code: '040',
    name: 'Banco Cargill S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/040.svg',
    type: 'Banco',
    ispb: '03609817',
    shortName: 'BCO CARGILL S.A.',
    url: 'https://www.bancocargill.com.br',
  },
  {
    code: '041',
    name: 'Banco do Estado do Rio Grande do Sul S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/041.svg',
    type: 'Banco',
    ispb: '92702067',
    shortName: 'BCO DO ESTADO DO RS S.A.',
    url: 'https://www.banrisul.com.br',
  },
  {
    code: '047',
    name: 'Banco do Estado de Sergipe S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/047.svg',
    type: 'Banco',
    ispb: '13009717',
    shortName: 'BCO DO EST. DE SE S.A.',
    url: 'https://www.banese.com.br',
  },
  {
    code: '060',
    name: 'Confidence Corretora de Câmbio S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/060.svg',
    type: 'Outros',
    ispb: '04913129',
    shortName: 'CONFIDENCE CC S.A.',
    url: 'https://www.confidencecambio.com.br/',
  },
  {
    code: '062',
    name: 'Hipercard Banco Múltiplo S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/062.svg',
    type: 'Banco',
    ispb: '03012230',
    shortName: 'HIPERCARD BM S.A.',
    url: 'https://www.hipercard.com.br',
  },
  {
    code: '063',
    name: 'Banco Bradescard S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/063.svg',
    type: 'Banco',
    ispb: '04184779',
    shortName: 'BANCO BRADESCARD',
    
  },
  {
    code: '064',
    name: 'Goldman Sachs do Brasil Banco Múltiplo S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/064.svg',
    type: 'Banco',
    ispb: '04332281',
    shortName: 'GOLDMAN SACHS DO BRASIL BM S.A',
    url: 'https://www.goldmansachs.com',
  },
  {
    code: '065',
    name: 'Banco AndBank (Brasil) S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/065.svg',
    type: 'Banco',
    ispb: '48795256',
    shortName: 'BCO ANDBANK S.A.',
    
  },
  {
    code: '066',
    name: 'BANCO MORGAN STANLEY S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/066.svg',
    type: 'Banco',
    ispb: '02801938',
    shortName: 'BCO MORGAN STANLEY S.A.',
    url: 'https://www.morganstanley.com.br',
  },
  {
    code: '069',
    name: 'Banco Crefisa S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/069.svg',
    type: 'Banco',
    ispb: '61033106',
    shortName: 'BCO CREFISA S.A.',
    url: 'https://www.crefisa.com.br',
  },
  {
    code: '070',
    name: 'BRB - Banco de Brasília S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/070.svg',
    type: 'Banco',
    ispb: '00000208',
    shortName: 'BRB - BCO DE BRASILIA S.A.',
    url: 'https://www.brb.com.br',
  },
  {
    code: '074',
    name: 'Banco J. Safra S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/074.svg',
    type: 'Banco',
    ispb: '03017677',
    shortName: 'BCO. J.SAFRA S.A.',
    url: 'https://www.safra.com.br',
  },
  {
    code: '075',
    name: 'BANCO ABN AMRO CLEARING S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/075.svg',
    type: 'Banco',
    ispb: '03532415',
    shortName: 'BANCO ABN AMRO CLEARING S.A.',
    url: 'https://www.abnamro.com',
  },
  {
    code: '076',
    name: 'Banco KDB do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/076.svg',
    type: 'Banco',
    ispb: '07656500',
    shortName: 'BCO KDB BRASIL S.A.',
    url: 'https://www.bancokdb.com.br/home.html',
  },
  {
    code: '077',
    name: 'Banco Inter S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/077.svg',
    type: 'Banco',
    ispb: '00416968',
    shortName: 'BANCO INTER',
    url: 'https://www.bancointer.com.br',
  },
  {
    code: '078',
    name: 'Haitong Banco de Investimento do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/078.svg',
    type: 'Banco',
    ispb: '34111187',
    shortName: 'HAITONG BI DO BRASIL S.A.',
    url: 'https://www.haitongib.com.br/',
  },
  {
    code: '079',
    name: 'PICPAY BANK - BANCO MÚLTIPLO S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/079.svg',
    type: 'Banco',
    ispb: '09516419',
    shortName: 'PICPAY BANK - BANCO MÚLTIPLO S.A',
    url: 'https://www.bancooriginal.com.br',
  },
  {
    code: '080',
    name: 'BT CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/080.svg',
    type: 'Outros',
    ispb: '73622748',
    shortName: 'BT CC LTDA.',
    url: 'https://btcambio.com.br/',
  },
  {
    code: '081',
    name: 'BancoSeguro S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/081.svg',
    type: 'Banco',
    ispb: '10264663',
    shortName: 'BANCOSEGURO S.A.',
    url: 'https://www.rendimento.com.br',
  },
  {
    code: '082',
    name: 'BANCO TOPÁZIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/082.svg',
    type: 'Banco',
    ispb: '07679404',
    shortName: 'BANCO TOPÁZIO S.A.',
    url: 'https://www.bancotopazio.com.br',
  },
  {
    code: '083',
    name: 'Banco da China Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/083.svg',
    type: 'Banco',
    ispb: '10690848',
    shortName: 'BCO DA CHINA BRASIL S.A.',
    
  },
  {
    code: '084',
    name: 'SISPRIME DO BRASIL - COOPERATIVA DE CRÉDITO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/084.svg',
    type: 'Cooperativa',
    ispb: '02398976',
    shortName: 'SISPRIME DO BRASIL - COOP',
    url: 'https://www.sisprimedobrasil.com.br/',
  },
  {
    code: '085',
    name: 'Cooperativa Central de Crédito - Ailos',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/085.svg',
    type: 'Cooperativa',
    ispb: '05463212',
    shortName: 'COOPCENTRAL AILOS',
    url: 'https://www.ailos.coop.br/',
  },
  {
    code: '088',
    name: 'BANCO RANDON S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/088.svg',
    type: 'Banco',
    ispb: '11476673',
    shortName: 'BANCO RANDON S.A.',
    url: 'https://www.bancorandon.com',
  },
  {
    code: '089',
    name: 'CREDISAN COOPERATIVA DE CRÉDITO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/089.svg',
    type: 'Cooperativa',
    ispb: '62109566',
    shortName: 'CREDISAN CC',
    url: 'https://portal.credisan.com.br/',
  },
  {
    code: '091',
    name: 'CENTRAL DE COOPERATIVAS DE ECONOMIA E CRÉDITO MÚTUO DO ESTADO DO RIO GRANDE DO S',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/091.svg',
    type: 'Cooperativa',
    ispb: '01634601',
    shortName: 'CCCM UNICRED CENTRAL RS',
    url: 'https://www.unicred.com.br/home',
  },
  {
    code: '092',
    name: 'BRK S.A. Crédito, Financiamento e Investimento',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/092.svg',
    type: 'Banco',
    ispb: '12865507',
    shortName: 'BRK S.A. CFI',
    
  },
  {
    code: '093',
    name: 'PÓLOCRED   SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/093.svg',
    type: 'Outros',
    ispb: '07945233',
    shortName: 'POLOCRED SCMEPP LTDA.',
    url: 'https://www.polocred.com.br/',
  },
  {
    code: '094',
    name: 'Banco Finaxis S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/094.svg',
    type: 'Banco',
    ispb: '11758741',
    shortName: 'BANCO FINAXIS',
    url: 'https://www.finaxis.com.br',
  },
  {
    code: '095',
    name: 'BANCO TRAVELEX S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/095.svg',
    type: 'Banco',
    ispb: '11703662',
    shortName: 'BANCO TRAVELEX S.A.',
    url: 'https://www.travelexbank.com.br',
  },
  {
    code: '096',
    name: 'Banco B3 S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/096.svg',
    type: 'Banco',
    ispb: '00997185',
    shortName: 'BCO B3 S.A.',
    url: 'https://www.bmfbovespa.com.br/bancobmfbovespa/',
  },
  {
    code: '097',
    name: 'Credisis - Central de Cooperativas de Crédito Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/097.svg',
    type: 'Cooperativa',
    ispb: '04632856',
    shortName: 'CREDISIS - CENTRAL DE COOPERATIVAS DE CRÉDITO LTDA.',
    url: 'https://credisis.com.br',
  },
  {
    code: '098',
    name: 'Credialiança Cooperativa de Crédito Rural',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/098.svg',
    type: 'Cooperativa',
    ispb: '78157146',
    shortName: 'CREDIALIANÇA CCR',
    url: 'https://site.credialianca.com.br',
  },
  {
    code: '099',
    name: 'UNIPRIME CENTRAL NACIONAL - CENTRAL NACIONAL DE COOPERATIVA DE CREDITO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/099.svg',
    type: 'Cooperativa',
    ispb: '03046391',
    shortName: 'UNIPRIME COOPCENTRAL LTDA.',
    url: 'https://www.uniprime.com.br/singular/central',
  },
  {
    code: '100',
    name: 'Planner Corretora de Valores S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/100.svg',
    type: 'Outros',
    ispb: '00806535',
    shortName: 'PLANNER CV S.A.',
    
  },
  {
    code: '101',
    name: 'WARREN RENA DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/101.svg',
    type: 'Outros',
    ispb: '62287735',
    shortName: 'WARREN RENA DTVM',
    url: 'https://www.warren.com.br/',
  },
  {
    code: '102',
    name: 'XP INVESTIMENTOS CORRETORA DE CÂMBIO,TÍTULOS E VALORES MOBILIÁRIOS S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/102.svg',
    type: 'Outros',
    ispb: '02332886',
    shortName: 'XP INVESTIMENTOS CCTVM S/A',
    url: 'https://www.xpi.com.br/',
  },
  {
    code: '104',
    name: 'Caixa Econômica Federal',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/104.svg',
    type: 'Banco',
    ispb: '00360305',
    shortName: 'CAIXA ECONOMICA FEDERAL',
    url: 'https://caixa.gov.br',
  },
  {
    code: '105',
    name: 'Lecca Crédito, Financiamento e Investimento S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/105.svg',
    type: 'Banco',
    ispb: '07652226',
    shortName: 'LECCA CFI S.A.',
    url: 'https://www.lecca.com.br/',
  },
  {
    code: '107',
    name: 'Banco Bocom BBM S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/107.svg',
    type: 'Banco',
    ispb: '15114366',
    shortName: 'BCO BOCOM BBM S.A.',
    
  },
  {
    code: '108',
    name: 'PORTOCRED S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/108.svg',
    type: 'Banco',
    ispb: '01800019',
    shortName: 'PORTOCRED S.A. - CFI',
    url: 'https://www.portocred.com.br/',
  },
  {
    code: '111',
    name: 'OLIVEIRA TRUST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIARIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/111.svg',
    type: 'Outros',
    ispb: '36113876',
    shortName: 'OLIVEIRA TRUST DTVM S.A.',
    url: 'https://www.oliveiratrust.com.br/',
  },
  {
    code: '113',
    name: 'NEON CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/113.svg',
    type: 'Outros',
    ispb: '61723847',
    shortName: 'NEON CTVM S.A.',
    url: 'https://neon.com.br/',
  },
  {
    code: '114',
    name: 'Central Cooperativa de Crédito no Estado do Espírito Santo - CECOOP',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/114.svg',
    type: 'Cooperativa',
    ispb: '05790149',
    shortName: 'CENTRAL COOPERATIVA DE CRÉDITO NO ESTADO DO ESPÍRITO SANTO',
    
  },
  {
    code: '117',
    name: 'ADVANCED CORRETORA DE CÂMBIO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/117.svg',
    type: 'Outros',
    ispb: '92856905',
    shortName: 'ADVANCED CC LTDA',
    url: 'https://advancedcorretora.com.br/',
  },
  {
    code: '119',
    name: 'Banco Western Union do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/119.svg',
    type: 'Banco',
    ispb: '13720915',
    shortName: 'BCO WESTERN UNION',
    url: 'https://www.bancowesternunion.com.br',
  },
  {
    code: '120',
    name: 'BANCO RODOBENS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/120.svg',
    type: 'Banco',
    ispb: '33603457',
    shortName: 'BCO RODOBENS S.A.',
    url: 'https://www.rodobens.com.br',
  },
  {
    code: '121',
    name: 'Banco Agibank S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/121.svg',
    type: 'Banco',
    ispb: '10664513',
    shortName: 'BCO AGIBANK S.A.',
    url: 'https://www.agibank.com.br',
  },
  {
    code: '122',
    name: 'Banco Bradesco BERJ S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/122.svg',
    type: 'Banco',
    ispb: '33147315',
    shortName: 'BCO BRADESCO BERJ S.A.',
    
  },
  {
    code: '124',
    name: 'Banco Woori Bank do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/124.svg',
    type: 'Banco',
    ispb: '15357060',
    shortName: 'BCO WOORI BANK DO BRASIL S.A.',
    url: 'https://www.wooribank.com.br',
  },
  {
    code: '125',
    name: 'BANCO GENIAL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/125.svg',
    type: 'Banco',
    ispb: '45246410',
    shortName: 'BANCO GENIAL',
    
  },
  {
    code: '126',
    name: 'BR Partners Banco de Investimento S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/126.svg',
    type: 'Banco',
    ispb: '13220493',
    shortName: 'BR PARTNERS BI',
    
  },
  {
    code: '127',
    name: 'Codepe Corretora de Valores e Câmbio S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/127.svg',
    type: 'Outros',
    ispb: '09512542',
    shortName: 'CODEPE CVC S.A.',
    
  },
  {
    code: '128',
    name: 'BRAZA BANK S.A. BANCO DE CÂMBIO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/128.svg',
    type: 'Banco',
    ispb: '19307785',
    shortName: 'BRAZA BANK S.A. BCO DE CÂMBIO',
    url: 'https://www.brazabank.com.br',
  },
  {
    code: '129',
    name: 'UBS BB BANCO DE INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/129.svg',
    type: 'Banco',
    ispb: '18520834',
    shortName: 'UBS BB BI S.A.',
    url: 'https://www.ubs.com',
  },
  {
    code: '130',
    name: 'CARUANA S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/130.svg',
    type: 'Outros',
    ispb: '09313766',
    shortName: 'CARUANA SCFI',
    
  },
  {
    code: '131',
    name: 'TULLETT PREBON BRASIL CORRETORA DE VALORES E CÂMBIO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/131.svg',
    type: 'Outros',
    ispb: '61747085',
    shortName: 'TULLETT PREBON BRASIL CVC LTDA',
    
  },
  {
    code: '132',
    name: 'ICBC do Brasil Banco Múltiplo S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/132.svg',
    type: 'Banco',
    ispb: '17453575',
    shortName: 'ICBC DO BRASIL BM S.A.',
    url: 'https://www.icbc.com.cn',
  },
  {
    code: '133',
    name: 'CONFEDERAÇÃO NACIONAL DAS COOPERATIVAS CENTRAIS DE CRÉDITO E ECONOMIA FAMILIAR E SOLIDÁRIA - CRESOL CONFEDERAÇÃO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/133.svg',
    type: 'Cooperativa',
    ispb: '10398952',
    shortName: 'CRESOL CONFEDERAÇÃO',
    
  },
  {
    code: '134',
    name: 'BGC LIQUIDEZ DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/134.svg',
    type: 'Outros',
    ispb: '33862244',
    shortName: 'BGC LIQUIDEZ DTVM LTDA',
    
  },
  {
    code: '136',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO UNICRED DO BRASIL - UNICRED DO BRASIL',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/136.svg',
    type: 'Cooperativa',
    ispb: '00315557',
    shortName: 'UNICRED DO BRASIL',
    
  },
  {
    code: '138',
    name: 'Get Money Corretora de Câmbio S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/138.svg',
    type: 'Outros',
    ispb: '10853017',
    shortName: 'GET MONEY CC LTDA',
    
  },
  {
    code: '139',
    name: 'Intesa Sanpaolo Brasil S.A. - Banco Múltiplo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/139.svg',
    type: 'Banco',
    ispb: '55230916',
    shortName: 'INTESA SANPAOLO BRASIL S.A. BM',
    url: 'https://www.intesasanpaolobrasil.com.br',
  },
  {
    code: '140',
    name: 'NU INVESTIMENTOS S.A. - CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/140.svg',
    type: 'Outros',
    ispb: '62169875',
    shortName: 'NU INVESTIMENTOS S.A. - CTVM',
    
  },
  {
    code: '141',
    name: 'BANCO MASTER DE INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/141.svg',
    type: 'Banco',
    ispb: '09526594',
    shortName: 'MASTER BI S.A.',
    
  },
  {
    code: '142',
    name: 'Broker Brasil Corretora de Câmbio Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/142.svg',
    type: 'Outros',
    ispb: '16944141',
    shortName: 'BROKER BRASIL CC LTDA.',
    
  },
  {
    code: '143',
    name: 'INTEX BANK BANCO DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/143.svg',
    type: 'Banco',
    ispb: '02992317',
    shortName: 'INTEX BANK BCO DE CÂMBIO S.A.',
    
  },
  {
    code: '144',
    name: 'EBURY BANCO DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/144.svg',
    type: 'Banco',
    ispb: '13059145',
    shortName: 'EBURY BCO DE CÂMBIO S.A.',
    url: 'https://www.bexs.com.br',
  },
  {
    code: '145',
    name: 'LEVYCAM - CORRETORA DE CAMBIO E VALORES LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/145.svg',
    type: 'Outros',
    ispb: '50579044',
    shortName: 'LEVYCAM CCV LTDA',
    
  },
  {
    code: '146',
    name: 'GUITTA CORRETORA DE CAMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/146.svg',
    type: 'Outros',
    ispb: '24074692',
    shortName: 'GUITTA CC LTDA',
    
  },
  {
    code: '149',
    name: 'Facta Financeira S.A. - Crédito Financiamento e Investimento',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/149.svg',
    type: 'Banco',
    ispb: '15581638',
    shortName: 'FACTA S.A. CFI',
    
  },
  {
    code: '157',
    name: 'ICAP do Brasil Corretora de Títulos e Valores Mobiliários Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/157.svg',
    type: 'Outros',
    ispb: '09105360',
    shortName: 'ICAP DO BRASIL CTVM LTDA.',
    
  },
  {
    code: '159',
    name: 'Casa do Crédito S.A. Sociedade de Crédito ao Microempreendedor',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/159.svg',
    type: 'Outros',
    ispb: '05442029',
    shortName: 'CASA CREDITO S.A. SCM',
    
  },
  {
    code: '163',
    name: 'Commerzbank Brasil S.A. - Banco Múltiplo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/163.svg',
    type: 'Banco',
    ispb: '23522214',
    shortName: 'COMMERZBANK BRASIL S.A. - BCO MÚLTIPLO',
    
  },
  {
    code: '173',
    name: 'BRL Trust Distribuidora de Títulos e Valores Mobiliários S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/173.svg',
    type: 'Outros',
    ispb: '13486793',
    shortName: 'BRL TRUST DTVM SA',
    
  },
  {
    code: '174',
    name: 'PEFISA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/174.svg',
    type: 'Banco',
    ispb: '43180355',
    shortName: 'PEFISA S.A. - C.F.I.',
    
  },
  {
    code: '177',
    name: 'SAFRA ASSET CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/177.svg',
    type: 'Outros',
    ispb: '65913436',
    shortName: 'SAFRA CTVM',
    
  },
  {
    code: '180',
    name: 'CM CAPITAL MARKETS CORRETORA DE CÂMBIO, TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/180.svg',
    type: 'Outros',
    ispb: '02685483',
    shortName: 'CM CAPITAL MARKETS CCTVM LTDA',
    
  },
  {
    code: '183',
    name: 'SOCRED S.A. - SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/183.svg',
    type: 'Outros',
    ispb: '09210106',
    shortName: 'SOCRED SA - SCMEPP',
    
  },
  {
    code: '184',
    name: 'Banco Itaú BBA S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/184.svg',
    type: 'Banco',
    ispb: '17298092',
    shortName: 'BCO ITAÚ BBA S.A.',
    url: 'https://www.itau.com.br/itaubba-pt',
  },
  {
    code: '188',
    name: 'ATIVA INVESTIMENTOS S.A. CORRETORA DE TÍTULOS, CÂMBIO E VALORES',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/188.svg',
    type: 'Outros',
    ispb: '33775974',
    shortName: 'ATIVA S.A. INVESTIMENTOS CCTVM',
    
  },
  {
    code: '189',
    name: 'HS FINANCEIRA S/A CREDITO, FINANCIAMENTO E INVESTIMENTOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/189.svg',
    type: 'Banco',
    ispb: '07512441',
    shortName: 'HS FINANCEIRA',
    
  },
  {
    code: '190',
    name: 'SERVICOOP - COOPERATIVA DE CRÉDITO DOS SERVIDORES PÚBLICOS ESTADUAIS E MUNICIPAIS DO RIO GRANDE DO SUL',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/190.svg',
    type: 'Cooperativa',
    ispb: '03973814',
    shortName: 'SERVICOOP',
    
  },
  {
    code: '191',
    name: 'Nova Futura Corretora de Títulos e Valores Mobiliários Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/191.svg',
    type: 'Outros',
    ispb: '04257795',
    shortName: 'NOVA FUTURA CTVM LTDA.',
    
  },
  {
    code: '194',
    name: 'UNIDA DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/194.svg',
    type: 'Outros',
    ispb: '20155248',
    shortName: 'UNIDA DTVM LTDA',
    
  },
  {
    code: '195',
    name: 'VALOR S/A SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/195.svg',
    type: 'Outros',
    ispb: '07799277',
    shortName: 'VALOR S/A SCFI',
    
  },
  {
    code: '196',
    name: 'FAIR CORRETORA DE CAMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/196.svg',
    type: 'Outros',
    ispb: '32648370',
    shortName: 'FAIR CC S.A.',
    
  },
  {
    code: '197',
    name: 'STONE INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/197.svg',
    type: 'Banco',
    ispb: '16501555',
    shortName: 'STONE IP S.A.',
    
  },
  {
    code: '208',
    name: 'Banco BTG Pactual S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/208.svg',
    type: 'Banco',
    ispb: '30306294',
    shortName: 'BANCO BTG PACTUAL S.A.',
    url: 'https://www.btgpactual.com',
  },
  {
    code: '212',
    name: 'Banco Original S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/212.svg',
    type: 'Banco',
    ispb: '92894922',
    shortName: 'BANCO ORIGINAL',
    url: 'https://www.original.com.br',
  },
  {
    code: '213',
    name: 'Banco Arbi S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/213.svg',
    type: 'Banco',
    ispb: '54403563',
    shortName: 'BCO ARBI S.A.',
    url: 'https://www.bancoarbi.com.br',
  },
  {
    code: '217',
    name: 'Banco John Deere S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/217.svg',
    type: 'Banco',
    ispb: '91884981',
    shortName: 'BANCO JOHN DEERE S.A.',
    
  },
  {
    code: '218',
    name: 'Banco BS2 S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/218.svg',
    type: 'Banco',
    ispb: '71027866',
    shortName: 'BCO BS2 S.A.',
    url: 'https://www.bs2.com/banco/',
  },
  {
    code: '222',
    name: 'BANCO CRÉDIT AGRICOLE BRASIL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/222.svg',
    type: 'Banco',
    ispb: '75647891',
    shortName: 'BCO CRÉDIT AGRICOLE BR S.A.',
    
  },
  {
    code: '224',
    name: 'Banco Fibra S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/224.svg',
    type: 'Banco',
    ispb: '58616418',
    shortName: 'BCO FIBRA S.A.',
    url: 'https://www.bancofibra.com.br',
  },
  {
    code: '233',
    name: 'BANCO BMG SOLUÇÕES FINANCEIRAS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/233.svg',
    type: 'Banco',
    ispb: '62421979',
    shortName: 'BANCO BMG SOLUÇÕES FINANCEIRAS S.A.',
    
  },
  {
    code: '237',
    name: 'Banco Bradesco S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/237.svg',
    type: 'Banco',
    ispb: '60746948',
    shortName: 'BCO BRADESCO S.A.',
    url: 'https://www.bradesco.com.br',
  },
  {
    code: '241',
    name: 'BANCO CLASSICO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/241.svg',
    type: 'Banco',
    ispb: '31597552',
    shortName: 'BCO CLASSICO S.A.',
    url: 'https://bancoclassico.com.br',
  },
  {
    code: '243',
    name: 'BANCO MASTER S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/243.svg',
    type: 'Banco',
    ispb: '33923798',
    shortName: 'BANCO MASTER',
    
  },
  {
    code: '246',
    name: 'Banco ABC Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/246.svg',
    type: 'Banco',
    ispb: '28195667',
    shortName: 'BCO ABC BRASIL S.A.',
    url: 'https://www.abcbrasil.com.br',
  },
  {
    code: '249',
    name: 'Banco Investcred Unibanco S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/249.svg',
    type: 'Banco',
    ispb: '61182408',
    shortName: 'BANCO INVESTCRED UNIBANCO S.A.',
    url: 'https://www.itau.com.br',
  },
  {
    code: '250',
    name: 'BANCO BMG CONSIGNADO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/250.svg',
    type: 'Banco',
    ispb: '50585090',
    shortName: 'BANCO BMG CONSIGNADO S.A.',
    
  },
  {
    code: '253',
    name: 'Bexs Corretora de Câmbio S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/253.svg',
    type: 'Outros',
    ispb: '52937216',
    shortName: 'BEXS CC S.A.',
    
  },
  {
    code: '254',
    name: 'PARANÁ BANCO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/254.svg',
    type: 'Banco',
    ispb: '14388334',
    shortName: 'PARANA BCO S.A.',
    url: 'https://www.paranabanco.com.br',
  },
  {
    code: '259',
    name: 'MONEYCORP BANCO DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/259.svg',
    type: 'Banco',
    ispb: '08609934',
    shortName: 'MONEYCORP BCO DE CÂMBIO S.A.',
    
  },
  {
    code: '260',
    name: 'NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/260.svg',
    type: 'Fintech',
    ispb: '18236120',
    shortName: 'NU PAGAMENTOS - IP',
    
  },
  {
    code: '265',
    name: 'Banco Fator S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/265.svg',
    type: 'Banco',
    ispb: '33644196',
    shortName: 'BCO FATOR S.A.',
    url: 'https://www.fator.com.br',
  },
  {
    code: '266',
    name: 'BANCO CEDULA S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/266.svg',
    type: 'Banco',
    ispb: '33132044',
    shortName: 'BCO CEDULA S.A.',
    url: 'https://www.bancocedula.com.br',
  },
  {
    code: '268',
    name: 'BARI COMPANHIA HIPOTECÁRIA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/268.svg',
    type: 'Banco',
    ispb: '14511781',
    shortName: 'BARI CIA HIPOTECÁRIA',
    
  },
  {
    code: '269',
    name: 'BANCO HSBC S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/269.svg',
    type: 'Banco',
    ispb: '53518684',
    shortName: 'BCO HSBC S.A.',
    
  },
  {
    code: '270',
    name: 'SAGITUR CORRETORA DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/270.svg',
    type: 'Outros',
    ispb: '61444949',
    shortName: 'SAGITUR CC - EM LIQUIDAÇÃO EXTRAJUDICIAL',
    
  },
  {
    code: '271',
    name: 'BPY CORRETORA DE CÂMBIO, TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/271.svg',
    type: 'Outros',
    ispb: '27842177',
    shortName: 'BPY CCTVM S.A.',
    
  },
  {
    code: '272',
    name: 'AGK CORRETORA DE CAMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/272.svg',
    type: 'Outros',
    ispb: '00250699',
    shortName: 'AGK CC S.A.',
    
  },
  {
    code: '273',
    name: 'COOPERATIVA DE CREDITO SULCREDI AMPLEA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/273.svg',
    type: 'Cooperativa',
    ispb: '08253539',
    shortName: 'COOP SULCREDI AMPLEA',
    
  },
  {
    code: '274',
    name: 'BMP SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E A EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/274.svg',
    type: 'Outros',
    ispb: '11581339',
    shortName: 'BMP SCMEPP LTDA',
    
  },
  {
    code: '276',
    name: 'BANCO SENFF S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/276.svg',
    type: 'Banco',
    ispb: '11970623',
    shortName: 'BCO SENFF S.A.',
    
  },
  {
    code: '278',
    name: 'Genial Investimentos Corretora de Valores Mobiliários S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/278.svg',
    type: 'Outros',
    ispb: '27652684',
    shortName: 'GENIAL INVESTIMENTOS CVM S.A.',
    
  },
  {
    code: '279',
    name: 'PRIMACREDI CREDISIS - COOPERATIVA DE CRÉDITO DE PRIMAVERA DO LESTE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/279.svg',
    type: 'Cooperativa',
    ispb: '26563270',
    shortName: 'COOP DE PRIMAVERA DO LESTE',
    
  },
  {
    code: '280',
    name: 'WILL FINANCEIRA S.A. CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/280.svg',
    type: 'Banco',
    ispb: '23862762',
    shortName: 'WILL FINANCEIRA S.A.CFI',
    
  },
  {
    code: '281',
    name: 'Cooperativa de Crédito Rural Coopavel',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/281.svg',
    type: 'Cooperativa',
    ispb: '76461557',
    shortName: 'CCR COOPAVEL',
    
  },
  {
    code: '283',
    name: 'RB INVESTIMENTOS DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LIMITADA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/283.svg',
    type: 'Outros',
    ispb: '89960090',
    shortName: 'RB INVESTIMENTOS DTVM LTDA.',
    
  },
  {
    code: '285',
    name: 'FRENTE CORRETORA DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/285.svg',
    type: 'Outros',
    ispb: '71677850',
    shortName: 'FRENTE CC S.A.',
    
  },
  {
    code: '286',
    name: 'UNIPRIME OURO - COOPERATIVA DE CRÉDITO DE OURO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/286.svg',
    type: 'Cooperativa',
    ispb: '07853842',
    shortName: 'UNIPRIME OURO - COOP DE OURO',
    
  },
  {
    code: '288',
    name: 'CAROL DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/288.svg',
    type: 'Outros',
    ispb: '62237649',
    shortName: 'CAROL DTVM LTDA.',
    
  },
  {
    code: '289',
    name: 'EFX CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/289.svg',
    type: 'Outros',
    ispb: '94968518',
    shortName: 'EFX CC LTDA.',
    
  },
  {
    code: '290',
    name: 'PAGSEGURO INTERNET INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/290.svg',
    type: 'Banco',
    ispb: '08561701',
    shortName: 'PAGSEGURO INTERNET IP S.A.',
    
  },
  {
    code: '292',
    name: 'GALAPAGOS CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/292.svg',
    type: 'Outros',
    ispb: '28650236',
    shortName: 'GALAPAGOS DTVM S.A.',
    
  },
  {
    code: '293',
    name: 'Lastro RDV Distribuidora de Títulos e Valores Mobiliários Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/293.svg',
    type: 'Outros',
    ispb: '71590442',
    shortName: 'LASTRO RDV DTVM LTDA',
    
  },
  {
    code: '296',
    name: 'OZ CORRETORA DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/296.svg',
    type: 'Outros',
    ispb: '04062902',
    shortName: 'OZ CORRETORA DE CÂMBIO S.A.',
    
  },
  {
    code: '298',
    name: 'VIPS CORRETORA DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/298.svg',
    type: 'Outros',
    ispb: '17772370',
    shortName: 'VIPS CC S.A.',
    
  },
  {
    code: '299',
    name: 'BANCO AFINZ S.A. - BANCO MÚLTIPLO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/299.svg',
    type: 'Banco',
    ispb: '04814563',
    shortName: 'BCO AFINZ S.A. - BM',
    
  },
  {
    code: '300',
    name: 'Banco de la Nacion Argentina',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/300.svg',
    type: 'Banco',
    ispb: '33042151',
    shortName: 'BCO LA NACION ARGENTINA',
    
  },
  {
    code: '301',
    name: 'DOCK INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/301.svg',
    type: 'Banco',
    ispb: '13370835',
    shortName: 'DOCK IP S.A.',
    
  },
  {
    code: '305',
    name: 'FOURTRADE CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/305.svg',
    type: 'Outros',
    ispb: '40353377',
    shortName: 'FOURTRADE COR. DE CAMBIO LTDA',
    
  },
  {
    code: '306',
    name: 'PORTOPAR DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/306.svg',
    type: 'Outros',
    ispb: '40303299',
    shortName: 'PORTOPAR DTVM LTDA',
    
  },
  {
    code: '307',
    name: 'Terra Investimentos Distribuidora de Títulos e Valores Mobiliários Ltda.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/307.svg',
    type: 'Outros',
    ispb: '03751794',
    shortName: 'TERRA INVESTIMENTOS DTVM',
    
  },
  {
    code: '309',
    name: 'CAMBIONET CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/309.svg',
    type: 'Outros',
    ispb: '14190547',
    shortName: 'CAMBIONET CC LTDA',
    
  },
  {
    code: '310',
    name: 'VORTX DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/310.svg',
    type: 'Outros',
    ispb: '22610500',
    shortName: 'VORTX DTVM LTDA.',
    
  },
  {
    code: '311',
    name: 'DOURADA CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/311.svg',
    type: 'Outros',
    ispb: '76641497',
    shortName: 'DOURADA CORRETORA',
    
  },
  {
    code: '312',
    name: 'HSCM - SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/312.svg',
    type: 'Outros',
    ispb: '07693858',
    shortName: 'HSCM SCMEPP LTDA.',
    
  },
  {
    code: '313',
    name: 'AMAZÔNIA CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/313.svg',
    type: 'Outros',
    ispb: '16927221',
    shortName: 'AMAZÔNIA CC LTDA.',
    
  },
  {
    code: '315',
    name: 'PI Distribuidora de Títulos e Valores Mobiliários S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/315.svg',
    type: 'Outros',
    ispb: '03502968',
    shortName: 'PI DTVM S.A.',
    
  },
  {
    code: '318',
    name: 'Banco BMG S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/318.svg',
    type: 'Banco',
    ispb: '61186680',
    shortName: 'BCO BMG S.A.',
    url: 'https://www.bancobmg.com.br',
  },
  {
    code: '319',
    name: 'OM DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/319.svg',
    type: 'Outros',
    ispb: '11495073',
    shortName: 'OM DTVM LTDA',
    
  },
  {
    code: '320',
    name: 'BANK OF CHINA (BRASIL) BANCO MÚLTIPLO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/320.svg',
    type: 'Banco',
    ispb: '07450604',
    shortName: 'BOC BRASIL',
    
  },
  {
    code: '321',
    name: 'CREFAZ SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E A EMPRESA DE PEQUENO PORTE S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/321.svg',
    type: 'Outros',
    ispb: '18188384',
    shortName: 'CREFAZ SCMEPP SA',
    
  },
  {
    code: '322',
    name: 'Cooperativa de Crédito Rural de Abelardo Luz - Sulcredi/Crediluz',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/322.svg',
    type: 'Cooperativa',
    ispb: '01073966',
    shortName: 'CCR DE ABELARDO LUZ',
    
  },
  {
    code: '323',
    name: 'MERCADO PAGO INSTITUIÇÃO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/323.svg',
    type: 'Banco',
    ispb: '10573521',
    shortName: 'MERCADO PAGO IP LTDA.',
    
  },
  {
    code: '324',
    name: 'CARTOS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/324.svg',
    type: 'Outros',
    ispb: '21332862',
    shortName: 'CARTOS SCD S.A.',
    
  },
  {
    code: '325',
    name: 'Órama Distribuidora de Títulos e Valores Mobiliários S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/325.svg',
    type: 'Outros',
    ispb: '13293225',
    shortName: 'ÓRAMA DTVM S.A.',
    
  },
  {
    code: '326',
    name: 'PARATI - CREDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/326.svg',
    type: 'Banco',
    ispb: '03311443',
    shortName: 'PARATI - CFI S.A.',
    
  },
  {
    code: '328',
    name: 'COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DOS FABRICANTES DE CALÇADOS DE SAPIRANGA LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/328.svg',
    type: 'Cooperativa',
    ispb: '05841967',
    shortName: 'CECM FABRIC CALÇADOS SAPIRANGA',
    
  },
  {
    code: '329',
    name: 'QI Sociedade de Crédito Direto S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/329.svg',
    type: 'Outros',
    ispb: '32402502',
    shortName: 'QI SCD S.A.',
    
  },
  {
    code: '330',
    name: 'BANCO BARI DE INVESTIMENTOS E FINANCIAMENTOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/330.svg',
    type: 'Banco',
    ispb: '00556603',
    shortName: 'BANCO BARI S.A.',
    
  },
  {
    code: '331',
    name: 'OSLO CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/331.svg',
    type: 'Outros',
    ispb: '13673855',
    shortName: 'OSLO CAPITAL DTVM SA',
    
  },
  {
    code: '332',
    name: 'ACESSO SOLUÇÕES DE PAGAMENTO S.A. - INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/332.svg',
    type: 'Banco',
    ispb: '13140088',
    shortName: 'ACESSO SOLUÇÕES DE PAGAMENTO S.A. - INSTITUIÇÃO DE PAGAMENTO',
    
  },
  {
    code: '334',
    name: 'BANCO BESA S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/334.svg',
    type: 'Banco',
    ispb: '15124464',
    shortName: 'BANCO BESA S.A.',
    
  },
  {
    code: '335',
    name: 'Banco Digio S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/335.svg',
    type: 'Banco',
    ispb: '27098060',
    shortName: 'BANCO DIGIO',
    url: 'https://www.digio.com.br',
  },
  {
    code: '336',
    name: 'Banco C6 S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/336.svg',
    type: 'Banco',
    ispb: '31872495',
    shortName: 'BCO C6 S.A.',
    url: 'https://www.c6bank.com',
  },
  {
    code: '340',
    name: 'SUPERDIGITAL INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/340.svg',
    type: 'Fintech',
    ispb: '09554480',
    shortName: 'SUPERDIGITAL I.P. S.A.',
    
  },
  {
    code: '341',
    name: 'ITAÚ UNIBANCO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/341.svg',
    type: 'Banco',
    ispb: '60701190',
    shortName: 'ITAÚ UNIBANCO S.A.',
    url: 'https://www.itau.com.br',
  },
  {
    code: '342',
    name: 'Creditas Sociedade de Crédito Direto S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/342.svg',
    type: 'Outros',
    ispb: '32997490',
    shortName: 'CREDITAS SCD',
    
  },
  {
    code: '343',
    name: 'FFA SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/343.svg',
    type: 'Outros',
    ispb: '24537861',
    shortName: 'FFA SCMEPP LTDA.',
    
  },
  {
    code: '348',
    name: 'Banco XP S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/348.svg',
    type: 'Banco',
    ispb: '33264668',
    shortName: 'BCO XP S.A.',
    
  },
  {
    code: '349',
    name: 'AL5 S.A. SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/349.svg',
    type: 'Outros',
    ispb: '27214112',
    shortName: 'AL5 S.A. SCFI',
    
  },
  {
    code: '350',
    name: 'COOPERATIVA DE CRÉDITO, POUPANÇA E SERVIÇOS FINANCEIROS DE AGRICULTORES E AEROPORTUÁRIOS DO BRASIL - CREHNOR',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/350.svg',
    type: 'Cooperativa',
    ispb: '01330387',
    shortName: 'COOP DE AGRICULTORES E AEROPORTUÁRIOS DO BRASIL',
    
  },
  {
    code: '352',
    name: 'TORO CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/352.svg',
    type: 'Outros',
    ispb: '29162769',
    shortName: 'TORO CTVM S.A.',
    
  },
  {
    code: '354',
    name: 'NECTON INVESTIMENTOS  S.A. CORRETORA DE VALORES MOBILIÁRIOS E COMMODITIES',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/354.svg',
    type: 'Outros',
    ispb: '52904364',
    shortName: 'NECTON INVESTIMENTOS S.A CVM',
    
  },
  {
    code: '355',
    name: 'ÓTIMO SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/355.svg',
    type: 'Outros',
    ispb: '34335592',
    shortName: 'ÓTIMO SCD S.A.',
    
  },
  {
    code: '358',
    name: 'MIDWAY S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/358.svg',
    type: 'Banco',
    ispb: '09464032',
    shortName: 'MIDWAY S.A. - SCFI',
    
  },
  {
    code: '359',
    name: 'ZEMA CRÉDITO, FINANCIAMENTO E INVESTIMENTO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/359.svg',
    type: 'Banco',
    ispb: '05351887',
    shortName: 'ZEMA CFI S/A',
    
  },
  {
    code: '360',
    name: 'TRINUS CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/360.svg',
    type: 'Outros',
    ispb: '02276653',
    shortName: 'TRINUS CAPITAL DTVM',
    
  },
  {
    code: '362',
    name: 'CIELO S.A. - INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/362.svg',
    type: 'Banco',
    ispb: '01027058',
    shortName: 'CIELO IP S.A.',
    
  },
  {
    code: '363',
    name: 'QI CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/363.svg',
    type: 'Outros',
    ispb: '62285390',
    shortName: 'QI CTVM S.A.',
    
  },
  {
    code: '364',
    name: 'EFÍ S.A. - INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/364.svg',
    type: 'Banco',
    ispb: '09089356',
    shortName: 'EFÍ S.A. - IP',
    
  },
  {
    code: '365',
    name: 'SIMPAUL CORRETORA DE CAMBIO E VALORES MOBILIARIOS  S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/365.svg',
    type: 'Outros',
    ispb: '68757681',
    shortName: 'SIMPAUL',
    
  },
  {
    code: '366',
    name: 'BANCO SOCIETE GENERALE BRASIL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/366.svg',
    type: 'Banco',
    ispb: '61533584',
    shortName: 'BCO SOCIETE GENERALE BRASIL',
    
  },
  {
    code: '367',
    name: 'VITREO DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/367.svg',
    type: 'Outros',
    ispb: '34711571',
    shortName: 'VITREO DTVM S.A.',
    
  },
  {
    code: '368',
    name: 'Banco CSF S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/368.svg',
    type: 'Banco',
    ispb: '08357240',
    shortName: 'BCO CSF S.A.',
    
  },
  {
    code: '370',
    name: 'Banco Mizuho do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/370.svg',
    type: 'Banco',
    ispb: '61088183',
    shortName: 'BCO MIZUHO S.A.',
    
  },
  {
    code: '371',
    name: 'WARREN CORRETORA DE VALORES MOBILIÁRIOS E CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/371.svg',
    type: 'Outros',
    ispb: '92875780',
    shortName: 'WARREN CVMC LTDA',
    
  },
  {
    code: '373',
    name: 'UP.P SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/373.svg',
    type: 'Banco',
    ispb: '35977097',
    shortName: 'UP.P SEP S.A.',
    
  },
  {
    code: '374',
    name: 'REALIZE SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/374.svg',
    type: 'Outros',
    ispb: '27351731',
    shortName: 'REALIZE SCFI S.A.',
    
  },
  {
    code: '376',
    name: 'BANCO J.P. MORGAN S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/376.svg',
    type: 'Banco',
    ispb: '33172537',
    shortName: 'BCO J.P. MORGAN S.A.',
    url: 'https://www.jpmorgan.com',
  },
  {
    code: '377',
    name: 'BMS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/377.svg',
    type: 'Outros',
    ispb: '17826860',
    shortName: 'BMS SCD S.A.',
    
  },
  {
    code: '378',
    name: 'BANCO BRASILEIRO DE CRÉDITO SOCIEDADE ANÔNIMA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/378.svg',
    type: 'Banco',
    ispb: '01852137',
    shortName: 'BCO BRASILEIRO DE CRÉDITO S.A.',
    
  },
  {
    code: '379',
    name: 'COOPERFORTE COOPERATIVA DE CRÉDITO E INVESTIMENTOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/379.svg',
    type: 'Cooperativa',
    ispb: '01658426',
    shortName: 'COOP COOPERFORTE LTDA.',
    
  },
  {
    code: '380',
    name: 'PICPAY INSTITUIçãO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/380.svg',
    type: 'Banco',
    ispb: '22896431',
    shortName: 'PICPAY',
    url: 'https://www.picpay.com.br',
  },
  {
    code: '381',
    name: 'BANCO MERCEDES-BENZ DO BRASIL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/381.svg',
    type: 'Banco',
    ispb: '60814191',
    shortName: 'BCO MERCEDES-BENZ S.A.',
    url: 'https://www.bancomercedes-benz.com.br',
  },
  {
    code: '382',
    name: 'FIDÚCIA SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LIMITADA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/382.svg',
    type: 'Outros',
    ispb: '04307598',
    shortName: 'FIDUCIA SCMEPP LTDA',
    
  },
  {
    code: '383',
    name: 'EBANX INSTITUICAO DE PAGAMENTOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/383.svg',
    type: 'Fintech',
    ispb: '21018182',
    shortName: 'EBANX IP LTDA.',
    
  },
  {
    code: '384',
    name: 'GLOBAL FINANÇAS SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/384.svg',
    type: 'Outros',
    ispb: '11165756',
    shortName: 'GLOBAL SCM LTDA',
    
  },
  {
    code: '385',
    name: 'COOPERATIVA DE ECONOMIA E CREDITO MUTUO DOS TRABALHADORES PORTUARIOS DA GRANDE VITORIA - CREDESTIVA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/385.svg',
    type: 'Cooperativa',
    ispb: '03844699',
    shortName: 'CECM DOS TRAB.PORT. DA G.VITOR',
    
  },
  {
    code: '386',
    name: 'NU FINANCEIRA S.A. - Sociedade de Crédito, Financiamento e Investimento',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/386.svg',
    type: 'Outros',
    ispb: '30680829',
    shortName: 'NU FINANCEIRA S.A. CFI',
    
  },
  {
    code: '387',
    name: 'Banco Toyota do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/387.svg',
    type: 'Banco',
    ispb: '03215790',
    shortName: 'BCO TOYOTA DO BRASIL S.A.',
    url: 'https://institucional.bancotoyota.com.br',
  },
  {
    code: '389',
    name: 'Banco Mercantil do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/389.svg',
    type: 'Banco',
    ispb: '17184037',
    shortName: 'BCO MERCANTIL DO BRASIL S.A.',
    url: 'https://www.bancomercantil.com.br',
  },
  {
    code: '390',
    name: 'BANCO GM S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/390.svg',
    type: 'Banco',
    ispb: '59274605',
    shortName: 'BCO GM S.A.',
    
  },
  {
    code: '391',
    name: 'COOPERATIVA DE CREDITO RURAL DE IBIAM - SULCREDI/IBIAM',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/391.svg',
    type: 'Cooperativa',
    ispb: '08240446',
    shortName: 'CCR DE IBIAM',
    
  },
  {
    code: '393',
    name: 'Banco Volkswagen S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/393.svg',
    type: 'Banco',
    ispb: '59109165',
    shortName: 'BCO VOLKSWAGEN S.A',
    url: 'https://www.bancovw.com.br',
  },
  {
    code: '394',
    name: 'Banco Bradesco Financiamentos S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/394.svg',
    type: 'Banco',
    ispb: '07207996',
    shortName: 'BCO BRADESCO FINANC. S.A.',
    url: 'https://www.bradescofinanciamentos.com.br',
  },
  {
    code: '395',
    name: 'F.D\'GOLD - DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/395.svg',
    type: 'Outros',
    ispb: '08673569',
    shortName: 'F D GOLD DTVM LTDA',
    
  },
  {
    code: '396',
    name: 'MAGALUPAY INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/396.svg',
    type: 'Banco',
    ispb: '13884775',
    shortName: 'MAGALUPAY',
    
  },
  {
    code: '397',
    name: 'LISTO SOCIEDADE DE CREDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/397.svg',
    type: 'Banco',
    ispb: '34088029',
    shortName: 'LISTO SCD S.A.',
    
  },
  {
    code: '398',
    name: 'IDEAL CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/398.svg',
    type: 'Outros',
    ispb: '31749596',
    shortName: 'IDEAL CTVM S.A.',
    
  },
  {
    code: '399',
    name: 'Kirton Bank S.A. - Banco Múltiplo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/399.svg',
    type: 'Banco',
    ispb: '01701201',
    shortName: 'KIRTON BANK',
    
  },
  {
    code: '400',
    name: 'COOPERATIVA DE CRÉDITO, POUPANÇA E SERVIÇOS FINANCEIROS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/400.svg',
    type: 'Cooperativa',
    ispb: '05491616',
    shortName: 'COOP CREDITAG',
    
  },
  {
    code: '401',
    name: 'IUGU INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/401.svg',
    type: 'Banco',
    ispb: '15111975',
    shortName: 'IUGU IP S.A.',
    
  },
  {
    code: '402',
    name: 'COBUCCIO S/A - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/402.svg',
    type: 'Outros',
    ispb: '36947229',
    shortName: 'COBUCCIO S.A. SCFI',
    
  },
  {
    code: '403',
    name: 'CORA SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/403.svg',
    type: 'Outros',
    ispb: '37880206',
    shortName: 'CORA SCFI',
    
  },
  {
    code: '404',
    name: 'SUMUP SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/404.svg',
    type: 'Outros',
    ispb: '37241230',
    shortName: 'SUMUP SCD S.A.',
    
  },
  {
    code: '406',
    name: 'ACCREDITO - SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/406.svg',
    type: 'Outros',
    ispb: '37715993',
    shortName: 'ACCREDITO SCD S.A.',
    
  },
  {
    code: '407',
    name: 'SEFER INVESTIMENTOS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/407.svg',
    type: 'Outros',
    ispb: '00329598',
    shortName: 'SEFER INVESTIMENTOS DTVM LTDA',
    
  },
  {
    code: '408',
    name: 'BONUSPAGO SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/408.svg',
    type: 'Outros',
    ispb: '36586946',
    shortName: 'BONUSPAGO SCD S.A.',
    
  },
  {
    code: '410',
    name: 'PLANNER SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/410.svg',
    type: 'Outros',
    ispb: '05684234',
    shortName: 'PLANNER SOCIEDADE DE CRÉDITO DIRETO',
    
  },
  {
    code: '411',
    name: 'Via Certa Financiadora S.A. - Crédito, Financiamento e Investimentos',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/411.svg',
    type: 'Banco',
    ispb: '05192316',
    shortName: 'VIA CERTA FINANCIADORA S.A. - CFI',
    
  },
  {
    code: '412',
    name: 'SOCIAL BANK BANCO MÚLTIPLO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/412.svg',
    type: 'Banco',
    ispb: '15173776',
    shortName: 'SOCIAL BANK S/A',
    
  },
  {
    code: '413',
    name: 'BANCO BV S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/413.svg',
    type: 'Banco',
    ispb: '01858774',
    shortName: 'BCO BV S.A.',
    
  },
  {
    code: '414',
    name: 'LEND SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/414.svg',
    type: 'Outros',
    ispb: '37526080',
    shortName: 'LEND SCD S.A.',
    
  },
  {
    code: '415',
    name: 'BANCO NACIONAL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/415.svg',
    type: 'Banco',
    ispb: '17157777',
    shortName: 'BCO NACIONAL',
    
  },
  {
    code: '416',
    name: 'LAMARA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/416.svg',
    type: 'Outros',
    ispb: '19324634',
    shortName: 'LAMARA SCD S.A.',
    
  },
  {
    code: '418',
    name: 'ZIPDIN SOLUÇÕES DIGITAIS SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/418.svg',
    type: 'Outros',
    ispb: '37414009',
    shortName: 'ZIPDIN SCD S.A.',
    
  },
  {
    code: '419',
    name: 'NUMBRS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/419.svg',
    type: 'Outros',
    ispb: '38129006',
    shortName: 'NUMBRS SCD S.A.',
    
  },
  {
    code: '421',
    name: 'LAR COOPERATIVA DE CRÉDITO - LAR CREDI',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/421.svg',
    type: 'Cooperativa',
    ispb: '39343350',
    shortName: 'CC LAR CREDI',
    
  },
  {
    code: '422',
    name: 'Banco Safra S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/422.svg',
    type: 'Banco',
    ispb: '58160789',
    shortName: 'BCO SAFRA S.A.',
    url: 'https://www.safra.com.br',
  },
  {
    code: '423',
    name: 'COLUNA S/A DISTRIBUIDORA DE TITULOS E VALORES MOBILIÁRIOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/423.svg',
    type: 'Outros',
    ispb: '00460065',
    shortName: 'COLUNA S.A. DTVM',
    
  },
  {
    code: '425',
    name: 'SOCINAL S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/425.svg',
    type: 'Banco',
    ispb: '03881423',
    shortName: 'SOCINAL S.A. CFI',
    
  },
  {
    code: '426',
    name: 'NEON FINANCEIRA - CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/426.svg',
    type: 'Banco',
    ispb: '11285104',
    shortName: 'NEON FINANCEIRA - CFI S.A.',
    
  },
  {
    code: '427',
    name: 'COOPERATIVA DE CRÉDITO DOS SERVIDORES DA UNIVERSIDADE FEDERAL DO ESPIRITO SANTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/427.svg',
    type: 'Cooperativa',
    ispb: '27302181',
    shortName: 'CRED.UFES',
    
  },
  {
    code: '428',
    name: 'CREDSYSTEM SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/428.svg',
    type: 'Outros',
    ispb: '39664698',
    shortName: 'CREDSYSTEM SCD S.A.',
    
  },
  {
    code: '429',
    name: 'Crediare S.A. - Crédito, financiamento e investimento',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/429.svg',
    type: 'Banco',
    ispb: '05676026',
    shortName: 'CREDIARE CFI S.A.',
    
  },
  {
    code: '430',
    name: 'COOPERATIVA DE CREDITO RURAL SEARA - CREDISEARA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/430.svg',
    type: 'Cooperativa',
    ispb: '00204963',
    shortName: 'CCR SEARA',
    
  },
  {
    code: '433',
    name: 'BR-CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/433.svg',
    type: 'Outros',
    ispb: '44077014',
    shortName: 'BR-CAPITAL DTVM S.A.',
    
  },
  {
    code: '435',
    name: 'DELCRED SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/435.svg',
    type: 'Outros',
    ispb: '38224857',
    shortName: 'DELCRED SCD S.A.',
    
  },
  {
    code: '438',
    name: 'TRUSTEE DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/438.svg',
    type: 'Outros',
    ispb: '67030395',
    shortName: 'TRUSTEE DTVM LTDA.',
    
  },
  {
    code: '439',
    name: 'ID CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/439.svg',
    type: 'Outros',
    ispb: '16695922',
    shortName: 'ID CTVM',
    
  },
  {
    code: '440',
    name: 'CREDI&GENTE - COOPERATIVA DE CRÉDITO E INVESTIMENTOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/440.svg',
    type: 'Cooperativa',
    ispb: '82096447',
    shortName: 'COOP CREDI&GENTE',
    
  },
  {
    code: '442',
    name: 'MAGNETIS - DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/442.svg',
    type: 'Outros',
    ispb: '87963450',
    shortName: 'MAGNETIS - DTVM',
    
  },
  {
    code: '443',
    name: 'OCTA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/443.svg',
    type: 'Outros',
    ispb: '39416705',
    shortName: 'OCTA SCD S.A.',
    
  },
  {
    code: '444',
    name: 'TRINUS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/444.svg',
    type: 'Outros',
    ispb: '40654622',
    shortName: 'TRINUS SCD S.A.',
    
  },
  {
    code: '445',
    name: 'PLANTAE S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/445.svg',
    type: 'Banco',
    ispb: '35551187',
    shortName: 'PLANTAE CFI',
    
  },
  {
    code: '447',
    name: 'MIRAE ASSET (BRASIL) CORRETORA DE CÂMBIO, TÍTULOS  E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/447.svg',
    type: 'Outros',
    ispb: '12392983',
    shortName: 'MIRAE ASSET (BRASIL) CCTVM LTDA.',
    
  },
  {
    code: '448',
    name: 'HEMERA DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/448.svg',
    type: 'Outros',
    ispb: '39669186',
    shortName: 'HEMERA DTVM LTDA.',
    
  },
  {
    code: '449',
    name: 'DM SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/449.svg',
    type: 'Outros',
    ispb: '37555231',
    shortName: 'DM',
    
  },
  {
    code: '450',
    name: 'FITBANK INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/450.svg',
    type: 'Banco',
    ispb: '13203354',
    shortName: 'FITBANK IP',
    
  },
  {
    code: '451',
    name: 'J17 - SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/451.svg',
    type: 'Outros',
    ispb: '40475846',
    shortName: 'J17 - SCD S/A',
    
  },
  {
    code: '452',
    name: 'CREDIFIT SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/452.svg',
    type: 'Outros',
    ispb: '39676772',
    shortName: 'CREDIFIT SCD S.A.',
    
  },
  {
    code: '454',
    name: 'MÉRITO DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/454.svg',
    type: 'Outros',
    ispb: '41592532',
    shortName: 'MÉRITO DTVM LTDA.',
    
  },
  {
    code: '455',
    name: 'VIS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/455.svg',
    type: 'Outros',
    ispb: '38429045',
    shortName: 'VIS DTVM LTDA',
    
  },
  {
    code: '456',
    name: 'Banco MUFG Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/456.svg',
    type: 'Banco',
    ispb: '60498557',
    shortName: 'BCO MUFG BRASIL S.A.',
    url: 'https://www.br.bk.mufg.jp',
  },
  {
    code: '457',
    name: 'UY3 SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/457.svg',
    type: 'Outros',
    ispb: '39587424',
    shortName: 'UY3 SCD S/A',
    
  },
  {
    code: '458',
    name: 'HEDGE INVESTMENTS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/458.svg',
    type: 'Outros',
    ispb: '07253654',
    shortName: 'HEDGE INVESTMENTS DTVM LTDA.',
    
  },
  {
    code: '459',
    name: 'COOPERATIVA DE CRÉDITO MÚTUO DE SERVIDORES PÚBLICOS DO ESTADO DE SÃO PAULO - CREDIFISCO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/459.svg',
    type: 'Cooperativa',
    ispb: '04546162',
    shortName: 'CCM SERV. PÚBLICOS SP',
    
  },
  {
    code: '460',
    name: 'UNAVANTI SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/460.svg',
    type: 'Outros',
    ispb: '42047025',
    shortName: 'UNAVANTI SCD S/A',
    
  },
  {
    code: '461',
    name: 'ASAAS GESTÃO FINANCEIRA INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/461.svg',
    type: 'Banco',
    ispb: '19540550',
    shortName: 'ASAAS IP S.A.',
    
  },
  {
    code: '462',
    name: 'STARK SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/462.svg',
    type: 'Outros',
    ispb: '39908427',
    shortName: 'STARK SCD S.A.',
    
  },
  {
    code: '463',
    name: 'AZUMI DISTRIBUIDORA DE TíTULOS E VALORES MOBILIáRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/463.svg',
    type: 'Outros',
    ispb: '40434681',
    shortName: 'AZUMI DTVM',
    
  },
  {
    code: '464',
    name: 'Banco Sumitomo Mitsui Brasileiro S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/464.svg',
    type: 'Banco',
    ispb: '60518222',
    shortName: 'BCO SUMITOMO MITSUI BRASIL S.A.',
    url: 'https://www.smbcgroup.com.br',
  },
  {
    code: '465',
    name: 'CAPITAL CONSIG SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/465.svg',
    type: 'Outros',
    ispb: '40083667',
    shortName: 'CAPITAL CONSIG SCD S.A.',
    
  },
  {
    code: '467',
    name: 'MASTER S/A CORRETORA DE CâMBIO, TíTULOS E VALORES MOBILIáRIOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/467.svg',
    type: 'Outros',
    ispb: '33886862',
    shortName: 'MASTER S/A CCTVM',
    
  },
  {
    code: '468',
    name: 'PORTOSEG S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/468.svg',
    type: 'Banco',
    ispb: '04862600',
    shortName: 'PORTOSEG S.A. CFI',
    
  },
  {
    code: '469',
    name: 'PICPAY INVEST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/469.svg',
    type: 'Outros',
    ispb: '07138049',
    shortName: 'PICPAY INVEST',
    
  },
  {
    code: '470',
    name: 'CDC SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/470.svg',
    type: 'Outros',
    ispb: '18394228',
    shortName: 'CDC SCD S.A.',
    
  },
  {
    code: '471',
    name: 'COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DOS SERVIDORES PÚBLICOS DE PINHÃO - CRESERV CREDISIS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/471.svg',
    type: 'Cooperativa',
    ispb: '04831810',
    shortName: 'COOP CRESERV CREDISIS',
    
  },
  {
    code: '473',
    name: 'Banco Caixa Geral - Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/473.svg',
    type: 'Banco',
    ispb: '33466988',
    shortName: 'BCO CAIXA GERAL BRASIL S.A.',
    url: 'https://www.bcgbrasil.com.br',
  },
  {
    code: '475',
    name: 'Banco Yamaha Motor do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/475.svg',
    type: 'Banco',
    ispb: '10371492',
    shortName: 'BCO YAMAHA MOTOR S.A.',
    
  },
  {
    code: '477',
    name: 'Citibank N.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/477.svg',
    type: 'Banco',
    ispb: '33042953',
    shortName: 'CITIBANK N.A.',
    url: 'https://www.citibank.com',
  },
  {
    code: '478',
    name: 'GAZINCRED S.A. SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/478.svg',
    type: 'Outros',
    ispb: '11760553',
    shortName: 'GAZINCRED S.A. SCFI',
    
  },
  {
    code: '479',
    name: 'Banco ItauBank S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/479.svg',
    type: 'Banco',
    ispb: '60394079',
    shortName: 'BCO ITAUBANK S.A.',
    url: 'https://www.itau.com.br',
  },
  {
    code: '481',
    name: 'SUPERLÓGICA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/481.svg',
    type: 'Outros',
    ispb: '43599047',
    shortName: 'SUPERLÓGICA SCD S.A.',
    
  },
  {
    code: '482',
    name: 'ARTTA SOCIEDADE DE CRÉDITO DIRETO S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/482.svg',
    type: 'Outros',
    ispb: '42259084',
    shortName: 'ARTTA SCD',
    
  },
  {
    code: '484',
    name: 'MAF DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/484.svg',
    type: 'Outros',
    ispb: '36864992',
    shortName: 'MAF DTVM SA',
    
  },
  {
    code: '487',
    name: 'DEUTSCHE BANK S.A. - BANCO ALEMAO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/487.svg',
    type: 'Banco',
    ispb: '62331228',
    shortName: 'DEUTSCHE BANK S.A.BCO ALEMAO',
    url: 'https://country.db.com/brazil/index',
  },
  {
    code: '488',
    name: 'JPMorgan Chase Bank, National Association',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/488.svg',
    type: 'Banco',
    ispb: '46518205',
    shortName: 'JPMORGAN CHASE BANK',
    url: 'https://www.jpmorganchase.com',
  },
  {
    code: '492',
    name: 'ING Bank N.V.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/492.svg',
    type: 'Banco',
    ispb: '49336860',
    shortName: 'ING BANK N.V.',
    url: 'https://www.ing.com',
  },
  {
    code: '495',
    name: 'Banco de La Provincia de Buenos Aires',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/495.svg',
    type: 'Banco',
    ispb: '44189447',
    shortName: 'BCO LA PROVINCIA B AIRES BCE',
    
  },
  {
    code: '496',
    name: 'BBVA BRASIL BANCO DE INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/496.svg',
    type: 'Banco',
    ispb: '45283173',
    shortName: 'BBVA BRASIL BI S.A.',
    
  },
  {
    code: '505',
    name: 'BANCO UBS (BRASIL) S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/505.svg',
    type: 'Banco',
    ispb: '32062580',
    shortName: 'BCO UBS BRASIL',
    
  },
  {
    code: '506',
    name: 'RJI CORRETORA DE TITULOS E VALORES MOBILIARIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/506.svg',
    type: 'Outros',
    ispb: '42066258',
    shortName: 'RJI',
    
  },
  {
    code: '507',
    name: 'SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO EFÍ S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/507.svg',
    type: 'Outros',
    ispb: '37229413',
    shortName: 'SCFI EFÍ S.A.',
    
  },
  {
    code: '508',
    name: 'AVENUE SECURITIES DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/508.svg',
    type: 'Outros',
    ispb: '61384004',
    shortName: 'AVENUE SECURITIES DTVM LTDA.',
    
  },
  {
    code: '509',
    name: 'CELCOIN INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/509.svg',
    type: 'Banco',
    ispb: '13935893',
    shortName: 'CELCOIN IP S.A.',
    
  },
  {
    code: '510',
    name: 'FFCRED SOCIEDADE DE CRÉDITO DIRETO S.A..',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/510.svg',
    type: 'Outros',
    ispb: '39738065',
    shortName: 'FFCRED SCD S.A.',
    
  },
  {
    code: '511',
    name: 'MAGNUM SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/511.svg',
    type: 'Outros',
    ispb: '44683140',
    shortName: 'MAGNUM SCD',
    
  },
  {
    code: '512',
    name: 'FINVEST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/512.svg',
    type: 'Outros',
    ispb: '36266751',
    shortName: 'FINVEST DTVM',
    
  },
  {
    code: '513',
    name: 'ATF SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/513.svg',
    type: 'Outros',
    ispb: '44728700',
    shortName: 'ATF SCD S.A.',
    
  },
  {
    code: '514',
    name: 'EXIM CORRETORA DE CAMBIO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/514.svg',
    type: 'Outros',
    ispb: '73302408',
    shortName: 'EXIM CC LTDA.',
    
  },
  {
    code: '516',
    name: 'QISTA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/516.svg',
    type: 'Banco',
    ispb: '36583700',
    shortName: 'QISTA S.A. CFI',
    
  },
  {
    code: '518',
    name: 'MERCADO CRÉDITO SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/518.svg',
    type: 'Outros',
    ispb: '37679449',
    shortName: 'MERCADO CRÉDITO SCFI S.A.',
    
  },
  {
    code: '519',
    name: 'LIONS TRUST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/519.svg',
    type: 'Outros',
    ispb: '40768766',
    shortName: 'LIONS TRUST DTVM',
    
  },
  {
    code: '520',
    name: 'SOMAPAY SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/520.svg',
    type: 'Outros',
    ispb: '44705774',
    shortName: 'SOMAPAY SCD S.A.',
    
  },
  {
    code: '521',
    name: 'PEAK SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/521.svg',
    type: 'Banco',
    ispb: '44019481',
    shortName: 'PEAK SEP S.A.',
    
  },
  {
    code: '522',
    name: 'RED SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/522.svg',
    type: 'Outros',
    ispb: '47593544',
    shortName: 'RED SCD S.A.',
    
  },
  {
    code: '523',
    name: 'HR DIGITAL - SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/523.svg',
    type: 'Fintech',
    ispb: '44292580',
    shortName: 'HR DIGITAL SCD',
    
  },
  {
    code: '524',
    name: 'WNT CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/524.svg',
    type: 'Outros',
    ispb: '45854066',
    shortName: 'WNT CAPITAL DTVM',
    
  },
  {
    code: '525',
    name: 'INTERCAM CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/525.svg',
    type: 'Outros',
    ispb: '34265629',
    shortName: 'INTERCAM CC LTDA',
    
  },
  {
    code: '526',
    name: 'MONETARIE SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/526.svg',
    type: 'Outros',
    ispb: '46026562',
    shortName: 'MONETARIE SCD',
    
  },
  {
    code: '527',
    name: 'ATICCA - SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/527.svg',
    type: 'Outros',
    ispb: '44478623',
    shortName: 'ATICCA SCD S.A.',
    
  },
  {
    code: '528',
    name: 'REAG TRUST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/528.svg',
    type: 'Outros',
    ispb: '34829992',
    shortName: 'REAG TRUST DTVM',
    
  },
  {
    code: '529',
    name: 'PINBANK BRASIL INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/529.svg',
    type: 'Banco',
    ispb: '17079937',
    shortName: 'PINBANK IP',
    
  },
  {
    code: '530',
    name: 'SER FINANCE SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/530.svg',
    type: 'Outros',
    ispb: '47873449',
    shortName: 'SER FINANCE SCD S.A.',
    
  },
  {
    code: '531',
    name: 'BMP SOCIEDADE DE CRÉDITO DIRETO S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/531.svg',
    type: 'Outros',
    ispb: '34337707',
    shortName: 'BMP SCD S.A.',
    
  },
  {
    code: '532',
    name: 'EAGLE SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/532.svg',
    type: 'Outros',
    ispb: '45745537',
    shortName: 'EAGLE SCD S.A.',
    
  },
  {
    code: '533',
    name: 'SRM BANK INSTITUIÇÃO DE PAGAMENTO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/533.svg',
    type: 'Banco',
    ispb: '22575466',
    shortName: 'SRM BANK',
    
  },
  {
    code: '534',
    name: 'EWALLY INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/534.svg',
    type: 'Banco',
    ispb: '00714671',
    shortName: 'EWALLY IP S.A.',
    
  },
  {
    code: '535',
    name: 'OPEA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/535.svg',
    type: 'Outros',
    ispb: '39519944',
    shortName: 'OPEA SCD',
    
  },
  {
    code: '536',
    name: 'NEON PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/536.svg',
    type: 'Fintech',
    ispb: '20855875',
    shortName: 'NEON PAGAMENTOS S.A. IP',
    
  },
  {
    code: '537',
    name: 'MICROCASH SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/537.svg',
    type: 'Outros',
    ispb: '45756448',
    shortName: 'MICROCASH SCMEPP LTDA.',
    
  },
  {
    code: '538',
    name: 'SUDACRED SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/538.svg',
    type: 'Outros',
    ispb: '20251847',
    shortName: 'SUDACRED SCD S.A.',
    
  },
  {
    code: '539',
    name: 'SANTINVEST S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/539.svg',
    type: 'Banco',
    ispb: '00122327',
    shortName: 'SANTINVEST S.A. - CFI',
    
  },
  {
    code: '540',
    name: 'HBI SOCIEDADE DE CRÉDITO DIRETO S/A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/540.svg',
    type: 'Outros',
    ispb: '04849745',
    shortName: 'HBI SCD',
    
  },
  {
    code: '541',
    name: 'FUNDO GARANTIDOR DE CREDITOS - FGC',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/541.svg',
    type: 'Banco',
    ispb: '00954288',
    shortName: 'FDO GARANTIDOR CRÉDITOS',
    
  },
  {
    code: '542',
    name: 'CLOUDWALK INSTITUIÇÃO DE PAGAMENTO E SERVICOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/542.svg',
    type: 'Banco',
    ispb: '18189547',
    shortName: 'CLOUDWALK IP LTDA',
    
  },
  {
    code: '543',
    name: 'COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DOS ELETRICITÁRIOS E DOS TRABALHADORES DAS EMPRESAS DO SETOR DE ENERGIA - COOPCRECE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/543.svg',
    type: 'Cooperativa',
    ispb: '92825397',
    shortName: 'COOPCRECE',
    
  },
  {
    code: '544',
    name: 'MULTICRED SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/544.svg',
    type: 'Outros',
    ispb: '38593706',
    shortName: 'MULTICRED SCD S.A.',
    
  },
  {
    code: '545',
    name: 'SENSO CORRETORA DE CAMBIO E VALORES MOBILIARIOS S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/545.svg',
    type: 'Outros',
    ispb: '17352220',
    shortName: 'SENSO CCVM S.A.',
    
  },
  {
    code: '546',
    name: 'OKTO INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/546.svg',
    type: 'Banco',
    ispb: '30980539',
    shortName: 'OKTO IP',
    
  },
  {
    code: '547',
    name: 'BNK DIGITAL SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/547.svg',
    type: 'Fintech',
    ispb: '45331622',
    shortName: 'BNK DIGITAL SCD S.A.',
    
  },
  {
    code: '548',
    name: 'RPW S/A SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/548.svg',
    type: 'Outros',
    ispb: '06249129',
    shortName: 'RPW S.A. SCFI',
    
  },
  {
    code: '549',
    name: 'INTRA INVESTIMENTOS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/549.svg',
    type: 'Outros',
    ispb: '15489568',
    shortName: 'INTRA DTVM',
    
  },
  {
    code: '550',
    name: 'BEETELLER INSTITUIÇÃO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/550.svg',
    type: 'Banco',
    ispb: '32074986',
    shortName: 'BEETELLER',
    
  },
  {
    code: '551',
    name: 'VERT DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/551.svg',
    type: 'Outros',
    ispb: '48967968',
    shortName: 'VERT DTVM LTDA.',
    
  },
  {
    code: '552',
    name: 'UZZIPAY INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/552.svg',
    type: 'Banco',
    ispb: '32192325',
    shortName: 'UZZIPAY IP S.A.',
    
  },
  {
    code: '553',
    name: 'PERCAPITAL SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/553.svg',
    type: 'Outros',
    ispb: '48707451',
    shortName: 'PERCAPITAL SCD S.A.',
    
  },
  {
    code: '554',
    name: 'STONEX BANCO DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/554.svg',
    type: 'Banco',
    ispb: '28811341',
    shortName: 'STONEX BANCO DE CÂMBIO S.A.',
    
  },
  {
    code: '555',
    name: 'PAN FINANCEIRA S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTOS',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/555.svg',
    type: 'Banco',
    ispb: '02682287',
    shortName: '"PAN FINANCEIRA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTOS"',
    
  },
  {
    code: '556',
    name: 'SAYGO CORRETORA DE CÂMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/556.svg',
    type: 'Outros',
    ispb: '40333582',
    shortName: 'SAYGO CÂMBIO',
    
  },
  {
    code: '557',
    name: 'PAGPRIME INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/557.svg',
    type: 'Banco',
    ispb: '30944783',
    shortName: 'PAGPRIME IP',
    
  },
  {
    code: '558',
    name: 'QI DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/558.svg',
    type: 'Outros',
    ispb: '46955383',
    shortName: 'QI DTVM LTDA.',
    
  },
  {
    code: '559',
    name: 'KANASTRA FINANCEIRA S.A, CREDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/559.svg',
    type: 'Banco',
    ispb: '49288113',
    shortName: 'KANASTRA CFI',
    
  },
  {
    code: '560',
    name: 'MAG INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/560.svg',
    type: 'Banco',
    ispb: '21995256',
    shortName: 'MAG IP LTDA.',
    
  },
  {
    code: '561',
    name: 'PAY4FUN INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/561.svg',
    type: 'Banco',
    ispb: '20757199',
    shortName: 'PAY4FUN IP S.A.',
    
  },
  {
    code: '562',
    name: 'AZIMUT BRASIL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/562.svg',
    type: 'Outros',
    ispb: '18684408',
    shortName: 'AZIMUT BRASIL DTVM LTDA',
    
  },
  {
    code: '563',
    name: 'PROTEGE CASH INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/563.svg',
    type: 'Banco',
    ispb: '40276692',
    shortName: 'PROTEGE CASH',
    
  },
  {
    code: '565',
    name: 'ÁGORA CORRETORA DE TITULOS E VALORES MOBILIARIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/565.svg',
    type: 'Outros',
    ispb: '74014747',
    shortName: 'ÁGORA CTVM S.A.',
    
  },
  {
    code: '566',
    name: 'FLAGSHIP INSTITUICAO DE PAGAMENTOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/566.svg',
    type: 'Fintech',
    ispb: '23114447',
    shortName: 'FLAGSHIP IP LTDA',
    
  },
  {
    code: '567',
    name: 'MERCANTIL FINANCEIRA S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/567.svg',
    type: 'Outros',
    ispb: '33040601',
    shortName: 'MERCANTIL FINANCEIRA',
    
  },
  {
    code: '568',
    name: 'BRCONDOS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/568.svg',
    type: 'Outros',
    ispb: '49933388',
    shortName: 'BRCONDOS SCD S.A.',
    
  },
  {
    code: '569',
    name: 'CONTA PRONTA INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/569.svg',
    type: 'Banco',
    ispb: '12473687',
    shortName: 'CONTA PRONTA IP',
    
  },
  {
    code: '572',
    name: 'ALL IN CRED SOCIEDADE DE CREDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/572.svg',
    type: 'Banco',
    ispb: '51414521',
    shortName: 'ALL IN CRED SCD S.A.',
    
  },
  {
    code: '573',
    name: 'OXY COMPANHIA HIPOTECÁRIA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/573.svg',
    type: 'Banco',
    ispb: '18282093',
    shortName: 'OXY CH',
    
  },
  {
    code: '574',
    name: 'A55 SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/574.svg',
    type: 'Outros',
    ispb: '48756121',
    shortName: 'A55 SCD S.A.',
    
  },
  {
    code: '575',
    name: 'DGBK CREDIT S.A. - SOCIEDADE DE CRÉDITO DIRETO.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/575.svg',
    type: 'Outros',
    ispb: '48584954',
    shortName: 'DGBK CREDIT S.A. - SOCIEDADE DE CRÉDITO DIRETO.',
    
  },
  {
    code: '576',
    name: 'MERCADO BITCOIN INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/576.svg',
    type: 'Banco',
    ispb: '11351086',
    shortName: 'MERCADO BITCOIN IP LTDA',
    
  },
  {
    code: '577',
    name: 'DESENVOLVE SP - AGÊNCIA DE FOMENTO DO ESTADO DE SÃO PAULO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/577.svg',
    type: 'Banco',
    ispb: '10663610',
    shortName: 'AF DESENVOLVE SP S.A.',
    
  },
  {
    code: '578',
    name: 'COOPERATIVA DE CRÉDITO DOS SERVIDORES PÚBLICOS MUNICIPAIS DA GRANDE VITÓRIA/ES',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/578.svg',
    type: 'Cooperativa',
    ispb: '01235921',
    shortName: 'SICRES',
    
  },
  {
    code: '579',
    name: 'QUADRA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/579.svg',
    type: 'Outros',
    ispb: '49555647',
    shortName: 'QUADRA SCD',
    
  },
  {
    code: '580',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO, POUPANÇA E INVESTIMENTO DO SUL E SUDESTE - CENTRAL SICREDI SUL/SUDESTE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/580.svg',
    type: 'Cooperativa',
    ispb: '87437687',
    shortName: 'CCCPOUPINV SUL E SUDESTE - CENTRAL SUL/SUDESTE',
    
  },
  {
    code: '581',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO, POUPANÇA E INVESTIMENTO DO NORDESTE - CENTRAL SICREDI NORDESTE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/581.svg',
    type: 'Cooperativa',
    ispb: '70119680',
    shortName: 'CENTRAL NORDESTE',
    
  },
  {
    code: '582',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO, POUPANÇA E INVESTIMENTO DE MATO GROSSO DO SUL, GOIÁS, DISTRITO FEDERAL E TOCANTINS - CENTRAL SICREDI BRASIL CENTRAL',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/582.svg',
    type: 'Cooperativa',
    ispb: '33737818',
    shortName: '"CCC POUP INV DE MS, GO, DF E TO"',
    
  },
  {
    code: '583',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO, POUPANÇA E INVESTIMENTO DO CENTRO NORTE DO BRASIL - CENTRAL SICREDI CENTRO NORTE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/583.svg',
    type: 'Cooperativa',
    ispb: '33667205',
    shortName: 'CCC POUP INV DO CENTRO NORTE DO BRASIL',
    
  },
  {
    code: '584',
    name: 'COOPERATIVA CENTRAL DE CRÉDITO, POUPANÇA E INVESTIMENTO DOS ESTADOS DO PARANÁ, SÃO PAULO E RIO DE JANEIRO - CENTRAL SICREDI PR/SP/RJ',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/584.svg',
    type: 'Cooperativa',
    ispb: '80230774',
    shortName: '"CCC POUP E INV DOS ESTADOS DO PR, SP E RJ"',
    
  },
  {
    code: '585',
    name: 'SETHI SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/585.svg',
    type: 'Outros',
    ispb: '50946592',
    shortName: 'SETHI SCD SA',
    
  },
  {
    code: '586',
    name: 'Z1 INSTITUIÇÃO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/586.svg',
    type: 'Banco',
    ispb: '35810871',
    shortName: 'Z1 IP LTDA.',
    
  },
  {
    code: '587',
    name: 'FIDD DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/587.svg',
    type: 'Outros',
    ispb: '37678915',
    shortName: 'FIDD DTVM LTDA.',
    
  },
  {
    code: '588',
    name: 'PROVER PROMOCAO DE VENDAS INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/588.svg',
    type: 'Banco',
    ispb: '20308187',
    shortName: 'PROVER PROMOCAO DE VENDAS IP LTDA.',
    
  },
  {
    code: '589',
    name: 'G5 SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/589.svg',
    type: 'Outros',
    ispb: '51212088',
    shortName: 'G5 SCD SA',
    
  },
  {
    code: '590',
    name: 'REPASSES FINANCEIROS E SOLUCOES TECNOLOGICAS INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/590.svg',
    type: 'Banco',
    ispb: '40473435',
    shortName: 'REPASSES FINANCEIROS E SOLUCOES TECNOLOGICAS IP S.A.',
    
  },
  {
    code: '591',
    name: 'BANVOX DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/591.svg',
    type: 'Outros',
    ispb: '02671743',
    shortName: 'BANVOX DTVM',
    
  },
  {
    code: '592',
    name: 'INSTITUIÇÃO DE PAGAMENTOS MAPS LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/592.svg',
    type: 'Fintech',
    ispb: '45548763',
    shortName: 'MAPS IP LTDA.',
    
  },
  {
    code: '593',
    name: 'TRANSFEERA INSTITUIÇÃO DE PAGAMENTO S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/593.svg',
    type: 'Banco',
    ispb: '27084098',
    shortName: 'TRANSFEERA IP S.A.',
    
  },
  {
    code: '594',
    name: 'ASA SOCIEDADE DE CRÉDITO FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/594.svg',
    type: 'Outros',
    ispb: '48703388',
    shortName: 'ASA SCFI S.A.',
    
  },
  {
    code: '595',
    name: 'ZOOP TECNOLOGIA & INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/595.svg',
    type: 'Banco',
    ispb: '19468242',
    shortName: 'ZOOP MEIOS DE PAGAMENTO',
    
  },
  {
    code: '597',
    name: 'ISSUER INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/597.svg',
    type: 'Banco',
    ispb: '34747388',
    shortName: 'ISSUER IP LTDA.',
    
  },
  {
    code: '598',
    name: 'KONECT SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/598.svg',
    type: 'Outros',
    ispb: '50626276',
    shortName: 'KONECT SCD S/A',
    
  },
  {
    code: '599',
    name: 'AGORACRED S/A SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/599.svg',
    type: 'Outros',
    ispb: '36321990',
    shortName: 'AGORACRED S/A SCFI',
    
  },
  {
    code: '600',
    name: 'Banco Luso Brasileiro S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/600.svg',
    type: 'Banco',
    ispb: '59118133',
    shortName: 'BCO LUSO BRASILEIRO S.A.',
    url: 'https://bancoluso.com.br/',
  },
  {
    code: '604',
    name: 'Banco Industrial do Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/604.svg',
    type: 'Banco',
    ispb: '31895683',
    shortName: 'BCO INDUSTRIAL DO BRASIL S.A.',
    url: 'https://www.bancoindustrial.com.br',
  },
  {
    code: '610',
    name: 'Banco VR S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/610.svg',
    type: 'Banco',
    ispb: '78626983',
    shortName: 'BCO VR S.A.',
    
  },
  {
    code: '611',
    name: 'Banco Paulista S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/611.svg',
    type: 'Banco',
    ispb: '61820817',
    shortName: 'BCO PAULISTA S.A.',
    url: 'https://www.bancopaulista.com.br',
  },
  {
    code: '612',
    name: 'Banco Guanabara S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/612.svg',
    type: 'Banco',
    ispb: '31880826',
    shortName: 'BCO GUANABARA S.A.',
    url: 'https://www.bancoguanabara.com.br',
  },
  {
    code: '613',
    name: 'Omni Banco S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/613.svg',
    type: 'Banco',
    ispb: '60850229',
    shortName: 'OMNI BANCO S.A.',
    
  },
  {
    code: '614',
    name: 'SANTS SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/614.svg',
    type: 'Outros',
    ispb: '52440987',
    shortName: 'SANTS SCD S.A.',
    
  },
  {
    code: '615',
    name: 'SMART SOLUTIONS GROUP INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/615.svg',
    type: 'Banco',
    ispb: '37470405',
    shortName: 'SMART SOLUTIONS GROUP IP LTDA',
    
  },
  {
    code: '619',
    name: 'TRIO INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/619.svg',
    type: 'Banco',
    ispb: '49931906',
    shortName: 'TRIO IP LTDA.',
    
  },
  {
    code: '620',
    name: 'REVOLUT SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/620.svg',
    type: 'Outros',
    ispb: '51342763',
    shortName: 'REVOLUT SCD S.A.',
    
  },
  {
    code: '623',
    name: 'Banco Pan S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/623.svg',
    type: 'Banco',
    ispb: '59285411',
    shortName: 'BANCO PAN',
    url: 'https://www.bancopan.com.br',
  },
  {
    code: '626',
    name: 'BANCO C6 CONSIGNADO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/626.svg',
    type: 'Banco',
    ispb: '61348538',
    shortName: 'BCO C6 CONSIG',
    
  },
  {
    code: '630',
    name: 'BANCO LETSBANK S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/630.svg',
    type: 'Banco',
    ispb: '58497702',
    shortName: 'BANCO LETSBANK S.A.',
    
  },
  {
    code: '632',
    name: 'Z-ON SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/632.svg',
    type: 'Outros',
    ispb: '52586293',
    shortName: 'Z-ON SCD S.A.',
    
  },
  {
    code: '633',
    name: 'Banco Rendimento S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/633.svg',
    type: 'Banco',
    ispb: '68900810',
    shortName: 'BCO RENDIMENTO S.A.',
    url: 'https://www.rendimento.com.br',
  },
  {
    code: '634',
    name: 'BANCO TRIANGULO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/634.svg',
    type: 'Banco',
    ispb: '17351180',
    shortName: 'BCO TRIANGULO S.A.',
    url: 'https://www.tribanco.com.br',
  },
  {
    code: '636',
    name: 'GIRO - SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/636.svg',
    type: 'Outros',
    ispb: '40112555',
    shortName: 'GIRO - SCD S/A',
    
  },
  {
    code: '637',
    name: 'BANCO SOFISA S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/637.svg',
    type: 'Banco',
    ispb: '60889128',
    shortName: 'BCO SOFISA S.A.',
    url: 'https://www.sofisa.com.br',
  },
  {
    code: '643',
    name: 'Banco Pine S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/643.svg',
    type: 'Banco',
    ispb: '62144175',
    shortName: 'BCO PINE S.A.',
    url: 'https://www.pine.com',
  },
  {
    code: '644',
    name: '321 SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/644.svg',
    type: 'Outros',
    ispb: '54647259',
    shortName: '321 SCD S.A.',
    
  },
  {
    code: '646',
    name: 'DM FINANCEIRA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/646.svg',
    type: 'Banco',
    ispb: '91669747',
    shortName: 'DM SA CFI',
    
  },
  {
    code: '651',
    name: 'PAGARE INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/651.svg',
    type: 'Banco',
    ispb: '25104230',
    shortName: 'PAGARE IP S.A.',
    
  },
  {
    code: '652',
    name: 'Itaú Unibanco Holding S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/652.svg',
    type: 'Banco',
    ispb: '60872504',
    shortName: 'ITAÚ UNIBANCO HOLDING S.A.',
    url: 'https://www.itau.com.br',
  },
  {
    code: '653',
    name: 'BANCO PLENO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/653.svg',
    type: 'Banco',
    ispb: '61024352',
    shortName: 'BM PLENO S.A.',
    url: 'https://www.bip.b.br',
  },
  {
    code: '654',
    name: 'BANCO DIGIMAIS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/654.svg',
    type: 'Banco',
    ispb: '92874270',
    shortName: 'BCO DIGIMAIS S.A.',
    
  },
  {
    code: '655',
    name: 'Banco Votorantim S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/655.svg',
    type: 'Banco',
    ispb: '59588111',
    shortName: 'BCO VOTORANTIM S.A.',
    url: 'https://www.bancovotorantim.com.br',
  },
  {
    code: '659',
    name: 'ONEKEY PAYMENTS INSTITUICAO DE PAGAMENTO SA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/659.svg',
    type: 'Banco',
    ispb: '35210410',
    shortName: 'ONEKEY PAYMENTS IP S.A.',
    
  },
  {
    code: '660',
    name: 'PAGME INSTITUIÇÃO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/660.svg',
    type: 'Banco',
    ispb: '34471744',
    shortName: 'PAGME IP LTDA',
    
  },
  {
    code: '661',
    name: 'FREEX CORRETORA DE CAMBIO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/661.svg',
    type: 'Outros',
    ispb: '55428859',
    shortName: 'FREEX CC S.A.',
    
  },
  {
    code: '662',
    name: 'WE PAY OUT INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/662.svg',
    type: 'Banco',
    ispb: '32708748',
    shortName: 'WE PAY OUT IP LTDA.',
    
  },
  {
    code: '663',
    name: 'ACTUAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/663.svg',
    type: 'Outros',
    ispb: '44782130',
    shortName: 'ACTUAL DTVM S.A.',
    
  },
  {
    code: '664',
    name: 'EAGLE INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/664.svg',
    type: 'Banco',
    ispb: '11414839',
    shortName: 'EAGLE IP LTDA.',
    
  },
  {
    code: '665',
    name: 'STARK BANK S.A. - INSTITUICAO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/665.svg',
    type: 'Banco',
    ispb: '20018183',
    shortName: 'STARK BANK S.A. - IP',
    
  },
  {
    code: '666',
    name: 'URBANO S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/666.svg',
    type: 'Outros',
    ispb: '53842122',
    shortName: 'URBANO S.A. SCFI',
    
  },
  {
    code: '667',
    name: 'LIQUIDO INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/667.svg',
    type: 'Banco',
    ispb: '48552108',
    shortName: 'LIQUIDO IP LTDA',
    
  },
  {
    code: '668',
    name: 'VIA CAPITAL - SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/668.svg',
    type: 'Outros',
    ispb: '48632754',
    shortName: 'VIA CAPITAL SCD S/A',
    
  },
  {
    code: '670',
    name: 'IP4Y INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/670.svg',
    type: 'Banco',
    ispb: '11491029',
    shortName: 'IP4Y IP LTDA.',
    
  },
  {
    code: '671',
    name: 'ZERO INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/671.svg',
    type: 'Banco',
    ispb: '26264220',
    shortName: 'ZERO IP',
    
  },
  {
    code: '672',
    name: 'STONE SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/672.svg',
    type: 'Banco',
    ispb: '53505601',
    shortName: 'STONE CFI S.A.',
    
  },
  {
    code: '673',
    name: 'COOPERATIVA DE CRÉDITO RURAL DO AGRESTE ALAGOANO - COOPERAGRE',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/673.svg',
    type: 'Cooperativa',
    ispb: '08482873',
    shortName: 'CCR DO AGRESTE ALAGOANO',
    
  },
  {
    code: '674',
    name: 'HINOVA PAY INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/674.svg',
    type: 'Banco',
    ispb: '27970567',
    shortName: 'HINOVA PAY IP S.A.',
    
  },
  {
    code: '675',
    name: 'BANQI INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/675.svg',
    type: 'Banco',
    ispb: '30723871',
    shortName: 'BANQI',
    
  },
  {
    code: '676',
    name: 'DUFRIO FINANCEIRA, CRÉDITO, FINANCIAMENTO E INVESTIMENTOS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/676.svg',
    type: 'Banco',
    ispb: '35479592',
    shortName: 'DUFRIO CFI S.A.',
    
  },
  {
    code: '678',
    name: 'FIDEM SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/678.svg',
    type: 'Outros',
    ispb: '45716916',
    shortName: 'FIDEM SCD S/A',
    
  },
  {
    code: '679',
    name: 'PAY INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/679.svg',
    type: 'Banco',
    ispb: '36690516',
    shortName: 'PAY IP S.A.',
    
  },
  {
    code: '680',
    name: 'DELTA GLOBAL SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/680.svg',
    type: 'Outros',
    ispb: '55823094',
    shortName: 'DELTA GLOBAL SCD S.A.',
    
  },
  {
    code: '681',
    name: 'MT INSTITUICAO DE PAGAMENTO SA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/681.svg',
    type: 'Banco',
    ispb: '50871921',
    shortName: 'MT IP S.A.',
    
  },
  {
    code: '682',
    name: 'MONERY INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/682.svg',
    type: 'Banco',
    ispb: '46505612',
    shortName: 'MONERY IP S.A.',
    
  },
  {
    code: '684',
    name: 'HARMOS S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/684.svg',
    type: 'Outros',
    ispb: '56392166',
    shortName: 'HARMOS S.A. - SCFI',
    
  },
  {
    code: '685',
    name: 'TYCOON TECHNOLOGY INSTITUICAO DE PAGAMENTO S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/685.svg',
    type: 'Banco',
    ispb: '26615279',
    shortName: 'TYCOON TECHNOLOGY IIP S.A',
    
  },
  {
    code: '686',
    name: 'BIZ INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/686.svg',
    type: 'Banco',
    ispb: '12481100',
    shortName: 'BIZ IP LTDA.',
    
  },
  {
    code: '687',
    name: 'INCO SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/687.svg',
    type: 'Banco',
    ispb: '35340796',
    shortName: 'INCO SEP S.A.',
    
  },
  {
    code: '688',
    name: 'KIKAI SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/688.svg',
    type: 'Outros',
    ispb: '43978697',
    shortName: 'KIKAI SCD S.A.',
    
  },
  {
    code: '689',
    name: 'NVIO BRASIL SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/689.svg',
    type: 'Outros',
    ispb: '51118718',
    shortName: 'NVIO BRASIL SCD S.A.',
    
  },
  {
    code: '690',
    name: 'BK INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/690.svg',
    type: 'Banco',
    ispb: '16814330',
    shortName: 'BK IP S.A.',
    
  },
  {
    code: '692',
    name: 'SQUID SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/692.svg',
    type: 'Outros',
    ispb: '56198117',
    shortName: 'SQUID SCD S.A.',
    
  },
  {
    code: '693',
    name: 'EFEX INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/693.svg',
    type: 'Banco',
    ispb: '32820711',
    shortName: 'EFEX IP',
    
  },
  {
    code: '694',
    name: 'WOOVI INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/694.svg',
    type: 'Banco',
    ispb: '54811417',
    shortName: 'WOOVI IP LTDA.',
    
  },
  {
    code: '695',
    name: 'BEES INSTITUICAO DE PAGAMENTO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/695.svg',
    type: 'Banco',
    ispb: '35523352',
    shortName: 'BEES IP LTDA.',
    
  },
  {
    code: '697',
    name: 'MARMARIS CORRETORA DE CÂMBIO LTDA.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/697.svg',
    type: 'Outros',
    ispb: '45056494',
    shortName: 'MARMARIS',
    
  },
  {
    code: '698',
    name: 'BIT SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/698.svg',
    type: 'Outros',
    ispb: '58367961',
    shortName: 'BIT SCD S.A.',
    
  },
  {
    code: '699',
    name: 'BFC SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/699.svg',
    type: 'Outros',
    ispb: '59396084',
    shortName: 'BFC SCD S.A.',
    
  },
  {
    code: '700',
    name: 'MW INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/700.svg',
    type: 'Banco',
    ispb: '53822116',
    shortName: 'MW IP LTDA.',
    
  },
  {
    code: '701',
    name: 'INTEGRAÇÃO DE CRÉDITO E COBRANÇA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/701.svg',
    type: 'Outros',
    ispb: '51118615',
    shortName: 'INTEGRAÇÃO DE CRÉDITO E COBRANÇA SCD',
    
  },
  {
    code: '703',
    name: 'GETNET ADQUIRÊNCIA E SERVIÇOS PARA MEIOS DE PAGAMENTO S.A. INSTITUIÇÃO DE PAGAMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/703.svg',
    type: 'Banco',
    ispb: '10440482',
    shortName: 'GETNET IP',
    
  },
  {
    code: '704',
    name: 'FEATBANK INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/704.svg',
    type: 'Banco',
    ispb: '44663846',
    shortName: 'FEATBANK IP LTDA',
    
  },
  {
    code: '707',
    name: 'Banco Daycoval S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/707.svg',
    type: 'Banco',
    ispb: '62232889',
    shortName: 'BCO DAYCOVAL S.A',
    url: 'https://www.daycoval.com.br',
  },
  {
    code: '708',
    name: 'BANCO INDUSCRED DE INVESTIMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/708.svg',
    type: 'Banco',
    ispb: '33588252',
    shortName: 'BCO INDUSCRED DE INVESTIM. S/A',
    
  },
  {
    code: '712',
    name: 'OURIBANK S.A. BANCO MÚLTIPLO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/712.svg',
    type: 'Banco',
    ispb: '78632767',
    shortName: 'OURIBANK S.A.',
    url: 'https://www.ourinvest.com.br',
  },
  {
    code: '714',
    name: 'FINAMAX S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/714.svg',
    type: 'Banco',
    ispb: '00411939',
    shortName: 'FINAMAX S.A. CFI',
    
  },
  {
    code: '719',
    name: 'BANCO MASTER MÚLTIPLO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/719.svg',
    type: 'Banco',
    ispb: '33884941',
    shortName: 'BANCO MASTER MÚLTIPLO',
    
  },
  {
    code: '720',
    name: 'BANCO RNX S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/720.svg',
    type: 'Banco',
    ispb: '80271455',
    shortName: 'BCO RNX S.A.',
    url: 'https://www.bancornx.com.br/',
  },
  {
    code: '739',
    name: 'Banco Cetelem S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/739.svg',
    type: 'Banco',
    ispb: '00558456',
    shortName: 'BCO CETELEM S.A.',
    url: 'https://www.cetelem.com.br',
  },
  {
    code: '741',
    name: 'BANCO RIBEIRAO PRETO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/741.svg',
    type: 'Banco',
    ispb: '00517645',
    shortName: 'BCO RIBEIRAO PRETO S.A.',
    url: 'https://www.brp.com.br',
  },
  {
    code: '743',
    name: 'Banco Semear S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/743.svg',
    type: 'Banco',
    ispb: '00795423',
    shortName: 'BANCO SEMEAR',
    url: 'https://www.bancosemear.com.br',
  },
  {
    code: '745',
    name: 'Banco Citibank S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/745.svg',
    type: 'Banco',
    ispb: '33479023',
    shortName: 'BCO CITIBANK S.A.',
    url: 'https://www.citibank.com.br',
  },
  {
    code: '746',
    name: 'Banco Modal S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/746.svg',
    type: 'Banco',
    ispb: '30723886',
    shortName: 'BCO MODAL S.A.',
    
  },
  {
    code: '747',
    name: 'Banco Rabobank International Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/747.svg',
    type: 'Banco',
    ispb: '01023570',
    shortName: 'BCO RABOBANK INTL BRASIL S.A.',
    url: 'https://www.rabobank.com.br',
  },
  {
    code: '748',
    name: 'BANCO COOPERATIVO SICREDI S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/748.svg',
    type: 'Cooperativa',
    ispb: '01181521',
    shortName: 'BCO COOPERATIVO SICREDI S.A.',
    url: 'https://www.sicredi.com.br',
  },
  {
    code: '751',
    name: 'Scotiabank Brasil S.A. Banco Múltiplo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/751.svg',
    type: 'Banco',
    ispb: '29030467',
    shortName: 'SCOTIABANK BRASIL',
    url: 'https://www.br.scotiabank.com',
  },
  {
    code: '752',
    name: 'Banco BNP Paribas Brasil S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/752.svg',
    type: 'Banco',
    ispb: '01522368',
    shortName: 'BCO BNP PARIBAS BRASIL S A',
    url: 'https://www.bnpparibas.com.br',
  },
  {
    code: '753',
    name: 'Novo Banco Continental S.A. - Banco Múltiplo',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/753.svg',
    type: 'Banco',
    ispb: '74828799',
    shortName: 'NOVO BCO CONTINENTAL S.A. - BM',
    url: 'https://www.nbcbank.com.br',
  },
  {
    code: '754',
    name: 'Banco Sistema S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/754.svg',
    type: 'Banco',
    ispb: '76543115',
    shortName: 'BANCO SISTEMA',
    url: 'https://www.btgpactual.com',
  },
  {
    code: '755',
    name: 'Bank of America Merrill Lynch Banco Múltiplo S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/755.svg',
    type: 'Banco',
    ispb: '62073200',
    shortName: 'BOFA MERRILL LYNCH BM S.A.',
    url: 'https://www.ml.com',
  },
  {
    code: '756',
    name: 'BANCO COOPERATIVO SICOOB S.A. - BANCO SICOOB',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/756.svg',
    type: 'Cooperativa',
    ispb: '02038232',
    shortName: 'BANCO SICOOB S.A.',
    url: 'https://www.bancoob.com.br',
  },
  {
    code: '757',
    name: 'BANCO KEB HANA DO BRASIL S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/757.svg',
    type: 'Banco',
    ispb: '02318507',
    shortName: 'BCO KEB HANA DO BRASIL S.A.',
    
  },
  {
    code: '759',
    name: 'BANSUR JM SOCIEDADE DE CRÉDITO DIRETO S/A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/759.svg',
    type: 'Outros',
    ispb: '42963742',
    shortName: 'BANSUR JM SCD S.A.',
    
  },
  {
    code: '760',
    name: 'EMCASH SERVIÇOS FINANCEIROS SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/760.svg',
    type: 'Banco',
    ispb: '34139916',
    shortName: 'EMCASH SERV FINANC SEP S.A.',
    
  },
  {
    code: '761',
    name: 'URBANO S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/761.svg',
    type: 'Outros',
    ispb: '53842122',
    shortName: 'URBANO S.A. SCFI',
    
  },
  {
    code: '762',
    name: 'OPPENS SOCIEDADE DE EMPRESTIMO ENTRE PESSOAS S.A',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/762.svg',
    type: 'Banco',
    ispb: '44064068',
    shortName: 'OPPENS SEP S.A.',
    
  },
  {
    code: '763',
    name: 'VUE INSTITUIÇÃO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/763.svg',
    type: 'Banco',
    ispb: '56106523',
    shortName: 'VUE IP S.A.',
    
  },
  {
    code: '764',
    name: 'INDEPENDÊNCIA COOPERATIVA DE CRÉDITO E INVESTIMENTO - INDEPENDÊNCIA COOPERATIVA DE CRÉDITO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/764.svg',
    type: 'Cooperativa',
    ispb: '04306351',
    shortName: 'INDEPENDÊNCIA CC',
    
  },
  {
    code: '766',
    name: 'LB PAY INSTITUIÇÃO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/766.svg',
    type: 'Banco',
    ispb: '52833288',
    shortName: 'LB PAY IP LTDA',
    
  },
  {
    code: '767',
    name: 'QORE DISTRIBUIDORA DE TITULOS E VALORES MOBILIÁRIOS LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/767.svg',
    type: 'Outros',
    ispb: '62264924',
    shortName: 'QORE',
    
  },
  {
    code: '768',
    name: 'BECKER FINANCEIRA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/768.svg',
    type: 'Banco',
    ispb: '20443996',
    shortName: 'BECKER FINANCEIRA SA - CFI',
    
  },
  {
    code: '769',
    name: '99PAY INSTITUICAO DE PAGAMENTO S.A.',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/769.svg',
    type: 'Banco',
    ispb: '24313102',
    shortName: '99PAY IP S.A.',
    
  },
  {
    code: '771',
    name: 'WX INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/771.svg',
    type: 'Banco',
    ispb: '57824223',
    shortName: 'WX IP LTDA.',
    
  },
  {
    code: '772',
    name: 'COOPERATIVA DE CRÉDITO MÚTUO DOS EMPREGADOS DO CENTRO UNIVERSITÁRIO NEWTON PAIVA LTDA. - CREDIPAIVA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/772.svg',
    type: 'Cooperativa',
    ispb: '20833992',
    shortName: 'CC MECUNP',
    
  },
  {
    code: '773',
    name: 'KIWIFY INSTITUICAO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/773.svg',
    type: 'Banco',
    ispb: '53908413',
    shortName: 'KIWIFY IP',
    
  },
  {
    code: '790',
    name: 'MAX INSTITUIÇÃO DE PAGAMENTO LTDA',
    logo: 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/790.svg',
    type: 'Banco',
    ispb: '54024532',
    shortName: 'MAX IP',
    
  }
];

// Função para buscar bancos por nome ou código
export const searchBanks = (query: string): Bank[] => {
  if (!query.trim()) return brazilianBanks;
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return brazilianBanks.filter(bank => 
    bank.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery) ||
    bank.code.includes(normalizedQuery) ||
    bank.type.toLowerCase().includes(normalizedQuery) ||
    (bank.shortName && bank.shortName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery))
  );
};
















