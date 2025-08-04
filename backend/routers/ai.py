"""
AI Assistant API router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from database import get_db
from services.ai_service import AIService
from schemas import RiskAnalysisResponse, AIAnalysisResponse, CustomQueryRequest

router = APIRouter()
ai_service = AIService()

@router.get("/ai/portfolio-analysis", response_model=AIAnalysisResponse)
def get_portfolio_analysis(db: Session = Depends(get_db)):
    """Get AI portfolio analysis"""
    return ai_service.analyze_portfolio(db)

@router.get("/ai/budget-analysis", response_model=AIAnalysisResponse)
def get_budget_analysis(db: Session = Depends(get_db)):
    """Get AI budget analysis"""
    return ai_service.analyze_budget(db)

@router.post("/ai/custom-query")
def custom_ai_query(request: CustomQueryRequest, db: Session = Depends(get_db)):
    """Process custom AI query"""
    response = ai_service.generate_custom_analysis(request.query, db)
    return {"response": response}

@router.get("/ai/risk-analysis", response_model=RiskAnalysisResponse)
def get_risk_analysis(db: Session = Depends(get_db)):
    """Get comprehensive risk analysis with VaR calculations"""
    from models import Investment
    
    investments = db.query(Investment).all()
    
    if not investments:
        return RiskAnalysisResponse(
            var_95=0.0,
            var_99=0.0,
            expected_shortfall_95=0.0,
            expected_shortfall_99=0.0,
            returns_data=[],
            recommendations=["Brak danych do analizy ryzyka"]
        )
    
    # Calculate simple returns based on investments
    returns = []
    for inv in investments:
        if inv.current_price is not None and inv.purchase_price is not None:
            current = float(inv.current_price) if inv.current_price else 0
            purchase = float(inv.purchase_price) if inv.purchase_price else 1
            if purchase > 0:
                return_rate = (current - purchase) / purchase
                returns.append(return_rate)
    
    if not returns:
        return RiskAnalysisResponse(
            var_95=0.0,
            var_99=0.0,
            expected_shortfall_95=0.0,
            expected_shortfall_99=0.0,
            returns_data=[],
            recommendations=["Brak aktualnych cen do analizy ryzyka"]
        )
    
    var_95 = ai_service.calculate_var(returns, 0.95)
    var_99 = ai_service.calculate_var(returns, 0.99)
    
    return RiskAnalysisResponse(
        var_95=var_95["var"],
        var_99=var_99["var"],
        expected_shortfall_95=var_95["expected_shortfall"],
        expected_shortfall_99=var_99["expected_shortfall"],
        returns_data=returns,
        recommendations=[
            "Analiza VaR oparta na obecnych pozycjach",
            "Rozważ dywersyfikację dla zmniejszenia ryzyka"
        ]
    )