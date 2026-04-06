# Backlog Epico - SmartWallet

## 1. Objetivo

Transformar o SmartWallet em uma plataforma de investimentos mais completa, mais clara, mais rapida e mais acessivel que a referencia de mercado, mantendo a stack atual:

- Frontend: Angular 21, TypeScript, Tailwind CSS, RxJS, ApexCharts, Chart.js
- Backend: Spring Boot 3.2, Kotlin, Spring Security, JPA, PostgreSQL, Flyway
- Infra: Docker, Nginx

O backlog abaixo foi quebrado sobre a base atual do projeto:

- Frontend ja existente: `dashboard`, `assets`, `ai-analysis`, `login`, `register`, `subscription`
- Backend ja existente: servicos de IA, webhook bancario e estrutura Spring Boot/Kotlin

## 2. Prioridades Macro

### P0 - Fundacao do produto

- Organizar arquitetura frontend por dominio
- Estruturar API versionada e contratos padronizados
- Garantir acessibilidade, performance e observabilidade desde o inicio
- Criar base de dados de ativos, cotacoes, indicadores e eventos
- Evoluir busca global, listagem de ativos e pagina de detalhe

### P1 - Diferenciadores principais

- Rankings
- Comparador
- Screener
- Calendarios de dividendos e resultados
- Carteira completa com proventos, metas e benchmark

### P2 - Expansao e monetizacao

- Noticias e educacao
- Calculadoras
- Alertas e notificacoes
- Premium com feature gating consistente
- Painel administrativo

### P3 - Vantagem competitiva

- IA contextual para explicar ativos e carteiras
- Personalizacao por perfil
- Insights proativos
- Acessibilidade avancada e testes continuos

## 3. Epicos e Tarefas

## Epico 1 - Fundacao de arquitetura e design system

### Objetivo

Criar a base tecnica para escalar o produto sem retrabalho.

### Tarefas

- [ ] Reorganizar o frontend por dominios: `market`, `assets`, `rankings`, `screener`, `wallet`, `news`, `education`, `auth`, `subscription`, `shared`
- [ ] Extrair componentes reutilizaveis existentes para um design system interno acessivel
- [ ] Criar tokens de cor, espaco, tipografia, elevacao e estados de foco
- [ ] Padronizar layout principal, header, sidebar, breadcrumb, empty states e loading states
- [ ] Criar biblioteca de componentes acessiveis: button, input, select, tabs, dialog, table, card, badge, toast
- [ ] Definir convencoes de naming, estrutura de pastas e padrao de lazy loading no Angular
- [ ] Padronizar `ApiResponse`, erros de negocio e codigos de erro no backend
- [ ] Criar namespace `/api/v1`
- [ ] Definir estrategia de auditoria, timestamps e soft delete quando aplicavel
- [ ] Configurar logs estruturados, health checks e metricas basicas
- [ ] Criar checklist WCAG 2.2 AA para PRs

### Entregaveis

- Arquitetura de pastas consolidada
- Componentes base reutilizaveis
- Guia de design system
- Contratos de API padronizados

## Epico 2 - Base de dados de mercado e ingestao

### Objetivo

Garantir dados confiaveis, atualizados e auditaveis para alimentar a plataforma.

### Tarefas

- [ ] Modelar entidades principais: `Asset`, `AssetCategory`, `Quote`, `DividendEvent`, `EarningsEvent`, `RelevantFact`, `IndicatorSnapshot`, `NewsItem`
- [ ] Criar migracoes Flyway para as tabelas acima
- [ ] Criar pipeline de ingestao separado da API transacional
- [ ] Definir estrategia para identificadores de ativos nacionais e internacionais
- [ ] Implementar historico de cotacoes e snapshots de indicadores
- [ ] Salvar origem do dado, timestamp da coleta e status de confianca
- [ ] Criar jobs para sincronizacao incremental e reprocessamento
- [ ] Criar validacoes de consistencia para dados faltantes ou divergentes
- [ ] Criar endpoints de leitura paginados e filtraveis
- [ ] Preparar cache para consultas mais acessadas

