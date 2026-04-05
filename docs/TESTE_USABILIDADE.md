# Teste de Usabilidade - SmartWallet

## 1. O que é Teste de Usabilidade?

É a prática de observar **usuários reais** enquanto eles tentam realizar tarefas no software. O objetivo é identificar problemas de UX antes que eles se tornem reclamações.

### Os 3 Pilares

| Pilar | Descrição | Pergunta-chave |
|------|----------|--------------|
| **Facilidade de aprendizado** | Quão rápido o usuário entende como usar | "Ele consegue usar sem ajuda?" |
| **Eficiência** | Quantos cliques/passos para completar tarefa | "Quanto tempo leva?" |
| **Satisfação** | Como o usuário se sente usando | "A interface parece profissional?" |

---

## 2. Cenários de Teste - SmartWallet

### Tarefa 1: Primeiro Cadastro
> "Você acabou de baixar o SmartWallet. Crie uma conta e adicione sua primera carteira."

**Passos esperados:**
1. Clicar em "Cadastrar"
2. Preencher email, senha, CPF
3. Confirmar email
4. Criar primeira carteira

**Métricas:**
- Tempo: < 2 minutos ✅
- Taxa de sucesso: > 90%
- Erros comuns: _______________

### Tarefa 2: Registrar Investimento
> "Você comprou 10 ações da PETR4 a R$ 30,00 cada. Registre esse investimento."

**Passos esperados:**
1. Ir para "Ativos"
2. Clicar em "+"
3. Buscar "PETR4"
4. Informar quantidade (10)
5. Informar preço (30)
6. Selecionar carteira
7. Confirmar

**Métricas:**
- Tempo: < 45 segundos ✅
- Cliques: < 8
- Taxa de sucesso: > 85%

### Tarefa 3: Verificar Portfólio
> "Quanto você tem no total em todas as carteiras?"

**Passos esperados:**
1. Ver dashboard principal
2. Ver valor total

**Métricas:**
- Tempo: < 5 segundos ✅
- O valor está visível na primeira tela? Sim/Não

### Tarefa 4: Verificar Análise de IA
> "O que a IA recomenda para seu portfólio?"

**Passos esperados:**
1. Ir para "Análise de IA"
2. Ver recomendações

**Métricas:**
- Tempo: < 10 segundos ✅
- Premium: aparece alerta de upgrade? Sim/Não

### Tarefa 5: Criar Alerta de Preço
> "Crie um alerta para quando PETR4 passar de R$ 35,00."

**Passos esperados:**
1. Ir para Notificações
2. Criar alerta de preço
3. Configurar condição

**Métricas:**
- Tempo: < 30 segundos ✅
- É intuitivo? Sim/Não

### Tarefa 6: Upgrade de Plano
> "Você quer usar todos os recursos premium. Faça o upgrade."

**Passos esperados:**
1. Ir para Assinatura
2. Escolher plano
3. Ir para checkout
4. Pagar

**Métricas:**
- Fluxo de pagamento é claro? Sim/Não
- Valor mostrado? Sim/Não

### Tarefa 7: Recuperar Senha
> "Você esqueceu sua senha. Como fazer para recuperar?"

**Passos esperados:**
1. Tentar fazer login
2. Clicar "Esqueci a senha"
3. Receber email
4. Redefinir senha

**Métricas:**
- Tempo: < 2 minutos ✅
- Email chega? Sim/Não

---

## 3. Roteiro de Teste (5-8 usuários)

### Antes da sessão
- [ ] Definir tarefas
- [ ] Preparar conta teste
- [ ] Preparar планilha de anotações
- [ ] Gravar consentimento

