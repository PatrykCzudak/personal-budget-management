"""
SQLAlchemy database models
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer
from sqlalchemy.types import DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    color = Column(String(7), nullable=False)  # Hex color code
    budget = Column(DECIMAL(10, 2), nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    frequency = Column(String(50), nullable=False)  # monthly, weekly, one-time
    date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    category_id = Column(UUID(as_uuid=True), nullable=False)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=datetime.utcnow)

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # akcje, etf, obligacje
    quantity = Column(DECIMAL(15, 8), nullable=False)
    purchase_price = Column(DECIMAL(10, 2), nullable=False)
    current_price = Column(DECIMAL(10, 2), nullable=True)
    purchase_date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=datetime.utcnow)

class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    target_amount = Column(DECIMAL(10, 2), nullable=False)
    current_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    target_date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    category = Column(String(100), nullable=False)
    color = Column(String(7), nullable=False)  # Hex color code
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)