### Entregaveis

- Modelo de dados de mercado
- Mecanismo inicial de sincronizacao
- Endpoints publicos de leitura

## Epico 3 - Busca global e descoberta de ativos

### Objetivo

Fazer o usuario encontrar qualquer ativo e navegar com rapidez.

### Tarefas de frontend

- [ ] Substituir a pagina simples de `assets` por hub de descoberta
- [ ] Criar busca global com autocomplete, atalhos de teclado e historico recente
- [ ] Adicionar filtros por tipo: acoes, FIIs, BDRs, ETFs, stocks, reits, criptos, renda fixa, indices, moedas, commodities
- [ ] Exibir cards e tabelas responsivas com estados de carregamento e vazio
- [ ] Criar navegacao rapida para detalhes, comparador, favoritos e carteira

### Tarefas de backend

- [ ] Criar endpoint de busca global por ticker, nome e categoria
- [ ] Implementar ordenacao por relevancia
- [ ] Expor ativos em destaque, mais buscados e tendencias

### Acessibilidade

- [ ] Garantir busca completamente operavel por teclado
- [ ] Anunciar resultados dinamicos para leitor de tela
- [ ] Garantir alvo de toque adequado em mobile

### Entregaveis

- Busca global
- Pagina de ativos com filtros reais
- Navegacao de descoberta consistente

## Epico 4 - Pagina de detalhe de ativo

### Objetivo

Criar a principal tela de valor do produto.

### Tarefas

- [ ] Criar rota publica de detalhe por ativo
- [ ] Exibir resumo do ativo com preco, variacao, setor, segmento e descricao curta
- [ ] Exibir indicadores fundamentalistas com glossario e explicacao simples
- [ ] Exibir historico de cotacao com grafico e fallback tabular
- [ ] Exibir dividendos/proventos historicos e agenda futura
- [ ] Exibir calendario de resultados e fatos relevantes
- [ ] Exibir bloco de tese resumida e riscos principais
- [ ] Exibir comparacao rapida com setor e media da categoria
- [ ] Permitir favoritar, adicionar a carteira e abrir comparador
- [ ] Criar SEO tecnico para paginas publicas

### Acessibilidade

- [ ] Garantir hierarquia correta de headings
- [ ] Incluir resumo textual para graficos
- [ ] Garantir tabelas responsivas com contexto preservado

### Entregaveis

- Pagina de detalhe completa para cada classe de ativo

## Epico 5 - Dashboard inicial e homepage publica

### Objetivo

Tornar a primeira experiencia mais forte que a referencia.

### Tarefas

- [ ] Evoluir `dashboard` atual para diferenciar visitante e usuario logado
- [ ] Criar homepage publica com secoes de mercado, rankings, noticias, agenda e atalhos
- [ ] Criar dashboard logado com personalizacao por widgets
- [ ] Exibir resumo da carteira, watchlist, calendario e insights
- [ ] Criar onboarding guiado para iniciantes
- [ ] Criar atalhos para os fluxos principais em ate 1 clique

### Entregaveis

- Homepage publica
- Dashboard logado modular
- Onboarding inicial

## Epico 6 - Rankings de ativos

### Objetivo

Entregar rankings mais uteis, mais confiaveis e mais rapidos.

### Tarefas

- [ ] Criar modulo `rankings` no frontend
- [ ] Implementar rankings por tipo de ativo
- [ ] Permitir ordenacao, filtros, presets e exportacao
- [ ] Criar rankings prontos: maiores dividendos, menor P/VP, maior ROE, maior liquidez, maior receita, maior lucro, mais buscados
- [ ] Exibir metodologia do ranking e timestamp da ultima atualizacao
- [ ] Permitir salvar ranking como visualizacao favorita
- [ ] Criar endpoint backend para rankings configuraveis

### Entregaveis

- Rankings publicos e filtraveis
- Presets prontos para usuario iniciante

