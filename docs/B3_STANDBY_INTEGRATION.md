# B3 API Standby Integration

Esta integracao deixa as APIs do Banco B3 cadastradas no backend, mas desligadas por padrao.

## Estado atual

- Modo padrao: `STANDBY`
- Nenhuma tela chama essas APIs automaticamente.
- Nenhum fluxo de IA usa essas APIs ainda.
- Endpoints internos ficam protegidos por autenticacao em `/api/b3/**`.
- Tambem estao cadastradas as APIs adicionais de Positions, Orders, Bonds e Collateral.

## Propriedades para ativacao futura

Configure em ambiente seguro antes de ativar:

```properties
smartwallet.b3.enabled=false
smartwallet.b3.environment=standby
smartwallet.b3.base-url=
smartwallet.b3.token-url=
smartwallet.b3.client-id=
smartwallet.b3.client-secret=
smartwallet.b3.access-token=
smartwallet.b3.connect-timeout-ms=5000
smartwallet.b3.read-timeout-ms=15000
```

Quando houver credenciais oficiais, certificados e ambiente liberado pela B3, altere `smartwallet.b3.enabled=true`.

## Endpoints internos preparados

- `GET /api/b3/status`: mostra modo, configuracao e APIs cadastradas.
- `GET /api/b3/catalog`: lista o catalogo de APIs B3.
- `POST /api/b3/proxy`: executa chamada B3 apenas quando a integracao estiver ativa.

## Observacao

As APIs foram cadastradas a partir dos arquivos OpenAPI/JSON enviados. A camada esta pronta para ser conectada futuramente na IA, carteira, renda fixa, conciliacao, custodia e risco, mas permanece sem uso no produto ate voce pedir a ativacao.
