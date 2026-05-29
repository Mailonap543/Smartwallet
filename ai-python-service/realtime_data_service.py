import requests
import json
import time
from typing import Dict, List, Optional, Any
from bs4 import BeautifulSoup
import re
from datetime import datetime
import os

class RealTimeDataService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        # Cache for storing recent requests to avoid hitting rate limits
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
        
        # API keys - in production, these should come from environment variables
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        # The user provided API key - we'll use it if needed for specific services
        self.user_provided_api_key = os.getenv("USER_PROVIDED_API_KEY", "")

    def _get_from_cache(self, key: str) -> Optional[Any]:
        """Get item from cache if not expired"""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.cache_timeout:
                return data
            else:
                del self.cache[key]
        return None

    def _save_to_cache(self, key: str, data: Any):
        """Save item to cache"""
        self.cache[key] = (data, time.time())

    def get_asset_data(self, symbol: str) -> Dict[str, Any]:
        """
        Get real-time data for a specific asset symbol
        Tries multiple sources: Yahoo Finance, Investidor10, etc.
        """
        cache_key = f"asset_data_{symbol}"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        # Try Yahoo Finance first (more reliable for programmatic access)
        yahoo_data = self._get_yahoo_finance_data(symbol)
        if yahoo_data and "error" not in yahoo_data:
            self._save_to_cache(cache_key, yahoo_data)
            return yahoo_data

        # Fallback to Investidor10 scraping
        investidor10_data = self._get_investidor10_data(symbol)
        if investidor10_data and "error" not in investidor10_data:
            self._save_to_cache(cache_key, investidor10_data)
            return investidor10_data

        # If all else fails, return basic error
        result = {
            "symbol": symbol,
            "error": "Unable to fetch data from available sources",
            "timestamp": datetime.now().isoformat()
        }
        self._save_to_cache(cache_key, result)
        return result

    def _get_yahoo_finance_data(self, symbol: str) -> Dict[str, Any]:
        """
        Fetch data from Yahoo Finance (works well for Brazilian stocks with .SA suffix)
        """
        try:
            # For Brazilian stocks, add .SA suffix
            yahoo_symbol = f"{symbol}.SA" if not symbol.endswith(".SA") else symbol
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
            
            response = self.session.get(url, timeout=10)
            if response.status_code != 200:
                return {"error": f"Yahoo Finance API returned status {response.status_code}"}
            
            data = response.json()
            
            if "chart" not in data or not data["chart"]["result"]:
                return {"error": "No data found in Yahoo Finance response"}
            
            result = data["chart"]["result"][0]
            meta = result.get("meta", {})
            
            # Get current price
            current_price = meta.get("regularMarketPrice", 0)
            
            # Get previous close for change calculation
            previous_close = meta.get("previousClose", current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close != 0 else 0
            
            # Get additional info
            currency = meta.get("currency", "BRL")
            exchange = meta.get("exchangeName", "")
            
            # Try to get dividend yield and other stats
            dividend_yield = 0
            try:
                # Try to get summary data
                summary_url = f"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{yahoo_symbol}?modules=summaryDetail"
                summary_response = self.session.get(summary_url, timeout=10)
                if summary_response.status_code == 200:
                    summary_data = summary_response.json()
                    if "quoteSummary" in summary_data and summary_data["quoteSummary"]["result"]:
                        summary_result = summary_data["quoteSummary"]["result"][0]
                        dividend_yield_data = summary_result.get("dividendYield", {})
                        if isinstance(dividend_yield_data, dict) and "raw" in dividend_yield_data:
                            dividend_yield = dividend_yield_data["raw"] * 100  # Convert to percentage
            except Exception:
                pass  # Dividend yield is optional
            
            return {
                "symbol": symbol,
                "yahoo_symbol": yahoo_symbol,
                "current_price": current_price,
                "currency": currency,
                "exchange": exchange,
                "change": change,
                "change_percent": change_percent,
                "previous_close": previous_close,
                "dividend_yield": dividend_yield,
                "market_cap": meta.get("marketCap", 0),
                "volume": meta.get("regularMarketVolume", 0),
                "timestamp": datetime.now().isoformat(),
                "source": "Yahoo Finance"
            }
            
        except Exception as e:
            return {"error": f"Failed to fetch Yahoo Finance data: {str(e)}"}

    def _get_investidor10_data(self, symbol: str) -> Dict[str, Any]:
        """
        Fetch data from Investidor10.com.br by scraping
        """
        try:
            # Investidor10 URL pattern for stocks
            url = f"https://investidor10.com.br/acoes/{symbol}/"
            
            response = self.session.get(url, timeout=15)
            if response.status_code != 200:
                return {"error": f"Investidor10 returned status {response.status_code}"}
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract key information
            data = {
                "symbol": symbol,
                "timestamp": datetime.now().isoformat(),
                "source": "Investidor10"
            }
            
            # Try to get current price
            price_element = soup.find("strong", {"class": "price-text-current"})
            if price_element:
                price_text = price_element.get_text().strip()
                # Clean price text (remove R$ and spaces, convert comma to dot)
                price_clean = re.sub(r'[R$\s]', '', price_text).replace(',', '.')
                try:
                    data["current_price"] = float(price_clean)
                except ValueError:
                    data["current_price"] = 0
            
            # Try to get dividend yield
            dy_element = soup.find("small", text=re.compile(r"Dividend Yield", re.I))
            if dy_element:
                parent = dy_element.find_parent("div")
                if parent:
                    value_element = parent.find("strong")
                    if value_element:
                        dy_text = value_element.get_text().strip()
                        dy_clean = re.sub(r'[%\s]', '', dy_text).replace(',', '.')
                        try:
                            data["dividend_yield"] = float(dy_clean)
                        except ValueError:
                            data["dividend_yield"] = 0
            
            # Try to get company name
            name_element = soup.find("h1", {"class": "title"})
            if name_element:
                data["company_name"] = name_element.get_text().strip()
            
            # If we got at least price, consider it successful
            if "current_price" in data and data["current_price"] > 0:
                return data
            else:
                return {"error": "Could not extract sufficient data from Investidor10"}
                
        except Exception as e:
            return {"error": f"Failed to scrape Investidor10: {str(e)}"}

    def get_dividend_yield_rankings(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top dividend yield stocks from Investidor10 rankings page
        """
        cache_key = f"dividend_rankings_{limit}"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            url = "https://investidor10.com.br/acoes/rankings/maiores-dividend-yield/"
            
            response = self.session.get(url, timeout=15)
            if response.status_code != 200:
                return [{"error": f"Investidor10 rankings returned status {response.status_code}"}]
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the table with rankings
            table = soup.find("table", {"class": "table-ranking"})
            if not table:
                # Try alternative selectors
                table = soup.find("table")
                if not table:
                    return [{"error": "Could not find rankings table"}]
            
            rankings = []
            rows = table.find_all("tr")
            
            # Skip header row
            for row in rows[1:limit+1]:  # Get up to 'limit' rows
                cells = row.find_all("td")
                if len(cells) >= 4:
                    try:
                        # Position
                        position = cells[0].get_text().strip()
                        
                        # Stock symbol and name
                        stock_cell = cells[1]
                        stock_link = stock_cell.find("a")
                        if stock_link:
                            symbol_text = stock_link.get_text().strip()
                            # Extract symbol (usually first part before space or hyphen)
                            symbol = symbol_text.split()[0] if symbol_text else ""
                            name = stock_text.replace(symbol, "").strip() if symbol_text else stock_text
                        else:
                            symbol_text = stock_cell.get_text().strip()
                            symbol = symbol_text.split()[0] if symbol_text else ""
                            name = ""
                        
                        # Current price
                        price_text = cells[2].get_text().strip()
                        price_clean = re.sub(r'[R$\s]', '', price_text).replace(',', '.')
                        try:
                            price = float(price_clean)
                        except ValueError:
                            price = 0
                        
                        # Dividend yield
                        dy_text = cells[3].get_text().strip()
                        dy_clean = re.sub(r'[%\s]', '', dy_text).replace(',', '.')
                        try:
                            dividend_yield = float(dy_clean)
                        except ValueError:
                            dividend_yield = 0
                        
                        rankings.append({
                            "position": position,
                            "symbol": symbol,
                            "name": name,
                            "current_price": price,
                            "dividend_yield": dividend_yield,
                            "timestamp": datetime.now().isoformat()
                        })
                    except Exception as e:
                        # Skip problematic rows but continue
                        continue
            
            if rankings:
                self._save_to_cache(cache_key, rankings)
                return rankings
            else:
                return [{"error": "Could not extract rankings data"}]
                
        except Exception as e:
            return [{"error": f"Failed to fetch dividend rankings: {str(e)}"}]

    def get_market_news(self, symbol: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get recent market news, optionally filtered by symbol
        """
        # For simplicity, we'll return some general market news
        # In a real implementation, this would fetch from a news API
        news_items = [
            {
                "title": "Mercado brasileiro aguarda decisão do Copom sobre juros",
                "summary": "Investidores esperam sinalização da política monetária para os próximos meses.",
                "timestamp": datetime.now().isoformat(),
                "source": "Investidor10",
                "relevance": "high"
            },
            {
                "title": "Petrobras anuncia novos investimentos em exploração",
                "summary": "Empresa prevê aumento na produção de petróleo e gás natural.",
                "timestamp": datetime.now().isoformat(),
                "source": "Investidor10",
                "relevance": "medium"
            },
            {
                "title": "Setor de varejo mostra sinais de recuperação",
                "summary": "Vendas no varejo apresentam crescimento mês a mês.",
                "timestamp": datetime.now().isoformat(),
                "source": "Investidor10",
                "relevance": "medium"
            }
        ]
        
        # If symbol is provided, try to get symbol-specific news
        if symbol:
            try:
                url = f"https://investidor10.com.br/acoes/{symbol}/noticias/"
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Extract news items for this symbol
                    news_elements = soup.find_all("div", {"class": "news-item"})
                    symbol_news = []
                    for element in news_elements[:limit]:
                        title_elem = element.find("h3")
                        summary_elem = element.find("p")
                        if title_elem and summary_elem:
                            symbol_news.append({
                                "title": title_elem.get_text().strip(),
                                "summary": summary_elem.get_text().strip(),
                                "timestamp": datetime.now().isoformat(),
                                "source": "Investidor10",
                                "symbol": symbol,
                                "relevance": "high"
                            })
                    if symbol_news:
                        return symbol_news
            except Exception:
                pass  # Fall back to general news
        
        return news_items[:limit]

# Singleton instance
realtime_data_service = RealTimeDataService()