## Epico 7 - Comparador de ativos

### Objetivo

Permitir comparacao clara entre multiplos ativos.

### Tarefas

- [ ] Criar fluxo para adicionar ativos ao comparador a partir da busca e do detalhe
- [ ] Permitir comparar 2 a 5 ativos simultaneamente
- [ ] Exibir comparacao por indicadores, dividendos, desempenho e risco
- [ ] Destacar melhores e piores valores por criterio
- [ ] Criar modo mobile com comparacao por secoes em vez de tabela gigante
- [ ] Criar link compartilhavel da comparacao
- [ ] Criar endpoint backend agregando dados comparativos

### Entregaveis

- Comparador funcional para todas as classes suportadas

## Epico 8 - Screener / rastreador de ativos

### Objetivo

Superar a referencia em descoberta de oportunidades.

### Tarefas

- [ ] Criar construtor de filtros com operadores compostos
- [ ] Permitir filtros por categoria, setor, indicadores, liquidez, dividendos, preco, variacao e crescimento
- [ ] Permitir salvar screeners
- [ ] Permitir duplicar, editar e compartilhar screeners
- [ ] Criar resultados paginados e exportaveis
- [ ] Criar endpoint backend para filtragem dinamica com validacao segura
- [ ] Criar presets iniciais: dividendos, valor, qualidade, crescimento, renda passiva

### Entregaveis

- Screener avancado com filtros salvos

## Epico 9 - Calendarios e eventos de mercado

### Objetivo

Centralizar os eventos mais importantes do investidor.

### Tarefas

- [ ] Criar modulo de agenda de dividendos
- [ ] Criar modulo de agenda de resultados
- [ ] Criar modulo de fatos relevantes e comunicados
- [ ] Criar modulo de IPOs e eventos especiais
- [ ] Permitir filtros por data, categoria, ativo e carteira do usuario
- [ ] Permitir notificacao e favorito por evento
- [ ] Integrar eventos ao dashboard e as paginas de ativos

### Entregaveis

- Calendario unificado
- Visao personalizada por carteira

## Epico 10 - Carteira, proventos e metas

### Objetivo

Converter o produto em gestor de carteira, nao apenas vitrine de dados.

### Tarefas de backend

- [ ] Modelar `Portfolio`, `PortfolioHolding`, `Transaction`, `DividendReceipt`, `Goal`, `Benchmark`
- [ ] Criar migracoes Flyway da carteira
- [ ] Criar endpoints para CRUD de carteira e lancamentos
- [ ] Integrar classificacao bancaria com lancamentos quando fizer sentido
- [ ] Criar calculo de preco medio, rentabilidade, alocacao e proventos
- [ ] Criar benchmark comparativo
- [ ] Criar trilha tributaria basica para IR

### Tarefas de frontend

- [ ] Criar modulo `wallet`
- [ ] Criar telas de resumo, holdings, lancamentos, proventos, metas, benchmark e analise
- [ ] Permitir adicionar compra, venda, dividendo, bonificacao e transferencia
- [ ] Criar visao por carteira e consolidada
- [ ] Exibir calendario pessoal de proventos e eventos
- [ ] Criar empty states educativos para iniciantes

### Entregaveis

- Carteira completa
- Proventos e metas
- Benchmark e consolidado

## Epico 11 - Watchlist, favoritos e alertas

### Objetivo

Manter o usuario engajado com monitoramento relevante.

### Tarefas

- [ ] Criar favoritos por usuario
- [ ] Criar watchlists customizadas
- [ ] Permitir alertas de preco, dividendos, resultado e variacao
- [ ] Criar central de notificacoes no frontend
- [ ] Implementar preferencia granular de notificacoes
- [ ] Exibir eventos relevantes no dashboard

### Entregaveis

- Favoritos
- Alertas configuraveis
- Centro de notificacoes

## Epico 12 - IA util de verdade

### Objetivo

Aproveitar a base de IA ja existente como diferencial pratico.

### Tarefas

