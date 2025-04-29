@echo off
echo Configurando ambiente de desenvolvimento WACS...

REM Verificar se o arquivo env-config.js existe e removê-lo (para evitar commit acidental)
if exist public\js\env-config.js (
  echo Removendo arquivo env-config.js existente por segurança...
  del public\js\env-config.js
)

REM Copiar o arquivo de exemplo para o local correto
echo Criando arquivo env-config.js a partir do modelo...
copy public\js\env-config.example.js public\js\env-config.js

echo.
echo IMPORTANTE: Edite o arquivo public\js\env-config.js e substitua os valores de exemplo pelas suas próprias chaves!
echo.
echo O arquivo foi configurado para ser ignorado pelo Git, então suas chaves não serão compartilhadas.
echo.

REM Verificar se o Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Git não encontrado. Algumas verificações serão puladas.
  goto :SkipGitChecks
)

REM Verificar se o Git está inicializado
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Repositório Git não encontrado. Execute este script novamente após inicializar o Git, se necessário.
  goto :SkipGitChecks
)

echo Verificando configuração do .gitignore...
git check-ignore public\js\env-config.js >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo ✓ Arquivo env-config.js está sendo ignorado pelo Git corretamente.
) else (
  echo ⚠️ ATENÇÃO: O arquivo env-config.js não está sendo ignorado pelo Git!
  echo Por favor, verifique seu arquivo .gitignore e adicione a seguinte linha:
  echo public/js/env-config.js
)

:SkipGitChecks
echo.
echo Configuração concluída!
pause 