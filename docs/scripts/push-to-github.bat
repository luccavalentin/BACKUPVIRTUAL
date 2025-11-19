@echo off
echo ========================================
echo   Push para GitHub - Sistema VANDE
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Inicializando repositorio Git...
git init
if errorlevel 1 goto error

echo [2/7] Configurando usuario Git...
git config user.name "luccavalentin"
git config user.email "luccasantana88@gmail.com"

echo [3/7] Configurando remote do GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/luccavalentin/BACKUPVIRTUAL.git

echo [4/7] Adicionando arquivos...
git add .

echo [5/7] Fazendo commit...
git commit -m "Initial commit: Sistema de Gestao VANDE com melhorias de UX"
if errorlevel 1 (
    echo Nenhuma mudanca para commitar ou commit ja existe
)

echo [6/7] Configurando branch main...
git branch -M main 2>nul

echo [7/7] Fazendo push para o GitHub...
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ERRO ao fazer push!
    echo Verifique se o Git esta instalado e configurado corretamente.
    pause
    goto end
)

echo.
echo ========================================
echo   Push realizado com SUCESSO!
echo ========================================
echo.
echo Repositorio: https://github.com/luccavalentin/BACKUPVIRTUAL
echo.
pause
goto end

:error
echo.
echo ERRO: Git nao encontrado ou nao esta no PATH!
echo Por favor, instale o Git ou execute em um terminal onde o Git funciona.
echo.
pause

:end

