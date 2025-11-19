/**
 * Script para gerar ícones PWA a partir do logo SVG
 * 
 * Requisitos:
 * - Node.js instalado
 * - Executar: npm install sharp --save-dev
 * - Executar: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Verifica se o arquivo SVG existe
if (!fs.existsSync(inputSvg)) {
  console.error('❌ Arquivo logo.svg não encontrado em public/logo.svg');
  console.log('💡 Certifique-se de que o arquivo existe antes de executar este script.');
  process.exit(1);
}

// Cor primária do sistema (azul #1e3a8a)
const PRIMARY_COLOR = { r: 30, g: 58, b: 138, alpha: 1 };

// Cria diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Diretório public/icons/ criado');
}

console.log('🎨 Gerando ícones PWA...\n');

// Gera ícones para cada tamanho
Promise.all(
  sizes.map(size => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    return sharp(inputSvg)
      .resize(size, size, {
        fit: 'contain',
        background: PRIMARY_COLOR // Cor primária do sistema #1e3a8a
      })
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Ícone ${size}x${size} gerado: ${outputPath}`);
      })
      .catch(err => {
        console.error(`❌ Erro ao gerar ${size}x${size}:`, err.message);
      });
  })
)
.then(() => {
  console.log('\n✨ Todos os ícones foram gerados com sucesso!');
  console.log('📁 Localização: public/icons/');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Verifique se os ícones foram criados corretamente');
  console.log('   2. Teste o PWA no navegador (DevTools > Application > Manifest)');
  console.log('   3. Teste a instalação em dispositivos móveis');
})
.catch(err => {
  console.error('\n❌ Erro ao gerar ícones:', err);
  process.exit(1);
});

