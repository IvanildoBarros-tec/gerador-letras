@echo off
title Gerador de Letras - Suno AI
color 0A

echo ========================================
echo   GERADOR DE LETRAS DE MUSICA
echo   Powered by Suno AI
echo ========================================
echo.

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit
)

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias pela primeira vez...
    npm install
)

echo.
echo Iniciando o servidor...
echo O navegador sera aberto automaticamente.
echo.
echo Pressione Ctrl+C para parar o servidor.
echo ========================================
echo.

start http://localhost:5173
npm run dev