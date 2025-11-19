# Script para fazer push do código para o GitHub
# Execute este script no PowerShell onde o Git funciona

Write-Host "🚀 Iniciando push para o GitHub..." -ForegroundColor Green

# Navegar para a pasta do projeto
Set-Location $PSScriptRoot

# 1. Inicializar repositório Git (se não estiver inicializado)
if (-not (Test-Path .git)) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Repositório Git já inicializado" -ForegroundColor Green
}

# 2. Configurar usuário (apenas se não estiver configurado globalmente)
Write-Host "👤 Configurando usuário Git..." -ForegroundColor Yellow
git config user.name "luccavalentin"
git config user.email "luccasantana88@gmail.com"

# 3. Adicionar remote (remove se já existir e adiciona novamente)
Write-Host "🔗 Configurando remote do GitHub..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/luccavalentin/BACKUPVIRTUAL.git

# 4. Adicionar todos os arquivos
Write-Host "📝 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# 5. Fazer commit
Write-Host "💾 Fazendo commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Sistema de Gestão VANDE com melhorias de UX" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma mudança para commitar ou commit já existe" -ForegroundColor Yellow
}

# 6. Renomear branch para main
Write-Host "🌿 Configurando branch main..." -ForegroundColor Yellow
git branch -M main 2>$null

# 7. Fazer push para o GitHub
Write-Host "⬆️  Fazendo push para o GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host "🔗 Repositório: https://github.com/luccavalentin/BACKUPVIRTUAL" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro ao fazer push. Verifique as mensagens acima." -ForegroundColor Red
}

