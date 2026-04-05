import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/test';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.integration.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/app/app.config.ts'
      ]
    }
  }
});