"""
Price Service API router
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter()

@router.post("/prices/update")
async def update_prices():
    """Manually trigger price updates for all investments"""
    from services.price_service import PriceService
    service = PriceService()
    await service.update_investment_prices()
    return {"message": "Prices updated successfully"}

@router.get("/prices/search")
async def search_symbols(q: str):
    """Search for stock symbols and company names"""
    from services.price_service import PriceService
    service = PriceService()
    results = await service.search_symbols(q)
    return {"results": results}

@router.get("/prices/stock/{symbol}")
async def get_stock_info(symbol: str):
    """Get detailed stock information"""
    from services.price_service import PriceService
    service = PriceService()
    info = await service.get_stock_info(symbol)
    if not info:
        raise HTTPException(status_code=404, detail="Stock not found")
    return info