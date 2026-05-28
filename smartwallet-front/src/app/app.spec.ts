import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { App } from './app';

describe('App', () => {
  it('should expose the root component', () => {
    expect(App).toBeTruthy();
  });

  it('should render the Smartwallet shell', () => {
    const template = readFileSync(join(__dirname, 'app.html'), 'utf8');
    expect(template).toContain('Smartwallet');
  });

  it('should support wallet detail routes without falling back to home', () => {
    const routes = readFileSync(join(__dirname, 'app.routes.ts'), 'utf8');
    expect(routes).toContain("path: 'wallet/:walletId/:tab'");
    expect(routes).toContain("path: 'wallet/:walletId'");
  });

  it('should send dashboard wallet clicks to the assets tab', () => {
    const dashboard = readFileSync(join(__dirname, 'pages/dashboard/dashboard.component.ts'), 'utf8');
    expect(dashboard).toContain("['/wallet', wallet.id, 'assets']");
  });

  it('should send backend asset type values while showing friendly labels', () => {
    const assets = readFileSync(join(__dirname, 'pages/assets/assets.component.ts'), 'utf8');
    expect(assets).toContain("value: 'STOCK', label: 'Ação'");
    expect(assets).toContain("value: 'BOND', label: 'Renda Fixa'");
    expect(assets).toContain('assetType: this.normalizeAssetType(this.assetForm.assetType)');
  });
});
