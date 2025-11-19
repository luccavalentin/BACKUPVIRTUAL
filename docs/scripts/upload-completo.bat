@echo off
chcp 65001 >nul
echo ========================================
echo   Upload COMPLETO para GitHub
echo   Sistema de Gestão VANDE
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Git não encontrado!
    echo Por favor, instale o Git ou execute em um terminal onde o Git funciona.
    pause
    exit /b 1
)

echo [2] Inicializando repositório...
if not exist .git (
    git init
    echo Repositório inicializado.
) else (
    echo Repositório já existe.
)

echo [3] Configurando usuário...
git config user.name "luccavalentin"
git config user.email "luccasantana88@gmail.com"

echo [4] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/luccavalentin/BACKUPVIRTUAL.git
echo Remote configurado.

echo [5] Adicionando TODOS os arquivos da pasta...
git add -A
echo Arquivos adicionados.

echo [6] Verificando status...
git status --short
echo.

echo [7] Fazendo commit...
git commit -m "Initial commit: Sistema de Gestão VANDE completo com todas as melhorias de UX" 2>nul
if errorlevel 1 (
    echo Verificando se já existe commit...
    git log --oneline -1 >nul 2>&1
    if errorlevel 1 (
        echo Criando commit inicial...
        echo. > .gitkeep
        git add .gitkeep
        git commit -m "Initial commit: Sistema de Gestão VANDE"
        del .gitkeep
        git add -A
        git commit -m "Sistema de Gestão VANDE completo com todas as melhorias de UX"
    ) else (
        echo Commit já existe, continuando...
    )
)

echo [8] Configurando branch main...
git branch -M main 2>nul

echo [9] Fazendo push para o GitHub...
echo Isso pode pedir suas credenciais do GitHub...
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ========================================
    echo   ERRO ao fazer push!
    echo ========================================
    echo.
    echo Possíveis causas:
    echo - Credenciais do GitHub não configuradas
    echo - Repositório não existe ou sem permissão
    echo - Problema de conexão
    echo.
    echo Tente configurar suas credenciais:
    echo git config --global credential.helper wincred
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ UPLOAD REALIZADO COM SUCESSO!
echo ========================================
echo.
echo 📦 Repositório: https://github.com/luccavalentin/BACKUPVIRTUAL
echo.
echo Todos os arquivos da pasta foram enviados!
echo.
pause

