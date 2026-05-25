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
});
