import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.integration.spec.ts', 'src/**/*.e2e.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/app/app.config.ts',
        'src/app/app.ts'
      ],
      all: true
    },
    passWithNoTests: true
  }
});