- [ ] Evoluir `ai-analysis` para usar contexto real da carteira e dos ativos
- [ ] Criar resumo automatico de ativo em linguagem simples
- [ ] Criar explicador de indicadores
- [ ] Criar comparacao assistida por IA
- [ ] Criar resumo de carteira com pontos fortes, riscos e concentracao
- [ ] Criar disclaimers e nivel de confianca da resposta
- [ ] Registrar feedback do usuario sobre utilidade das respostas

### Entregaveis

- IA contextual na carteira
- IA contextual no detalhe de ativo
- Explicacoes simples para iniciantes

## Epico 13 - Noticias, educacao e glossario

### Objetivo

Conectar conteudo e decisao de investimento.

### Tarefas

- [ ] Criar modulo de noticias com relacionamento por ativo
- [ ] Criar pagina de conteudo educacional e trilhas por perfil
- [ ] Criar glossario de termos financeiros
- [ ] Exibir noticias relacionadas na pagina do ativo
- [ ] Exibir conteudo educativo contextual em momentos de duvida
- [ ] Criar blocos "entenda este indicador" e "como interpretar"

### Entregaveis

- Noticias contextualizadas
- Centro educacional
- Glossario navegavel

## Epico 14 - Calculadoras e simuladores

### Objetivo

Cobrir ferramentas utilitarias esperadas pelo mercado.

### Tarefas

- [ ] Criar calculadora de juros compostos
- [ ] Criar calculadora de reserva de emergencia
- [ ] Criar simulador de dividendos
- [ ] Criar simulador de meta patrimonial
- [ ] Criar simulador de renda fixa
- [ ] Garantir acessibilidade e compartilhamento de resultados

### Entregaveis

- Suite de calculadoras financeiras

## Epico 15 - Premium, assinatura e feature gating

### Objetivo

Monetizar sem destruir a experiencia base.

### Tarefas

- [ ] Revisar `subscription` atual para planos claros e comparaveis
- [ ] Definir grade de recursos free vs premium
- [ ] Implementar feature flags por assinatura
- [ ] Criar paywall contextual e nao intrusivo
- [ ] Implementar limites de uso por recurso premium
- [ ] Medir conversao por tela e recurso

### Entregaveis

- Assinatura consistente
- Controles de acesso por plano

## Epico 16 - Admin, curadoria e operacao

### Objetivo

Permitir operacao segura da plataforma.

### Tarefas

- [ ] Criar area admin protegida
- [ ] Gerenciar ativos, categorias e status de cobertura
- [ ] Revisar noticias, eventos e conteudo educativo
- [ ] Reprocessar sincronizacoes com falha
- [ ] Auditar alteracoes de dados
- [ ] Criar dashboard operacional com filas, erros e jobs

### Entregaveis

- Painel administrativo minimo viavel

## Epico 17 - Acessibilidade e UX operacional

### Objetivo

Fazer acessibilidade ser requisito continuo, nao retoque final.

### Tarefas

- [ ] Auditar todas as paginas atuais e futuras com foco em WCAG 2.2 AA
- [ ] Revisar contraste, foco, ordem de tabulacao e semantica
- [ ] Criar padrao de erro acessivel para formularios
- [ ] Garantir fallback tabular para graficos
- [ ] Implementar `prefers-reduced-motion`
- [ ] Criar testes automatizados de acessibilidade para fluxos criticos
- [ ] Rodar testes moderados com usuarios reais

### Entregaveis

- Base acessivel validada
- Checklist e testes automatizados

## Epico 18 - Qualidade, testes e observabilidade

### Objetivo

Dar confiabilidade ao produto e ao time.

### Tarefas

- [ ] Criar testes unitarios para servicos backend e componentes frontend criticos
- [ ] Criar testes de integracao para auth, ativos, carteira e rankings
- [ ] Criar testes E2E para login, busca, detalhe, comparador, screener e carteira
- [ ] Medir cobertura minima dos fluxos criticos
- [ ] Configurar pipeline de build, teste e validacoes de qualidade
- [ ] Criar metricas de performance frontend e backend
- [ ] Criar alertas operacionais para falhas de jobs e APIs

