# Backlog Epico - SmartWallet

## 1. Objetivo desta versao

Esta versao do backlog foi atualizada para mostrar apenas:

- o que ainda falta implementar
- o que existe so na interface, mock ou schema
- o que esta incompleto na integracao frontend + backend + dados

Itens ja visiveis no frontend, como homepage, rankings, comparador, screener, noticias, carteira, favoritos, detalhe de ativo e calculadoras, nao foram removidos do backlog quando ainda dependem de backend real, acessibilidade, qualidade ou regras de negocio.

## 2. Leitura rapida do estado atual

### Ja existe

- Rotas e paginas principais no Angular
- `ApiService` com contratos esperados para market, wallet, portfolio, watchlist e IA
- Migrations para mercado, watchlist, alertas, goals, dividendos recebidos, benchmark e rename de `portfolio_assets`
- Servicos basicos de IA e webhook bancario inicial
- Backend implementado para market (search/featured/trending/rankings/quote/history/dividends/earnings), carteira, portfolio assets/transactions, watchlist/favoritos/alertas
- Seeds e ingestao dev de mercado (`market_seed.json` + job)
- Testes de integracao para market, wallet e watchlist

### Ainda pendente ou incompleto

- Autenticacao/autorizacao real (user vem de `X-User-Id`)
- Pipeline externo de ingestao de mercado, dividendos/earnings/agenda
- Integracao ponta a ponta: frontend ainda tem mocks (carteira, favoritos, comparador, screener)
- Acessibilidade sistematica
- Testes E2E e suite completa
- Admin, premium robusto, observabilidade

## 3. Backlog pendente por epico

## Epico 1 - Backend de dominio e API real

### Objetivo

Sustentar com backend verdadeiro as telas que ja existem no frontend.

### Faltando

- [x] Criar controllers para `market`, `wallets`, `portfolio`, `watchlist`, `alerts`
- [ ] Criar controllers para `ai`, `news`, `subscription` e `admin`
- [x] Criar entidades JPA e repositories para os dominos de mercado, carteira, watchlist, alertas
- [ ] Criar entidades/repositorio para noticias
- [x] Criar services de negocio reais para busca, ranking, comparacao, carteira, favoritos
- [ ] Criar services para proventos consolidados, assinatura e admin
- [x] Padronizar `ApiResponse`, mensagens de erro e codigos de negocio
- [ ] Versionar a API com `/api/v1`
- [ ] Implementar autenticacao/autorizacao consistente nos endpoints protegidos
- [ ] Criar auditoria minima para alteracoes criticas

### Observacao atual

Hoje o backend exposto encontrado no codigo esta basicamente restrito ao webhook bancario, entao este epico e o maior gargalo do projeto.

## Epico 2 - Mercado e ingestao de dados reais

### Objetivo

Parar de depender de placeholders e passar a servir dados confiaveis.

### Faltando

- [x] Modelagem do dominio de mercado com `Asset`, `AssetCategory`, `QuoteHistory`, `DividendEvent`, `EarningsEvent`
- [ ] Adicionar `RelevantFact`, `IndicatorSnapshot`, `NewsItem`
- [ ] Criar migracoes adicionais para fatos relevantes, snapshots de indicadores e noticias
- [ ] Implementar ingestao/sincronizacao externa de dados de mercado (hoje apenas seed/dev)
- [ ] Salvar origem do dado, horario da ultima atualizacao e status de confianca
- [ ] Criar jobs de sincronizacao incremental e reprocessamento com fonte real
- [ ] Criar validacoes de consistencia e tratamento de divergencia
- [ ] Criar cache para endpoints pesados de mercado

### Incompleto hoje

- [ ] O schema inicial existe, mas nao ha pipeline real de ingestao nem endpoints sustentando todo o dominio

## Epico 3 - Busca global e exploracao de ativos

### Objetivo

Concluir o modulo de busca e descoberta com dados reais e navegacao forte.

### Faltando