### Durante a sessão
```
📋 ROTEIRO DE TESTE

Olá! Obrigado por participar. 
Este é um teste de usabilidade, não um exame.
Você não vai "acertar" ou "errar".

O que você faria se quisesse [TAREFA]?
Pense em voz alta enquanto faz.

Se precisar de ajuda, diga. Caso contrário, continue.

[OBSERVAÇÃO]
- Onde clicou primeiro?
- Quanto tempo demorou?
- Fez pausa em qual tela?
- Parece confuso(a)?
- Pediu ajuda?

[TAREFA 1]: ________________
[Área de notas]: ________________

[TAREFA 2]: ________________
[Área de notas]: ________________

[TAREFA 3]: ________________
[Área de notas]: ________________
```

### Após a sessão
- [ ] Obrigado
- [ ] Perguntar feedback geral
- [ ] Anotar sugestões

---

## 4. Métricas de Coleta

### Planilha de Resultados

|Usuário|Tarefa|Tempo|Cliques|Sucesso?|Problema|
|-------|------|-----|-------|--------|--------|
| U1 | Cadastro | 1:30 | 5 | ✅ | - |
| U2 | Cadastro | 2:15 | 8 | ❌ | CPF aceitou ponto |
| U3 | Ativo | 45s | 6 | ✅ | - |
| ... | ... | ... | ... | ... | ... |

### Indicadores-Chave

| Métrica |Meta|Bom|Ruim|
|--------|-----|----|----|
| Taxa de sucesso | > 90% | 85-90% | < 85% |
| Tempo médio | < 45s | 45-60s | > 60s |
| Cliques média | < 8 | 8-10 | > 10 |
| NPS | > 50 | 40-50 | < 40 |

---

## 5. Checklist de Correções

### Crítico (Corrigir imediato)
- [ ] Fluxo de login quebrar
- [ ] Erro 500 visível para usuário
- [ ] Dado sensível exposto

### Alto (Corrigir nesta sprint)
- [ ] Tempo > 3 segundos
- [ ] Mensagem de erro não clara
- [ ] Botão não clicável

### Médio (Próxima sprint)
- [ ] Fluxo confuso
- [ ] Falta feedback visual
- [ ] Campos mal posicionados

### Baixo (Backlog)
- [ ] Melhorar cores
- [ ] Animações
- [ ] Ícones

---

## 6. Impacto no Backend

O teste de usabilidade revela problemas técnicos:

| Problema UX | Impacto Backend |
|------------|----------------|
| Usuário clica múltiplas vezes |处理重复请求 (trava no front) |
| Tempo > 3s | Otimizar query, adicionar cache |
| Mensagem de erro técnica | Melhorar exception handler (DTO claro) |
| Dados não carregam | Lazy loading, paginação |
| Logout automático | Sessão/JWT configurado |

### Exception Handler - Boa Prática

❌ **Ruim:**
```json
{"error": "Internal Server Error", "timestamp": 123456}
```

✅ **Bom:**
```json
{
  "success": false,
  "error": "Valor inválido. Use formato como R$ 50,00",
  "code": "INVALID_AMOUNT",
  "可操作": "Informe um valor entre R$ 1,00 e R$ 1.000.000,00"
}
```

---

## 7. Quando Executar

| Fase | Tipo | Quandocala |
|------|------|----------|
| MVP | Dogfooding | Equipe usa internamente |
| Pré-lançamento | Moderado (5 users) | 2 semanas antes |
| Pós-lançamento | Contínuo | A cada sprint |

---

## 8. Templates

### Formulário de Feedback Pós-Teste

```
★ AVALIAÇÃO SMARTWALLET

Por favor, avalie de 1 a 5:

1. O app é fácil de usar?
   1 2 3 4 5

2. Você se sentiria seguro usando no dia a dia?
   1 2 3 4 5

3. O que você mais gostou? ________________

4. O que você mudaria? ________________

5. Você recomendaria para um amigo?
   Sim / Talvez / Não

Obrigado! 🙏
```

### Planilha de Gravação

https://docs.google.com/spreadsheets/d/SEU_LINK

| Data | Usuário | Tarefa | Tempo | Cliques | Success | Nota |
|------|--------|--------|-------|-------|--------|------|
| ... | ... | ... | ... | ... | ... | ... |