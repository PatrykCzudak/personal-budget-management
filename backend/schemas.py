"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from uuid import UUID

def to_camel(string: str) -> str:
    """Convert snake_case strings to camelCase."""
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    """Base model that outputs camelCase keys."""

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = to_camel


# Category schemas
class CategoryBase(CamelModel):
    name: str
    color: str
    budget: Decimal

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CamelModel):
    name: Optional[str] = None
    color: Optional[str] = None
    budget: Optional[Decimal] = None

class Category(CategoryBase):
    id: UUID
    created_at: datetime

# Income schemas
class IncomeBase(CamelModel):
    name: str
    amount: Decimal
    frequency: str
    date: str

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(CamelModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[str] = None
    date: Optional[str] = None

class Income(IncomeBase):
    id: UUID
    created_at: datetime

# Expense schemas
class ExpenseBase(CamelModel):
    description: str
    amount: Decimal
    category_id: UUID
    date: str

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(CamelModel):
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    category_id: Optional[UUID] = None
    date: Optional[str] = None

class Expense(ExpenseBase):
    id: UUID
    created_at: datetime

# Investment schemas
class InvestmentBase(CamelModel):
    symbol: str
    name: str
    type: str
    quantity: Decimal
    purchase_price: Decimal
    purchase_date: str

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(CamelModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    current_price: Optional[Decimal] = None
    purchase_date: Optional[str] = None

class Investment(InvestmentBase):
    id: UUID
    current_price: Optional[Decimal]
    created_at: datetime

# Savings Goal schemas
class SavingsGoalBase(CamelModel):
    title: str
    target_amount: Decimal
    target_date: str
    category: str
    color: str

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(CamelModel):
    title: Optional[str] = None
    target_amount: Optional[Decimal] = None
    current_amount: Optional[Decimal] = None
    target_date: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    is_completed: Optional[bool] = None

class SavingsGoal(SavingsGoalBase):
    id: UUID
    current_amount: Decimal
    is_completed: bool
    created_at: datetime

class AddSavingsRequest(CamelModel):
    amount: Decimal = Field(..., gt=0, description="Amount to add to savings goal")

# AI and analysis schemas
class RiskAnalysisResponse(CamelModel):
    var_95: float
    var_99: float
    expected_shortfall_95: float
    expected_shortfall_99: float
    returns_data: list[float]
    recommendations: list[str]

class AIAnalysisResponse(CamelModel):
    analysis: str
    recommendations: list[str]
    key_metrics: dict

class CustomQueryRequest(CamelModel):
    query: str