- [x] Implementar backend real para `search`, `featured`, `trending` e `categories`
- [ ] Implementar ordenacao por relevancia de busca
- [ ] Adicionar filtros reais por categoria, setor e tipo de ativo
- [ ] Trocar qualquer dado fake ou parcial por resposta de API validada no frontend
- [ ] Adicionar historico recente e atalhos de teclado na busca
- [ ] Melhorar acessibilidade da busca com foco, announcer e navegacao por teclado

### Incompleto hoje

- [ ] A interface de busca existe, mas ainda depende de a API esperada existir de verdade

## Epico 4 - Pagina de detalhe de ativo completa

### Objetivo

Transformar a tela de detalhe em modulo completo e funcional.

### Faltando

- [ ] Implementar grafico historico real em vez de placeholder (backend pronto)
- [ ] Trazer dividendos historicos e agenda futura por API (backend pronto; falta integrar)
- [ ] Trazer calendario de resultados e fatos relevantes por API
- [ ] Implementar tese resumida, riscos principais e comparacao com setor
- [ ] Fazer os botoes de favoritar, comparar e adicionar a carteira funcionarem de verdade (backend pronto)
- [ ] Adicionar glossario simples para indicadores
- [ ] Preparar SEO tecnico das paginas publicas
- [ ] Criar fallback tabular e resumo textual para graficos

### Incompleto hoje

- [ ] A pagina carrega dados basicos do ativo, mas varias acoes ainda sao placeholder local

## Epico 5 - Dashboard e homepage conectados ao produto real

### Objetivo

Evoluir as telas iniciais para servirem valor real ao usuario.

### Faltando

- [ ] Diferenciar claramente homepage publica e dashboard logado
- [ ] Integrar dashboard com carteira, watchlist, eventos e insights reais
- [ ] Adicionar widgets configuraveis no dashboard logado
- [ ] Criar onboarding guiado de usuario iniciante
- [ ] Exibir alertas, favoritos e calendario pessoal no dashboard

### Incompleto hoje

- [ ] A homepage existe e usa dados esperados da API, mas o dashboard ainda precisa ficar mais orientado a uso real

## Epico 6 - Rankings reais e configuraveis

### Objetivo

Concluir rankings com criterios, performance e confiabilidade.

### Faltando

- [ ] Implementar backend real para rankings por criterio
- [ ] Adicionar filtros, presets, exportacao e paginacao
- [ ] Incluir mais rankings prontos alem dos basicos
- [ ] Exibir metodologia do ranking e data da ultima atualizacao
- [ ] Permitir salvar visualizacoes favoritas

### Incompleto hoje

- [ ] A pagina existe, mas depende de endpoints e regras de ordenacao completas no backend

## Epico 7 - Comparador de ativos completo

### Objetivo

Levar o comparador de uma tela funcional para um recurso forte.

### Faltando

- [ ] Criar endpoint agregador para comparacao
- [ ] Adicionar comparacao de dividendos, desempenho, risco e eventos
- [ ] Destacar melhores e piores metricas automaticamente
- [ ] Criar modo mobile melhor que tabela simples
- [ ] Criar link compartilhavel da comparacao
- [ ] Integrar adicionar ao comparador a partir do detalhe do ativo

### Incompleto hoje

- [ ] O comparador existe no frontend, mas ainda trabalha de forma simples e local

## Epico 8 - Screener com motor real de filtros

### Objetivo

Trocar o filtro local por um screener de verdade.

### Faltando

- [ ] Criar endpoint backend de screener com filtros dinamicos e validacao segura
- [ ] Implementar operadores compostos e filtros mais profundos
- [ ] Adicionar paginacao e exportacao
- [ ] Permitir salvar, editar, duplicar e compartilhar screeners
- [ ] Criar presets sustentados por dados reais

### Incompleto hoje

- [ ] O screener atual filtra dados no frontend e nao representa um motor real de rastreamento

## Epico 9 - Calendarios e eventos

### Objetivo

Completar agenda de mercado e integrar com o resto da plataforma.

### Faltando

- [ ] Implementar agenda de dividendos com API real
- [ ] Criar agenda de resultados
- [ ] Criar fatos relevantes e comunicados
- [ ] Criar eventos especiais e IPOs
- [ ] Permitir filtros por ativo, data, categoria e carteira
- [ ] Integrar eventos ao dashboard, detalhe do ativo e notificacoes

