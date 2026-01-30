# Sistema de Avaliação de Locais Acessíveis - WACS

## Visão Geral

O sistema de avaliação de locais acessíveis permite que usuários logados avaliem e comentem sobre a acessibilidade de diferentes locais, contribuindo para a comunidade WACS. **Agora com modal integrado!**

## Funcionalidades

### 1. Modal de Avaliação Integrado

- **Acesso Direto**: Modal que abre na mesma página, sem redirecionamento
- **Preenchimento Automático**: Dados do local são automaticamente preenchidos
- **Campo Nome Bloqueado**: Quando um local específico é selecionado, o nome fica somente leitura
- **Interface Intuitiva**: Formulário completo com sistema de estrelas interativo
- **Validação em Tempo Real**: Feedback imediato para o usuário

### 2. Integração com Mapa Acessível

- **Botão Geral**: Botão "Avaliar Local" na página de mapa acessível
- **Botões Individuais**: Cada card de local possui seu próprio botão de avaliação
- **Preenchimento Automático**: Os dados do local são automaticamente preenchidos no modal

### 3. Sistema de Avaliação

#### Campos do Formulário:
- **Nome do Local**: Nome do estabelecimento
- **Endereço**: Endereço completo
- **Tipo de Local**: Shopping, Restaurante, Parque, Teatro, Hospital, Escola
- **Avaliação Geral**: Sistema de 5 estrelas interativo
- **Recursos de Acessibilidade**:
  - Rampas de acesso
  - Elevadores
  - Sinalização em Braile
  - Intérprete de Libras
  - Banheiro adaptado
  - Estacionamento para PCD
- **Comentários**: Descrição detalhada da experiência

## Como Usar

### Para Usuários:

1. **Avaliar um Local Específico**:
   - Na página de mapa acessível, clique no botão "Avaliar Local" de qualquer card
   - O modal abrirá com os dados do local preenchidos automaticamente
   - **O nome do local ficará bloqueado (somente leitura)** para evitar alterações
   - Complete os demais campos e envie

2. **Avaliação Geral**:
   - Clique no botão "Avaliar Local" na parte superior da página
   - O modal abrirá com formulário em branco
   - **Todos os campos estarão editáveis**, incluindo o nome do local
   - Preencha todos os campos e envie

3. **Gerenciar Avaliações** (Dashboard):
   - Acesse Dashboard > Avaliações para ver todas as avaliações
   - Use filtros para encontrar avaliações específicas
   - Edite ou exclua suas avaliações

### Para Administradores:

1. **Gerenciar Avaliações**:
   - Acesse a página de avaliações no dashboard
   - Visualize todas as avaliações feitas pelos usuários
   - Use os filtros para encontrar avaliações específicas
   - Edite ou exclua avaliações conforme necessário

## Vantagens do Modal

### ✅ **Experiência do Usuário Melhorada**:
- **Sem Redirecionamento**: Usuário permanece na mesma página
- **Acesso Rápido**: Modal abre instantaneamente
- **Preenchimento Automático**: Dados do local são inseridos automaticamente
- **Feedback Imediato**: Confirmação visual após envio

### ✅ **Interface Responsiva**:
- **Mobile-Friendly**: Modal se adapta a diferentes tamanhos de tela
- **Animações Suaves**: Transições elegantes de abertura e fechamento
- **Sistema de Estrelas Interativo**: Hover effects e seleção visual

### ✅ **Funcionalidades Avançadas**:
- **Validação em Tempo Real**: Verificação de campos obrigatórios
- **Sistema de Estrelas**: Interface intuitiva para avaliação
- **Salvamento Automático**: Dados são salvos no Firebase Firestore
- **Fechamento Inteligente**: Modal fecha automaticamente após sucesso
- **Campo Nome Inteligente**: Bloqueado quando local específico é selecionado
- **Indicadores Visuais**: Campo somente leitura tem aparência diferenciada

## Estrutura de Dados

### Collection: `location_evaluations`

```javascript
{
  locationName: "Nome do Local",
  locationAddress: "Endereço Completo",
  locationType: "tipo_do_local",
  rating: 5, // 1-5
  features: ["rampa", "elevador", "braile"], // Array de recursos
  comments: "Comentários detalhados",
  createdAt: Timestamp,
  userId: "user_id",
  userName: "Nome do Usuário"
}
```

## Navegação

### Acesso ao Sistema:
- **Mapa Acessível**: Botão "Avaliar Local" geral e individual
- **Dashboard**: Link "Avaliações" para gerenciamento completo
- **Modal Integrado**: Acesso direto sem sair da página

## Segurança

- **Autenticação Obrigatória**: Apenas usuários logados podem avaliar
- **Validação de Dados**: Todos os campos obrigatórios são validados
- **Controle de Acesso**: Usuários só podem editar/excluir suas próprias avaliações

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Firestore
- **Autenticação**: Firebase Auth
- **UI Framework**: Tailwind CSS
- **Ícones**: Font Awesome
- **Animações**: CSS3 Transitions e Keyframes

## Próximas Melhorias

1. **Sistema de Moderação**: Aprovação de avaliações por administradores
2. **Fotos**: Upload de fotos dos locais
3. **Notificações**: Alertas para novas avaliações
4. **Relatórios**: Estatísticas de avaliações
5. **API**: Endpoints para integração com outros sistemas
6. **Avaliações em Tempo Real**: Atualização automática das avaliações na página