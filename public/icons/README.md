# Ícones PWA

Esta pasta deve conter os ícones do PWA.

## Arquivos Necessários:

- `icon-192x192.png` - Ícone 192x192 pixels
- `icon-512x512.png` - Ícone 512x512 pixels

## Como Gerar os Ícones:

### Opção 1: Script Automático (Recomendado)
```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

### Opção 2: Manual
1. Abra `public/logo.svg` em um editor de imagens
2. Exporte como PNG nos tamanhos 192x192 e 512x512
3. Salve nesta pasta com os nomes acima

### Opção 3: Online
- Use https://realfavicongenerator.net/
- Faça upload do logo.svg
- Baixe os ícones gerados
- Coloque nesta pasta

## Requisitos:
- Formato: PNG
- Tamanhos: Exatamente 192x192 e 512x512 pixels
- Fundo: Transparente ou cor primária (#1e3a8a)
- Qualidade: Alta resolução