### Incompleto hoje

- [ ] O calendario de dividendos existe visualmente, mas ainda usa dados mockados

## Epico 10 - Carteira, holdings, lancamentos e benchmark

### Objetivo

Transformar a carteira em modulo produtivo real.

### Faltando no backend

- [x] Criar CRUD real de carteiras
- [x] Criar CRUD de holdings e movimentacoes
- [ ] Criar CRUD de proventos
- [ ] Calcular preco medio, lucro/prejuizo, alocacao, benchmark e consolidado
- [ ] Integrar goals, benchmark snapshots e dividend receipts ao dominio
- [ ] Integrar classificacao bancaria com movimentacoes quando aplicavel
- [ ] Criar base para visao tributaria

### Faltando no frontend

- [ ] Parar de usar dados aleatorios na tela de carteira
- [ ] Integrar holdings, movimentacoes e proventos a endpoints reais
- [ ] Criar fluxo de nova movimentacao funcional
- [ ] Criar abas reais para movimentacoes, proventos, metas e benchmark
- [ ] Criar visao por carteira e consolidada

### Incompleto hoje

- [ ] O schema parcial existe e a tela existe, mas a carteira ainda nao esta implementada de ponta a ponta

## Epico 11 - Favoritos, watchlists e alertas

### Objetivo

Concluir persistencia e notificacao dos recursos de acompanhamento.

### Faltando

- [x] Persistir favoritos por usuario
- [x] Criar watchlists customizadas reais
- [x] Implementar CRUD de itens de watchlist
- [x] Implementar alertas de preco, dividendos, resultados e variacao (endpoint pronto; logica de disparo pendente)
- [ ] Criar central de notificacoes no frontend
- [ ] Criar preferencias de notificacao por usuario

### Incompleto hoje

- [ ] O banco ja tem tabelas para watchlist e alertas, mas a tela de favoritos ainda usa lista local

## Epico 12 - IA contextual e util

### Objetivo

Evoluir a IA de respostas fixas para inteligencia aplicada ao usuario.

### Faltando

- [ ] Usar dados reais da carteira para score, risco e recomendacoes
- [ ] Criar resumo automatico de ativo em linguagem simples
- [ ] Criar explicador de indicadores
- [ ] Criar comparacao assistida por IA
- [ ] Criar resumo da carteira com concentracao, riscos e oportunidades
- [ ] Adicionar disclaimer, confianca e feedback do usuario

### Incompleto hoje

- [ ] A IA atual ainda retorna respostas basicas e estaticas demais

## Epico 13 - Noticias, educacao e glossario

### Objetivo

Trocar conteudo mockado por conteudo util e integrado.

### Faltando

- [ ] Integrar noticias reais relacionadas a ativos
- [ ] Criar dominio backend para noticias e relacionamento por simbolo
- [ ] Criar modulo de educacao por trilhas e perfil
- [ ] Criar glossario de termos financeiros
- [ ] Exibir contexto educativo nas paginas de ativo e indicadores

### Incompleto hoje

- [ ] A pagina de noticias existe, mas ainda usa dados locais

## Epico 14 - Calculadoras e simuladores

### Objetivo

Polir e ampliar as calculadoras ja iniciadas.

### Faltando

- [ ] Adicionar simulador de renda fixa
- [ ] Melhorar validacao de formularios e tratamento de erro
- [ ] Melhorar acessibilidade das calculadoras
- [ ] Permitir compartilhamento de resultados
- [ ] Padronizar apresentacao e explicacoes educativas

### Incompleto hoje

- [ ] As calculadoras basicas existem, mas ainda faltam cobertura completa e refinamento

## Epico 15 - Premium e controle de acesso

### Objetivo

Fechar monetizacao e gating de recursos.

### Faltando

- [ ] Revisar assinatura atual e alinhar planos com recursos reais
- [ ] Implementar feature flags por assinatura
- [ ] Criar paywall contextual
- [ ] Implementar limites de uso por plano
- [ ] Medir conversao por tela e recurso

