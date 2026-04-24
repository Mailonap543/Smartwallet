# Guia de Testes - Frontend Smartwallet

## Stack de Testes

- **Framework**: Vitest 4.0.8
- **Ambiente**: jsdom
- **Test Runner**: Angular Testing Library
- **Cobertura**: v8 (integrado ao Vitest)

## Scripts Disponíveis

### Modo Desenvolvimento
```bash
npm run test          # Watch mode - ideal para TDD
npm run test:watch    # Alias para watch mode
```

### Modo CI/Produção
```bash
npm run test:ci       # Executa testes com cobertura (CI)
```

### Build
```bash
npm run build         # Build de produção
npm run watch         # Build em modo desenvolvimento
```

## Configuração

### vitest.config.ts

```typescript
{
  environment: 'jsdom',
  globals: true,  // Não precisa importar funções do Vitest
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    reportsDirectory: 'coverage'
  }
}
```

## Escrevendo Testes

### Exemplo Básico

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MeuComponent } from './meu.component';

describe('MeuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuComponent],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(MeuComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
```

### Testando Serviços

```typescript
import { TestBed } from '@angular/core/testing';
import { MeuService } from './meu.service';

describe('MeuService', () => {
  let service: MeuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeuService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve retornar dados', () => {
    const dados = service.getDados();
    expect(dados).toEqual([...]);
  });
});
```

### Testando Componentes com Template

```typescript
import { ComponentFixture } from '@angular/core/testing';

describe('MeuComponent', () => {
  let fixture: ComponentFixture<MeuComponent>;

  it('deve renderizar título', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Olá');
  });
});
```

## Cobertura de Código

### Gerar Relatório de Cobertura

```bash
npm run test:ci
```

Isso gera os seguintes relatórios em `coverage/`:
- `index.html` - Relatório visual principal
- `lcov.info` - Formato LCOV (para SonarQube/Codecov)
- `coverage-final.json` - Formato JSON

### Interpretar Resultados

```
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |    80.5 |     72.5 |    85.0 |    81.2 |                   
 app.ts    |     100 |      100 |     100 |     100 |                   
 service.ts|    65.0 |     50.0 |    70.0 |    66.7 | 25,47,89          
-----------|---------|----------|---------|---------|-------------------
```

- **Stmts**: Statements (linhas de código executadas)
- **Branch**: Condições (if/else, switch)
- **Funcs**: Funções/metodos
- **Lines**: Linhas de código

## Boas Práticas

1. **Teste Comportamento, Não Implementação**
   - Foque no que o componente faz, não em como faz
   - Evite testar métodos privados

2. **Padrão AAA (Arrange, Act, Assert)**
   ```typescript
   it('deve somar dois números', () => {
     // Arrange
     const a = 2;
     const b = 3;
     
     // Act
     const resultado = somar(a, b);
     
     // Assert
     expect(resultado).toBe(5);
   });
   ```

3. **Nomes Descritivos**
   - ❌ `it('testa login')`
   - ✅ `it('deve fazer login com credenciais válidas')`

4. **Um Assert por Teste**
   - Mantém os testes focados e fáceis de debugar

5. **Limpeza Após Testes**
   ```typescript
   afterEach(() => {
     // Limpar mocks, subscriptions, etc.
   });
   ```

## Troubleshooting

### Testes não encontram módulos
```bash
npm ci  # Reinstala dependências
```

### Cobertura não é gerada
Verifique se `vitest.config.ts` tem:
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov']
}
```

### Erro de ambiente
```typescript
// No vitest.config.ts
environment: 'jsdom'
```

## Integração com CI/CD

Os testes são executados automaticamente no GitHub Actions:
- Branch push (main, develop)
- Pull requests
- Requisito: 80% de cobertura mínima

## Ferramentas Úteis

- **Chrome DevTools**: Debug de testes Vitest
- **Coverage Tab**: Visualizar linhas não cobertas
- **Watch Mode**: Desenvolvimento guiado por testes (TDD)

## Links Úteis

- [Documentação Vitest](https://vitest.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Testing Library](https://testing-library.com/)