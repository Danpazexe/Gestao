# 📱 App de Gestão de Produtos e Validade

<p align="center">
  <img src="./assets/Image/LOGO1024.png" width="200" alt="Logo do App">
</p>

Um aplicativo móvel completo para gestão de produtos e controle de validade, desenvolvido com React Native e Expo. Ideal para empresas que precisam gerenciar seu estoque e monitorar datas de validade de forma eficiente.

## 🌟 Funcionalidades Principais

### 📋 Gestão de Produtos
- Cadastro completo de produtos com:
  - Nome do produto
  - Código interno
  - Código EAN/GTIN
  - Número do lote
  - Quantidade em estoque
  - Data de validade
  - Observações

### 📷 Scanner de Código de Barras
- Leitura rápida de códigos de barras via câmera
- Identificação automática de produtos
- Suporte para códigos EAN-13, EAN-8, e outros formatos
- Interface intuitiva para escaneamento

### ⏰ Controle de Validade
- Monitoramento em tempo real das datas de validade
- Sistema de alertas para produtos próximos ao vencimento
- Categorização por cores:
  - 🔴 Vermelho: Produtos vencidos (0 dias ou menos)
  - 🟡 Amarelo: Próximos ao vencimento (1-30 dias)
  - 🟢 Verde: Produtos dentro do prazo (>30 dias)

### 📊 Dashboard
- Visualização gráfica do status dos produtos
- Estatísticas de estoque em tempo real
- Gráficos de:
  - Produtos por status de validade
  - Distribuição por categorias
  - Histórico de movimentações
- Indicadores de performance (KPIs)

### 📤 Exportação e Backup
- Exportação de dados para Excel
- Geração de relatórios personalizados
- Backup automático dos dados
- Sincronização com a nuvem

### 👤 Sistema de Usuários
- Login seguro com autenticação
- Níveis de acesso personalizados
- Perfis de usuário configuráveis
- Histórico de ações por usuário

## 🛠 Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Sistema de navegação
- **React Native Paper** - Componentes de UI
- **SQLite** - Banco de dados local
- **Expo Camera** - Funcionalidade de scanner
- **React Native Charts** - Visualização de dados

## ⚙️ Requisitos do Sistema

### Desenvolvimento
- Node.js 14 ou superior
- Expo CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS - apenas macOS)

### Dispositivos Suportados
- Android 6.0 ou superior
- iOS 13 ou superior
- 2GB RAM mínimo recomendado
- Câmera para funcionalidade de scanner

## 📥 Instalação e Configuração

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gestao-produtos

# Entre no diretório
cd gestao-produtos

# Instale as dependências
npm install

# Inicie o projeto
expo start
```

## 🔄 Atualizações Recentes

### Versão 0.0.22
- Melhorias na interface do usuário
- Correção de bugs no scanner
- Otimização do dashboard
- Novo sistema de alertas
- Melhorias na performance
- Suporte a temas claro/escuro
- Novo sistema de notificações
- Correções de segurança

## 🔒 Segurança

- Criptografia de dados sensíveis
- Autenticação segura
- Backup automático
- Proteção contra injeção SQL
- Validação de dados em tempo real

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.