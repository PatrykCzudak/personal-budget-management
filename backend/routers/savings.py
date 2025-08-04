"""
Savings Goals API router
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import SavingsGoal, SavingsTransaction
from schemas import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoal as SavingsGoalSchema,
    AddSavingsRequest,
    SavingsTransaction as SavingsTransactionSchema,
)

router = APIRouter()

@router.get("/savings-goals", response_model=List[SavingsGoalSchema])
def get_savings_goals(db: Session = Depends(get_db)):
    """Get all savings goals"""
    return db.query(SavingsGoal).all()

@router.post("/savings-goals", response_model=SavingsGoalSchema)
def create_savings_goal(goal: SavingsGoalCreate, db: Session = Depends(get_db)):
    """Create a new savings goal"""
    db_goal = SavingsGoal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/savings-goals/{goal_id}", response_model=SavingsGoalSchema)
def get_savings_goal(goal_id: str, db: Session = Depends(get_db)):
    """Get a specific savings goal by ID"""
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return goal

@router.put("/savings-goals/{goal_id}", response_model=SavingsGoalSchema)
def update_savings_goal(goal_id: str, goal: SavingsGoalUpdate, db: Session = Depends(get_db)):
    """Update a savings goal"""
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    for field, value in goal.dict(exclude_unset=True).items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/savings-goals/{goal_id}")
def delete_savings_goal(goal_id: str, db: Session = Depends(get_db)):
    """Delete a savings goal"""
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    db.delete(db_goal)
    db.commit()
    return {"message": "Savings goal deleted successfully"}

@router.post("/savings-goals/{goal_id}/add", response_model=SavingsGoalSchema)
def add_savings(goal_id: str, request: AddSavingsRequest, db: Session = Depends(get_db)):
    """Add money to a savings goal"""
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    db_goal.current_amount = float(db_goal.current_amount) + float(request.amount)

    # Record savings transaction
    transaction = SavingsTransaction(
        savings_goal_id=goal_id,
        amount=request.amount,
        date=datetime.utcnow().strftime("%Y-%m-%d"),
    )
    db.add(transaction)

    # Check if goal is completed
    if float(db_goal.current_amount) >= float(db_goal.target_amount):
        db_goal.is_completed = True

    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/savings-transactions/{year}/{month}", response_model=List[SavingsTransactionSchema])
def get_savings_transactions(year: int, month: int, db: Session = Depends(get_db)):
    """Get savings transactions for a specific month"""
    start_date = f"{year:04d}-{month:02d}-01"
    end_month = month + 1
    end_year = year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end_date = f"{end_year:04d}-{end_month:02d}-01"

    transactions = (
        db.query(SavingsTransaction)
        .join(SavingsGoal)
        .filter(SavingsTransaction.date >= start_date, SavingsTransaction.date < end_date)
        .all()
    )

    return [
        {
            "id": tx.id,
            "savings_goal_id": tx.savings_goal_id,
            "goal_title": tx.goal.title if tx.goal else "",
            "amount": tx.amount,
            "date": tx.date,
            "created_at": tx.created_at,
        }
        for tx in transactions
    ]