## Epico 16 - Admin e operacao

### Objetivo

Dar capacidade operacional para sustentar o produto.

### Faltando

- [ ] Criar area admin protegida
- [ ] Gerenciar ativos, categorias, noticias, eventos e conteudo
- [ ] Reprocessar ingestoes com falha
- [ ] Criar dashboard operacional de jobs, erros e filas
- [ ] Auditar alteracoes de dados

## Epico 17 - Acessibilidade e UX transversal

### Objetivo

Fechar o gap entre interface pronta e experiencia acessivel de verdade.

### Faltando

- [ ] Auditar as telas atuais com foco em WCAG 2.2 AA
- [ ] Revisar contraste, tabulacao, semantica e foco visivel
- [ ] Garantir navegacao completa por teclado
- [ ] Criar padrao acessivel para mensagens de erro
- [ ] Garantir fallback tabular e resumo textual para graficos
- [ ] Implementar `prefers-reduced-motion`
- [ ] Testar com leitores de tela e usuarios reais

## Epico 18 - Qualidade, testes e observabilidade

### Objetivo

Trocar cobertura ilustrativa por qualidade real.

### Faltando

- [ ] Criar testes unitarios reais para componentes e servicos principais
- [ ] Criar testes de integracao no backend
- [ ] Criar testes E2E para login, busca, detalhe, comparador, screener e carteira
- [ ] Substituir specs ilustrativos por testes do comportamento real
- [ ] Configurar pipeline de qualidade
- [ ] Criar metricas e health checks de negocio e infraestrutura
- [ ] Criar alertas operacionais para falha de API, job e ingestao

## 4. Prioridade recomendada agora

### P0 - Bloqueios principais

- [ ] Epico 1 (auth real, versionamento, admin/news/subscription)
- [ ] Epico 2 (ingestao externa, fatos relevantes, snapshots)
- [ ] Epico 10 (proventos, calculos, metas/benchmark)
- [ ] Epico 11 (notificacoes/front, preferencias, disparo de alertas)

### P1 - Finalizar modulos ja visiveis

- [ ] Epico 3
- [ ] Epico 4
- [ ] Epico 6
- [ ] Epico 7
- [ ] Epico 8
- [ ] Epico 9
- [ ] Epico 12
- [ ] Epico 13

### P2 - Robustez e escala

- [ ] Epico 15
- [ ] Epico 16
- [ ] Epico 17
- [ ] Epico 18

## 5. Proximas sprints recomendadas

## Sprint 1 (concluida)

- [x] Criar controllers e services reais de `market`
- [x] Criar entidades e repositories de mercado
- [x] Expor `search`, `featured`, `trending`, `categories` e `asset detail`
- [ ] Integrar detalhe do ativo com dados reais alem dos campos basicos (falta frontend)
- [x] Padronizar resposta de API e erros

## Sprint 2 (concluida parcialmente)

- [x] Criar backend real de carteira e holdings
- [ ] Remover dados aleatorios da pagina `wallet`
- [x] Criar favoritos e watchlists persistidos
- [ ] Fazer botoes de detalhe do ativo funcionarem de verdade
- [x] Criar testes de integracao para market e wallet

## Sprint 3 (planejada)

- [ ] Criar rankings reais (ajustar ordenacao/criterios e integrar frontend)
- [ ] Criar comparador com endpoint agregador
- [ ] Criar screener backend
- [ ] Integrar agenda de dividendos real
- [ ] Melhorar acessibilidade de busca, tabelas e graficos

## Sprint 4 (planejada)

- [ ] Evoluir IA com contexto real da carteira
- [ ] Integrar noticias reais
- [ ] Finalizar alertas (disparo + central frontend)
- [ ] Criar observabilidade basica
- [ ] Iniciar area admin

## 6. Definicao de pronto

Um item deste backlog so pode ser considerado concluido quando tiver:

- frontend integrado a backend real
- persistencia real quando aplicavel
- estados de loading, erro e vazio
- navegacao por teclado e semantica minima
- testes cobrindo o fluxo principal
- ausencia de mock, placeholder ou dado aleatorio no fluxo final
