"""
Price Service for fetching real-time stock prices using Yahoo Finance
"""
import yfinance as yf
import asyncio
import logging
from typing import List, Dict, Any, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Investment

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        
    def start_scheduler(self):
        """Start the price update scheduler"""
        # Update prices every 15 minutes during trading hours
        self.scheduler.add_job(
            func=self._scheduled_price_update,
            trigger="interval",
            minutes=15,
            id='price_update',
            replace_existing=True
        )
        self.scheduler.start()
        logger.info("Price update scheduler started")
    
    def stop_scheduler(self):
        """Stop the price update scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Price update scheduler stopped")
    
    def _scheduled_price_update(self):
        """Scheduled price update task"""
        asyncio.run(self.update_investment_prices())
    
    async def update_investment_prices(self):
        """Update prices for all investments in the database"""
        db = SessionLocal()
        try:
            investments = db.query(Investment).all()
            if not investments:
                logger.info("No investments found to update")
                return
            
            logger.info(f"Updating prices for {len(investments)} investments...")
            
            updated_count = 0
            for investment in investments:
                try:
                    ticker = yf.Ticker(investment.symbol)
                    hist = ticker.history(period="1d")
                    
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        investment.current_price = round(float(current_price), 2)
                        updated_count += 1
                        logger.info(f"Updated {investment.symbol}: ${investment.current_price}")
                    else:
                        logger.warning(f"No price data found for {investment.symbol}")
                        
                except Exception as e:
                    logger.error(f"Failed to update price for {investment.symbol}: {e}")
            
            db.commit()
            logger.info(f"Successfully updated {updated_count} investment prices")
            
        except Exception as e:
            logger.error(f"Error updating investment prices: {e}")
            db.rollback()
        finally:
            db.close()
    
    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """Search for stock symbols based on query"""
        try:
            # Use yfinance search functionality
            # This is a simplified implementation - you might want to use a more robust search API
            results = []
            
            # Try to get ticker info directly
            try:
                ticker = yf.Ticker(query.upper())
                info = ticker.info
                
                if info and 'symbol' in info:
                    results.append({
                        'symbol': info.get('symbol', query.upper()),
                        'name': info.get('longName', info.get('shortName', 'Unknown')),
                        'type': 'stock'
                    })
            except:
                pass
            
            # Add some common tickers if query matches
            common_tickers = {
                'AAPL': 'Apple Inc.',
                'GOOGL': 'Alphabet Inc.',
                'MSFT': 'Microsoft Corporation',
                'TSLA': 'Tesla, Inc.',
                'AMZN': 'Amazon.com, Inc.',
                'META': 'Meta Platforms, Inc.',
                'NVDA': 'NVIDIA Corporation',
                'NFLX': 'Netflix, Inc.'
            }
            
            query_upper = query.upper()
            for symbol, name in common_tickers.items():
                if query_upper in symbol or query.lower() in name.lower():
                    if not any(r['symbol'] == symbol for r in results):
                        results.append({
                            'symbol': symbol,
                            'name': name,
                            'type': 'stock'
                        })
            
            return results[:10]  # Limit to 10 results
            
        except Exception as e:
            logger.error(f"Error searching symbols: {e}")
            return []
    
    async def get_stock_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a stock"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="1d")
            
            if not info:
                return None
            
            current_price = None
            if not hist.empty:
                current_price = float(hist['Close'].iloc[-1])
            
            return {
                'symbol': symbol.upper(),
                'name': info.get('longName', info.get('shortName', 'Unknown')),
                'current_price': current_price,
                'currency': info.get('currency', 'USD'),
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                'dividend_yield': info.get('dividendYield'),
                'sector': info.get('sector'),
                'industry': info.get('industry')
            }
            
        except Exception as e:
            logger.error(f"Error getting stock info for {symbol}: {e}")
            return None