"""
Expenses API router
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Expense
from schemas import ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema

router = APIRouter()

@router.get("/expenses", response_model=List[ExpenseSchema])
def get_expenses(
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month"),
    db: Session = Depends(get_db)
):
    """Get all expenses with optional year/month filtering"""
    query = db.query(Expense)
    
    if year and month:
        # Filter by YYYY-MM format in date string
        date_prefix = f"{year:04d}-{month:02d}"
        query = query.filter(Expense.date.like(f"{date_prefix}%"))
    elif year:
        # Filter by year only
        date_prefix = f"{year:04d}"
        query = query.filter(Expense.date.like(f"{date_prefix}%"))
    
    return query.all()

@router.post("/expenses", response_model=ExpenseSchema)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense"""
    db_expense = Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/expenses/{expense_id}", response_model=ExpenseSchema)
def get_expense(expense_id: str, db: Session = Depends(get_db)):
    """Get a specific expense by ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/expenses/{expense_id}", response_model=ExpenseSchema)
def update_expense(expense_id: str, expense: ExpenseUpdate, db: Session = Depends(get_db)):
    """Update an expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for field, value in expense.dict(exclude_unset=True).items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    """Delete an expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}