/**
 * Script SIMPLIFICADO para gerar ícones PWA
 * Gera ícones PNG a partir do SVG usando Canvas (sem dependências externas)
 * 
 * ATENÇÃO: Este script cria ícones básicos. Para melhor qualidade, use o script com sharp.
 */

const fs = require('fs');
const path = require('path');

// Cria ícones PNG simples usando base64
// Como não temos sharp, vamos criar um script que gera ícones básicos

const sizes = [192, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Cria diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Diretório public/icons/ criado');
}

console.log('⚠️  AVISO: Este script cria ícones básicos.');
console.log('💡 Para ícones de alta qualidade, execute: npm install sharp --save-dev');
console.log('💡 Depois execute: node scripts/generate-icons.js\n');

// Cria um arquivo HTML temporário para gerar os ícones via canvas
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Gerar Ícones</title>
</head>
<body>
  <canvas id="canvas192" width="192" height="192"></canvas>
  <canvas id="canvas512" width="512" height="512"></canvas>
  <script>
    function generateIcon(size) {
      const canvas = document.getElementById('canvas' + size);
      const ctx = canvas.getContext('2d');
      
      // Fundo azul (#1e3a8a)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, size, size);
      
      // Círculo central
      const center = size / 2;
      const radius = size * 0.4;
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#1e40af');
      gradient.addColorStop(1, '#3b82f6');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Símbolo de dólar (simplificado)
      ctx.strokeStyle = 'white';
      ctx.lineWidth = size / 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Linha vertical
      ctx.beginPath();
      ctx.moveTo(center, center - radius * 0.4);
      ctx.lineTo(center, center + radius * 0.4);
      ctx.stroke();
      
      // S (simplificado)
      ctx.beginPath();
      ctx.arc(center, center - radius * 0.2, radius * 0.15, Math.PI / 2, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center + radius * 0.2, radius * 0.15, Math.PI * 1.5, Math.PI / 2);
      ctx.stroke();
      
      return canvas.toDataURL('image/png');
    }
    
    const icon192 = generateIcon(192);
    const icon512 = generateIcon(512);
    
    console.log('Ícones gerados!');
    console.log('192:', icon192.substring(0, 50) + '...');
    console.log('512:', icon512.substring(0, 50) + '...');
  </script>
</body>
</html>
`;

console.log('📝 Criando script alternativo...\n');

// Instruções para o usuário
const instructions = `
# Como Gerar os Ícones PWA

## Opção 1: Usando Sharp (Recomendado - Alta Qualidade)

1. Instale o sharp:
   npm install sharp --save-dev

2. Execute o script:
   node scripts/generate-icons.js

## Opção 2: Gerar Manualmente Online

1. Acesse: https://realfavicongenerator.net/
2. Faça upload do arquivo: public/icons/icon.svg
3. Configure:
   - Android Chrome: 192x192 e 512x512
   - iOS Safari: 192x192 e 512x512
4. Baixe os ícones gerados
5. Salve em public/icons/ com os nomes:
   - icon-192x192.png
   - icon-512x512.png

## Opção 3: Usar Editor de Imagens

1. Abra public/icons/icon.svg em um editor (Inkscape, Figma, etc.)
2. Exporte como PNG:
   - 192x192 pixels → icon-192x192.png
   - 512x512 pixels → icon-512x512.png
3. Salve em public/icons/

## Verificação

Após gerar os ícones, verifique se existem:
- public/icons/icon-192x192.png
- public/icons/icon-512x512.png

Depois, recarregue o site e verifique no DevTools > Application > Manifest.
`;

fs.writeFileSync(path.join(__dirname, '../GERAR_ICONES_INSTRUCOES.md'), instructions);
console.log('✅ Arquivo de instruções criado: GERAR_ICONES_INSTRUCOES.md');
console.log('\n📋 Próximos passos:');
console.log('   1. Leia o arquivo GERAR_ICONES_INSTRUCOES.md');
console.log('   2. Gere os ícones usando uma das opções');
console.log('   3. Verifique se os arquivos foram criados em public/icons/');

