"""
Database configuration and utilities
"""
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Use the Replit database URL directly
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback for development
    DATABASE_URL = "postgresql://username:password@localhost/database"
    logger.warning("Using fallback DATABASE_URL. Set DATABASE_URL environment variable.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        # Parse DATABASE_URL to get connection parameters
        import urllib.parse as urlparse
        
        parsed = urlparse.urlparse(DATABASE_URL)
        db_name = parsed.path[1:]  # Remove leading slash
        
        logger.info(f"Database connection configured for: {db_name}")
        
        # Test connection
        with engine.connect() as conn:
            logger.info("Database connection successful")
            
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

def init_db():
    """Initialize database tables"""
    try:
        # Import all models to ensure they are registered
        from models import Category, Income, Expense, Investment, SavingsGoal
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise