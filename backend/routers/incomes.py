"""
Incomes API router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Income
from schemas import IncomeCreate, IncomeUpdate, Income as IncomeSchema

router = APIRouter()

@router.get("/incomes", response_model=List[IncomeSchema])
def get_incomes(db: Session = Depends(get_db)):
    """Get all incomes"""
    return db.query(Income).all()

@router.post("/incomes", response_model=IncomeSchema)
def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    """Create a new income"""
    db_income = Income(**income.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@router.get("/incomes/{income_id}", response_model=IncomeSchema)
def get_income(income_id: str, db: Session = Depends(get_db)):
    """Get a specific income by ID"""
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income

@router.put("/incomes/{income_id}", response_model=IncomeSchema)
def update_income(income_id: str, income: IncomeUpdate, db: Session = Depends(get_db)):
    """Update an income"""
    db_income = db.query(Income).filter(Income.id == income_id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    for field, value in income.dict(exclude_unset=True).items():
        setattr(db_income, field, value)
    
    db.commit()
    db.refresh(db_income)
    return db_income

@router.delete("/incomes/{income_id}")
def delete_income(income_id: str, db: Session = Depends(get_db)):
    """Delete an income"""
    db_income = db.query(Income).filter(Income.id == income_id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    db.delete(db_income)
    db.commit()
    return {"message": "Income deleted successfully"}