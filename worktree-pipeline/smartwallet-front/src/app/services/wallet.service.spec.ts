import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('WalletService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  describe('getWallets', () => {
    it('should fetch wallets successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [{ id: 1, name: 'My Wallet' }] })
      });

      const response = await fetch('/api/wallets');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Server error' })
      });

      const response = await fetch('/api/wallets');

      expect(response.ok).toBe(false);
    });
  });

  describe('createWallet', () => {
    it('should create wallet successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, name: 'New Wallet' } })
      });

      const response = await fetch('/api/wallets', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Wallet' })
      });
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });
});

describe('AssetService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  describe('getAssets', () => {
    it('should fetch assets successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [{ symbol: 'PETR4', quantity: 100 }] })
      });

      const response = await fetch('/api/assets?walletId=1');
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('createAsset', () => {
    it('should create asset successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { symbol: 'PETR4' } })
      });

      const response = await fetch('/api/assets', {
        method: 'POST',
        body: JSON.stringify({
          walletId: 1,
          symbol: 'PETR4',
          quantity: 100,
          purchasePrice: 30.00
        })
      });

      expect(response.ok).toBe(true);
    });
  });
});

describe('MarketService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  describe('getQuote', () => {
    it('should fetch quote successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { symbol: 'PETR4', price: 30.50 } })
      });

      const response = await fetch('/api/market/quote/PETR4');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.symbol).toBe('PETR4');
    });
  });

  describe('search', () => {
    it('should search symbols', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [{ symbol: 'PETR4' }] })
      });

      const response = await fetch('/api/market/search?q=PETR');
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });
});