"""
Categories API router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Category
from schemas import CategoryCreate, CategoryUpdate, Category as CategorySchema

router = APIRouter()

@router.get("/categories", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    return db.query(Category).all()

@router.post("/categories", response_model=CategorySchema)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories/{category_id}", response_model=CategorySchema)
def get_category(category_id: str, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/categories/{category_id}", response_model=CategorySchema)
def update_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db)):
    """Update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category.dict(exclude_unset=True).items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db)):
    """Delete a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}