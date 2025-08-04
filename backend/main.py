"""
Personal Budget Management API - FastAPI Application
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import init_db, create_database_if_not_exists
from services.price_service import PriceService

# Make price_service globally available
price_service = PriceService()
from routers import categories, incomes, expenses, investments, savings, ai, prices

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting Personal Budget Management API...")
    
    # Create database if it doesn't exist
    create_database_if_not_exists()
    
    # Initialize database tables
    init_db()
    
    # Start price update scheduler
    price_service.start_scheduler()
    
    # Update prices on startup
    await price_service.update_investment_prices()
    
    logger.info("Application startup completed")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    price_service.stop_scheduler()

# Create FastAPI application
app = FastAPI(
    title="Personal Budget Management API",
    description="Comprehensive financial management with investments and risk analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(incomes.router, prefix="/api", tags=["incomes"])
app.include_router(expenses.router, prefix="/api", tags=["expenses"])
app.include_router(investments.router, prefix="/api", tags=["investments"])
app.include_router(savings.router, prefix="/api", tags=["savings"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(prices.router, prefix="/api", tags=["prices"])

# Health check endpoint
@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Personal Budget Management API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)