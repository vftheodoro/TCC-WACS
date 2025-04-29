#!/bin/bash

# Script para configurar o ambiente de desenvolvimento do WACS
echo "Configurando ambiente de desenvolvimento WACS..."

# Verificar se o arquivo env-config.js existe e removê-lo (para evitar commit acidental)
if [ -f "public/js/env-config.js" ]; then
  echo "Removendo arquivo env-config.js existente por segurança..."
  rm public/js/env-config.js
fi

# Copiar o arquivo de exemplo para o local correto
echo "Criando arquivo env-config.js a partir do modelo..."
cp public/js/env-config.example.js public/js/env-config.js

# Alertar ao usuário para editar o arquivo
echo ""
echo "IMPORTANTE: Edite o arquivo public/js/env-config.js e substitua os valores de exemplo pelas suas próprias chaves!"
echo ""
echo "O arquivo foi configurado para ser ignorado pelo Git, então suas chaves não serão compartilhadas."
echo ""

# Verificar se o Git está inicializado
if [ -d ".git" ] || git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  # Verificar se os arquivos sensíveis estão sendo ignorados corretamente
  echo "Verificando configuração do .gitignore..."
  
  if git check-ignore public/js/env-config.js > /dev/null 2>&1; then
    echo "✅ Arquivo env-config.js está sendo ignorado pelo Git corretamente."
  else
    echo "⚠️ ATENÇÃO: O arquivo env-config.js não está sendo ignorado pelo Git!"
    echo "Por favor, verifique seu arquivo .gitignore e adicione a seguinte linha:"
    echo "public/js/env-config.js"
  fi
  
  echo ""
  echo "Configuração concluída!"
else
  echo "Repositório Git não encontrado. Execute este script novamente após inicializar o Git, se necessário."
  echo "Configuração concluída!"
fi 