### Entregaveis

- Pipeline de qualidade
- Suite minima de testes
- Visibilidade operacional

## 4. Backlog por Fase

## Fase 1 - Base e descoberta

### Meta

Deixar o produto com fundacao forte e primeira experiencia publica relevante.

### Itens

- [ ] Epico 1
- [ ] Epico 2
- [ ] Epico 3
- [ ] Epico 4
- [ ] Epico 5
- [ ] Primeiros itens do Epico 17
- [ ] Primeiros itens do Epico 18

## Fase 2 - Analise e comparacao

### Meta

Transformar o produto em ferramenta real de pesquisa de ativos.

### Itens

- [ ] Epico 6
- [ ] Epico 7
- [ ] Epico 8
- [ ] Epico 9

## Fase 3 - Carteira e recorrencia

### Meta

Fazer o usuario voltar diariamente e gerir sua carteira na plataforma.

### Itens

- [ ] Epico 10
- [ ] Epico 11
- [ ] Parte aplicada do Epico 12

## Fase 4 - Conteudo e monetizacao

### Meta

Expandir valor percebido e conversao.

### Itens

- [ ] Epico 13
- [ ] Epico 14
- [ ] Epico 15
- [ ] Epico 16

## Fase 5 - Diferenciacao competitiva

### Meta

Consolidar vantagem frente a concorrencia.

### Itens

- [ ] Profundidade total do Epico 12
- [ ] Personalizacao avancada no dashboard
- [ ] Insights proativos por perfil
- [ ] Otimizacoes finais de UX, acessibilidade e performance

## 5. Primeiras Sprints Recomendadas

## Sprint 1

- [ ] Reorganizar estrutura Angular por dominio
- [ ] Criar design system base
- [ ] Padronizar respostas e erros no backend
- [ ] Criar entidades e migracoes iniciais de ativos
- [ ] Criar endpoint `/api/v1/assets/search`
- [ ] Evoluir pagina `assets` para listagem filtravel simples

## Sprint 2

- [ ] Criar homepage publica
- [ ] Criar detalhe basico de ativo
- [ ] Integrar cotacao, indicadores e dividendos
- [ ] Melhorar acessibilidade dos fluxos de login, cadastro e busca
- [ ] Adicionar testes unitarios minimos no frontend e backend

## Sprint 3

- [ ] Criar rankings iniciais
- [ ] Criar favoritos
- [ ] Integrar atalhos de adicionar ativo a favoritos e comparador
- [ ] Criar observabilidade basica e metricas de API

## Sprint 4

- [ ] Criar comparador v1
- [ ] Criar agenda de dividendos v1
- [ ] Criar watchlist simples
- [ ] Evoluir `ai-analysis` com contexto de ativo

## 6. Dependencias Criticas

- Sem Epico 2, os modulos publicos vao parecer incompletos ou inconsistentes
- Sem Epico 1, o frontend tende a virar um conjunto de paginas isoladas
- Sem Epico 17, a melhoria "mais acessivel" nao se sustenta
- Sem Epico 18, o crescimento vai aumentar regressao e retrabalho
- Epicos 6 a 12 dependem fortemente da qualidade da modelagem dos Epicos 2 e 10

## 7. Definicao de pronto por modulo

- Interface responsiva desktop e mobile
- Navegacao por teclado funcional
- Contraste validado
- Estados de loading, erro e vazio implementados
- Telemetria basica do fluxo
- Testes minimos cobrindo regras criticas
- Documentacao curta de uso tecnico e funcional
- Endpoint ou contrato versionado quando houver backend

## 8. Proxima acao sugerida

Se o time for executar isso agora, a melhor sequencia e:

1. Fundacao de arquitetura
2. Base de dados de mercado
3. Busca e detalhe de ativo
4. Rankings e comparador
5. Carteira e alertas
6. IA contextual e monetizacao
