"""
Investments API router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from database import get_db
from models import Investment
from schemas import InvestmentCreate, InvestmentUpdate, Investment as InvestmentSchema

router = APIRouter()

@router.get("/investments", response_model=List[InvestmentSchema])
def get_investments(db: Session = Depends(get_db)):
    """Get all investments"""
    return db.query(Investment).all()

@router.post("/investments", response_model=InvestmentSchema)
def create_investment(investment: InvestmentCreate, db: Session = Depends(get_db)):
    """Create a new investment"""
    db_investment = Investment(**investment.dict())
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment

@router.get("/investments/{investment_id}", response_model=InvestmentSchema)
def get_investment(investment_id: str, db: Session = Depends(get_db)):
    """Get a specific investment by ID"""
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return investment

@router.put("/investments/{investment_id}", response_model=InvestmentSchema)
def update_investment(investment_id: str, investment: InvestmentUpdate, db: Session = Depends(get_db)):
    """Update an investment"""
    db_investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not db_investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    for field, value in investment.dict(exclude_unset=True).items():
        setattr(db_investment, field, value)
    
    db.commit()
    db.refresh(db_investment)
    return db_investment

@router.delete("/investments/{investment_id}")
def delete_investment(investment_id: str, db: Session = Depends(get_db)):
    """Delete an investment"""
    db_investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not db_investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    db.delete(db_investment)
    db.commit()
    return {"message": "Investment deleted successfully"}

@router.get("/portfolio/profit-loss")
def get_portfolio_profit_loss(db: Session = Depends(get_db)):
    """Calculate total portfolio profit/loss"""
    investments = db.query(Investment).all()
    total_profit_loss = Decimal('0.00')
    
    for investment in investments:
        if investment.current_price and investment.purchase_price:
            current_value = investment.current_price * investment.quantity
            purchase_value = investment.purchase_price * investment.quantity
            profit_loss = current_value - purchase_value
            total_profit_loss += profit_loss
    
    return {"totalProfitLoss": float(total_profit_loss)}

@router.get("/investment-sales")
def get_investment_sales(db: Session = Depends(get_db)):
    """Get investment sales (placeholder - returns empty list)"""
    # This endpoint exists for compatibility with frontend
    # Investment sales functionality can be implemented later
    return []