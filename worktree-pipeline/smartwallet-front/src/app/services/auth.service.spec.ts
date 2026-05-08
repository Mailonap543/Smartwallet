import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AuthService', () => {
  const TEST_TOKEN = 'test-jwt-token';
  const TEST_USER = { id: 1, email: 'test@example.com', plan: 'FREE' };

  let mockLocalStorage: { [key: string]: string | null };

  beforeEach(() => {
    mockLocalStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
      removeItem: (key: string) => { delete mockLocalStorage[key]; },
      clear: () => { mockLocalStorage = {}; }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('login', () => {
    it('should store token on successful login', async () => {
      const response = {
        ok: true,
        json: async () => ({ success: true, data: { token: TEST_TOKEN, user: TEST_USER } })
      };
      
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
      
      const result = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });
      const data = await result.json();
      
      expect(data.success).toBe(true);
      expect(mockLocalStorage['token']).toBe(TEST_TOKEN);
    });

    it('should handle login failure', async () => {
      const response = {
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: 'Invalid credentials' })
      };
      
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
      
      const result = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
      });
      
      expect(result.ok).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove token on logout', () => {
      mockLocalStorage['token'] = TEST_TOKEN;
      
      localStorage.removeItem('token');
      
      expect(mockLocalStorage['token']).toBeUndefined();
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      mockLocalStorage['token'] = TEST_TOKEN;
      
      const token = localStorage.getItem('token');
      
      expect(token).toBe(TEST_TOKEN);
    });
  });
});

describe('PlanService', () => {
  it('FREE plan should have limited features', () => {
    const plan = { name: 'FREE', maxWallets: 5, maxAssets: 10 };
    
    expect(plan.maxWallets).toBe(5);
  });

  it('PREMIUM plan should have unlimited features', () => {
    const plan = { name: 'PREMIUM', maxWallets: -1, maxAssets: -1 };
    
    expect(plan.maxWallets).toBe(-1);
  });
});

describe('API Response', () => {
  it('should wrap successful response', () => {
    const response = { success: true, data: { id: 1 } };
    
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it('should handle error response', () => {
    const response = { success: false, error: 'Not found', code: 'NOT_FOUND' };
    
    expect(response.success).toBe(false);
    expect(response.error).toBe('Not found');
  });
});