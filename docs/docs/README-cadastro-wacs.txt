# Documentação do Sistema de Cadastro WACS (register.html)

Este documento descreve o funcionamento, opções e lógica do sistema de cadastro de usuários da plataforma WACS, implementado em `views/user/register.html`.

---

## 1. Estrutura Geral
O cadastro é dividido em duas etapas principais:
- **Etapa 1:** Dados básicos (username, e-mail, senha, confirmação, nome completo)
- **Etapa 2:** Dados complementares (data de nascimento, estado, cidade, tipo de mobilidade, comorbidades, foto de perfil, aceite dos termos)

A navegação entre etapas é controlada por botões "Próxima etapa" e "Voltar".

---

## 2. Campos e Opções

### 2.1. Username
- Identificador público único.
- Máximo de 32 caracteres.

### 2.2. E-mail
- Usado para login e recuperação de conta.
- Validação de formato.

### 2.3. Senha e Confirmação
- Mínimo de 6 caracteres.
- Exige confirmação idêntica.
- Possui botão para mostrar/ocultar senha.

### 2.4. Nome Completo
- Máximo de 64 caracteres.

### 2.5. Data de Nascimento
- Campo tipo `date`.

### 2.6. Estado e Cidade
- **Estado:**
  - Select estilizado, sempre menor que o campo de cidade.
  - Lista de UFs do Brasil.
  - No tema claro: fundo branco/letras pretas. No escuro: fundo escuro/letras brancas.
- **Cidade:**
  - Autocomplete: só habilita após selecionar o estado.
  - Sugere cidades do estado selecionado enquanto digita.
  - Dropdown de sugestões estilizado, com fundo sólido (claro/escuro conforme tema).
  - Seleção via mouse ou teclado (setas/enter).

### 2.7. Tipo de Mobilidade
- Picker customizado (dropdown estilizado).
- Opções:
  - Cadeira de rodas
  - Andador
  - Muleta
  - Deficiência visual
  - Deficiência auditiva
  - Outra
  - Nenhuma
- Ícones para cada opção.
- Visual padronizado com inputs (altura, borda, radius, fonte, cor de fundo/texto conforme tema).

### 2.8. Comorbidades / Necessidades Especiais
- Multi-select customizado (dropdown com chips).
- Opções:
  - Diabetes
  - Hipertensão
  - Doença cardiovascular
  - Problemas respiratórios
  - Outro
  - Nenhuma
- Chips removíveis para cada seleção.
- Dropdown estilizado, fundo sólido, responsivo ao tema.

### 2.9. Foto de Perfil
- Upload de imagem (opcional).
- Avatar circular com pré-visualização.
- Botão de upload destacado.

### 2.10. Aceite dos Termos
- Checkbox obrigatório.
- Link para tela de Termos de Uso.

---

## 3. Temas e Acessibilidade
- Todos os campos, dropdowns e pickers se adaptam ao tema claro/escuro.
- Contraste garantido para texto e fundo em ambos os temas.
- Inputs, selects e dropdowns seguem o mesmo padrão visual (altura, borda, radius, fonte, sombra).
- Navegação por teclado suportada nos autocompletes e pickers.

---

## 4. Validações
- Todos os campos obrigatórios são validados antes de avançar ou submeter.
- Senhas devem coincidir.
- Cidade só pode ser preenchida após selecionar o estado.
- Não é possível selecionar a mesma comorbidade mais de uma vez.
- Aceite dos termos é obrigatório.

---

## 5. Observações para Desenvolvedores
- O código JS está embutido no próprio HTML para facilitar manutenção.
- A lista de cidades está no front-end, mas pode ser migrada para API futuramente.
- O padrão visual é centralizado em CSS, facilitando ajustes globais.
- Para adicionar novas opções (mobilidade, comorbidades, cidades), basta editar os arrays correspondentes.
- O sistema é responsivo e acessível.

---

## 6. Fluxo de Cadastro
1. Usuário preenche dados básicos e avança.
2. Preenche dados complementares, aceita os termos e envia.
3. Validações são feitas em cada etapa.
4. Após sucesso, segue para o fluxo de autenticação definido pelo backend.

---

**Dúvidas ou manutenção:**
Consulte este arquivo antes de alterar o fluxo ou as opções do cadastro. Para dúvidas técnicas, procure o responsável pelo front-end do WACS. 