# Projeto Acolher • Gestão de Estoque FEFO e Mapeamento de Beneficiários

Aplicação Web desenvolvida no âmbito do **Projeto Integrador II (UNIVESP)**, Polo Céu Rosa da China, em parceria com o **Departamento Social da Igreja Evangélica Assembleia de Deus de Utinga em Santo André / SP**.

---

## 📌 Contexto & Justificativa Acadêmica

As organizações comunitárias e religiosas do terceiro setor exercem papel crucial no combate à fome e à vulnerabilidade social. Contudo, enfrentam gargalos crônicos:
1. **Heterogeneidade e Prazos Incertos de Validade**: Alimentos arrecadados em campanhas comunitárias e prestação pecuniária possuem datas de expiração díspares. A ausência de triagem automatizada culmina frequentemente em descarte prematuro e perdas de insumos.
2. **Ausência de Rastreabilidade Histórica Digital**: O controle manual em papel inviabiliza a fiscalização sobre a frequência e equidade no atendimento às famílias assistidas.
3. **Formalização de Penas Alternativas**: Necessidade de emissão de declarações comprobatórias para a Vara de Execuções Penais (VEC).

### 💡 Solução Proposta pela Engenharia da Computação
O **Projeto Acolher** aplica conceitos avançados de:
- **Engenharia de Software & Algoritmos**: Implementação do algoritmo logístico preditivo **FEFO** (*First Expire, First Out* — Primeiro a Vencer, Primeiro a Sair), calculando dinamicamente a prioridade de saída dos lotes de alimentos e otimizando a montagem automatizada de cestas básicas.
- **Interação Humano-Computador (IHC)**: Interface responsiva, com linguagem amigável, botões acessíveis e feedback imediato, projetada especificamente para voluntários com variados níveis de letramento digital.
- **Banco de Dados & Persistência Descentralizada**: Armazenamento ágil e seguro via `LocalStorage`/`IndexedDB` com suporte a exportação em planilhas (`CSV`), backup completo (`JSON`) e impressão de comprovantes formais.

---

## 🚀 Funcionalidades Principais

| Módulo | Descrição Funcional |
|---|---|
| **Painel Geral (Dashboard)** | Indicadores de impacto social em tempo real, evolução gráfica de entregas, Composição do Estoque e Quadro de Ação Imediata FEFO (&lt;30 dias). |
| **Estoque & Lotes FEFO** | Rastreabilidade de lotes com alertas visuais por faixa de validade (Crítico, Atenção, Seguro, Vencido), filtros por categoria e registro de perdas/descarte. |
| **Montador de Cestas FEFO** | Assistente logístico que calcula a capacidade máxima de montagem com base na receita padrão e aloca automaticamente os lotes mais antigos. |
| **Entrada de Doações** | Rastreio de arrecadação por campanhas de culto, prestação pecuniária judicial (VEC) e doações diretas, com emissão de recibos. |
| **Mapeamento de Famílias** | Cadastro socioassistencial completo, localização em Santo André, histórico de atendimentos e monitoramento do intervalo de carência (mínimo 30 dias). |
| **Entregas & Recibos** | Baixa automatizada de cestas e geração formatada do **Termo de Recebimento de Cesta Básica** pronto para impressão e assinatura. |
| **Prestação de Contas** | Relatório oficial para a Vara de Execuções Penais, relatórios gerenciais e exportação completa em Excel/CSV. |

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico & Modern CSS3**
- **Tailwind CSS** (Design System responsivo e acessível)
- **Vanilla JavaScript (ES6+)** (Arquitetura modular, reativa e sem dependências pesadas de build)
- **Chart.js** (Visualização gráfica de dados e indicadores sociais)
- **Lucide Icons** (Iconografia moderna e intuitiva)

---

## 💻 Como Executar a Aplicação

### Opção 1: Execução Direta (Recomendada)
1. Dê um duplo clique no arquivo `run_app.bat` ou abra diretamente o arquivo `index.html` em qualquer navegador (Google Chrome, Microsoft Edge, Firefox).

### Opção 2: Servidor Local via PowerShell
1. Abra o terminal na pasta do projeto e execute:
   ```powershell
   powershell -ExecutionPolicy Bypass -File server.ps1
   ```
2. O sistema abrirá automaticamente no endereço `http://localhost:8080/`.

---

## 👥 Integrantes & Equipe
- **Aluno**: Ricardo Martins dos Santos (RA: 25213296)
- **Orientadora**: Julianne Santana Cavalcanti
- **Polo**: Céu Rosa da China • Santo André - SP
- **Curso**: Engenharia da Computação / TI — UNIVESP (Projeto Integrador II)
