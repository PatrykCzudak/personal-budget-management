"""
Savings Goals API router
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import SavingsGoal
from schemas import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoal as SavingsGoalSchema, AddSavingsRequest

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
    
    # Check if goal is completed
    if float(db_goal.current_amount) >= float(db_goal.target_amount):
        db_goal.is_completed = True
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/savings-transactions/{year}/{month}")
def get_savings_transactions(year: int, month: int, db: Session = Depends(get_db)):
    """Get savings transactions for a specific month (placeholder)"""
    # This endpoint exists for compatibility with frontend
    # Savings transactions functionality can be implemented later
    return []