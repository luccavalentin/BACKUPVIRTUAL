// Validação e formatação de CPF
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "");
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
};

// Validação e formatação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, "");
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "");
  if (numbers.length <= 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
};

// Validação e formatação de Telefone
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "");
  
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
};

export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/[^\d]/g, "");
  return numbers.length === 10 || numbers.length === 11;
};

// Validação e formatação de CEP
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "");
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return value;
};

export const validateCEP = (cep: string): boolean => {
  const numbers = cep.replace(/[^\d]/g, "");
  return numbers.length === 8;
};

// Buscar endereço por CEP usando ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  const cleanCEP = cep.replace(/[^\d]/g, "");
  
  if (cleanCEP.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};

// Capitalização seguindo diretrizes
export const capitalizePersonName = (name: string): string => {
  if (!name) return name;
  
  // Lista de preposições e artigos que devem ficar em minúscula
  const exceptions = ["de", "da", "do", "dos", "das", "e"];
  
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      // Primeira palavra sempre maiúscula
      if (index === 0 || !exceptions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
};

export const capitalizeCategory = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Para empresas e imóveis, manter grafia original
export const preserveOriginal = (text: string): string => {
  return text;
};

// Formatação de moeda (BRL)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Formatação de moeda para input (sem símbolo R$)
export const formatCurrencyInput = (value: string | number): string => {
  if (!value) return "";
  const numValue = typeof value === "string" ? parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", ".")) : value;
  if (isNaN(numValue)) return "";
  
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

// Remove formatação e converte para número
export const parseCurrency = (value: string): number | null => {
  if (!value) return null;
  // Remove tudo exceto números, vírgula e ponto
  let cleaned = value.replace(/[^\d,.-]/g, "");
  
  // Detecta formato brasileiro (ponto como milhar, vírgula como decimal)
  // Ex: "100.000,00" ou "100000,00" ou "100000.00"
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  
  if (hasComma && hasDot) {
    // Formato brasileiro: "100.000,00"
    // Remove pontos (separadores de milhar) e substitui vírgula por ponto
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    // Formato: "100000,00" - só tem vírgula decimal
    cleaned = cleaned.replace(",", ".");
  } else if (!hasComma && hasDot) {
    // Pode ser formato americano "100000.00" ou formato brasileiro sem decimais "100.000"
    // Se tem mais de 3 dígitos após o último ponto, provavelmente é formato brasileiro sem decimais
    const parts = cleaned.split(".");
    if (parts.length > 1 && parts[parts.length - 1].length <= 2) {
      // Última parte tem 1-2 dígitos, provavelmente são decimais
      // Mantém como está (formato americano)
    } else {
      // Remove pontos (separadores de milhar brasileiro)
      cleaned = cleaned.replace(/\./g, "");
    }
  }
  // Se não tem nem vírgula nem ponto, já está pronto
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

// Formata valor enquanto digita (máscara de moeda)
// Só aplica a máscara se o valor não estiver já formatado
export const formatCurrencyOnInput = (value: string): string => {
  if (!value) return "";
  
  // Se já está formatado (tem vírgula ou ponto como separador de milhar), retorna como está
  if (value.includes(",") && (value.match(/\./g) || []).length > 0) {
    // Já está formatado, apenas limpa e reformata para garantir consistência
    const parsed = parseCurrency(value);
    if (parsed !== null) {
      return formatCurrencyInput(parsed);
    }
    return value;
  }
  
  // Se não está formatado, remove tudo exceto números
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  
  // Se tem menos de 3 dígitos, assume que são centavos
  if (numbers.length <= 2) {
    const numValue = parseFloat(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }
  
  // Se tem 3 ou mais dígitos, trata como valor completo (sem dividir por 100)
  const numValue = parseFloat(numbers) / 100;
  
  // Formata com 2 casas decimais
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

// Padronização de texto: primeira letra de cada palavra maiúscula, resto minúsculo
// Siglas de estado brasileiras são totalmente maiúsculas (SP, RJ, MG, etc)
export const standardizeText = (text: string): string => {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  
  // Lista de siglas de estado brasileiras (devem ser totalmente maiúsculas)
  const stateAbbreviations = new Set([
    "ac", "al", "am", "ap", "ba", "ce", "df", "es", "go", "ma", "mg", "ms",
    "mt", "pa", "pb", "pe", "pi", "pr", "rj", "rn", "ro", "rr", "rs", "sc",
    "se", "sp", "to"
  ]);
  
  // Divide por espaços (um ou mais) e capitaliza cada palavra
  // Mantém os espaços entre as palavras
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      
      // Se a palavra contém hífen, processa cada parte
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => {
            if (!part) return part;
            const lowerPart = part.toLowerCase();
            // Se for sigla de estado, deixa totalmente maiúscula
            if (stateAbbreviations.has(lowerPart)) {
              return part.toUpperCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }
      
      // Verifica se é sigla de estado
      const lowerWord = word.toLowerCase();
      if (stateAbbreviations.has(lowerWord)) {
        return word.toUpperCase(); // Sigla de estado totalmente maiúscula
      }
      
      // Capitaliza a primeira letra e deixa o resto minúsculo
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

// Handler para aplicar padronização automaticamente em inputs de texto
// Usar no onBlur para aplicar quando o campo perde o foco
export const handleStandardizeInput = (
  value: string,
  setValue: (value: string) => void
) => {
  if (value && typeof value === "string" && value.trim()) {
    const standardized = standardizeText(value);
    setValue(standardized);
  } else if (!value || !value.trim()) {
    // Se o valor estiver vazio, limpa o campo
    setValue("");
  }
};
