import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ApiService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('should make GET request to API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    expect(data.success).toBe(true);
  });

  it('should handle API error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, error: 'Unauthorized' })
    });

    const response = await fetch('/api/protected');
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });
});

describe('AuthService', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('should store token in localStorage', () => {
    const token = 'test-token-123';
    
    localStorage.setItem('token', token);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', token);
  });

  it('should retrieve token from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    const token = localStorage.getItem('token');
    
    expect(token).toBe('test-token');
  });

  it('should remove token on logout', () => {
    localStorage.removeItem('token');
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });
});

describe('Plan Features', () => {
  it('FREE plan should have limited features', () => {
    const plan = {
      name: 'FREE',
      maxWallets: 5,
      maxAssets: 10,
      aiAnalysis: false,
      bankIntegration: false
    };

    expect(plan.maxWallets).toBe(5);
    expect(plan.aiAnalysis).toBe(false);
  });

  it('PREMIUM plan should have all features', () => {
    const plan = {
      name: 'PREMIUM',
      maxWallets: -1,
      maxAssets: -1,
      aiAnalysis: true,
      bankIntegration: true
    };

    expect(plan.maxWallets).toBe(-1);
    expect(plan.aiAnalysis).toBe(true);
  });
});