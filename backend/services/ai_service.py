"""
AI Service for financial analysis and recommendations
"""
import logging
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models import Investment, Category, Expense, Income, SavingsGoal
from schemas import AIAnalysisResponse

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        pass
    
    def analyze_portfolio(self, db: Session) -> AIAnalysisResponse:
        """Analyze investment portfolio and provide insights"""
        try:
            investments = db.query(Investment).all()
            
            if not investments:
                return AIAnalysisResponse(
                    analysis="Brak inwestycji w portfelu do analizy.",
                    recommendations=["Rozpocznij inwestowanie dodając pierwsze pozycje do portfela"],
                    key_metrics={}
                )
            
            # Calculate basic metrics
            total_value = 0
            total_cost = 0
            types_count = {}
            
            for inv in investments:
                current_value = float(inv.current_price or 0) * float(inv.quantity)
                purchase_value = float(inv.purchase_price) * float(inv.quantity)
                
                total_value += current_value
                total_cost += purchase_value
                
                inv_type = inv.type
                types_count[inv_type] = types_count.get(inv_type, 0) + 1
            
            total_return = total_value - total_cost
            return_percentage = (total_return / total_cost * 100) if total_cost > 0 else 0
            
            # Generate analysis
            analysis = f"""
            Analiza portfela inwestycyjnego:
            
            📊 Wartość portfela: ${total_value:,.2f}
            💰 Koszt zakupu: ${total_cost:,.2f}
            📈 Zysk/Strata: ${total_return:,.2f} ({return_percentage:+.2f}%)
            
            🏗️ Struktura portfela:
            {chr(10).join([f"• {typ}: {count} pozycji" for typ, count in types_count.items()])}
            
            Portfel zawiera {len(investments)} pozycji o łącznej wartości ${total_value:,.2f}.
            """
            
            # Generate recommendations
            recommendations = []
            
            if len(investments) < 5:
                recommendations.append("Rozważ większą dywersyfikację - dodaj więcej pozycji")
            
            if return_percentage < -10:
                recommendations.append("Portfel generuje znaczne straty - przeanalizuj pozycje")
            elif return_percentage > 20:
                recommendations.append("Portfel osiąga doskonałe wyniki - rozważ realizację zysków")
            
            if len(types_count) == 1:
                recommendations.append("Portfel nie jest zdywersyfikowany - dodaj różne typy aktywów")
            
            key_metrics = {
                "total_value": total_value,
                "total_return": total_return,
                "return_percentage": return_percentage,
                "positions_count": len(investments),
                "asset_types": len(types_count)
            }
            
            return AIAnalysisResponse(
                analysis=analysis.strip(),
                recommendations=recommendations,
                key_metrics=key_metrics
            )
            
        except Exception as e:
            logger.error(f"Error in portfolio analysis: {e}")
            return AIAnalysisResponse(
                analysis="Wystąpił błąd podczas analizy portfela.",
                recommendations=["Sprawdź dane portfela i spróbuj ponownie"],
                key_metrics={}
            )
    
    def analyze_budget(self, db: Session) -> AIAnalysisResponse:
        """Analyze budget and spending patterns"""
        try:
            categories = db.query(Category).all()
            expenses = db.query(Expense).all()
            incomes = db.query(Income).all()
            
            if not categories or not expenses:
                return AIAnalysisResponse(
                    analysis="Brak wystarczających danych do analizy budżetu.",
                    recommendations=["Dodaj kategorie i wydatki aby rozpocząć analizę budżetu"],
                    key_metrics={}
                )
            
            # Calculate spending by category
            category_spending = {}
            category_budgets = {}
            
            for category in categories:
                category_budgets[str(category.id)] = float(category.budget)
                category_spending[str(category.id)] = 0
            
            total_expenses = 0
            for expense in expenses:
                amount = float(expense.amount)
                total_expenses += amount
                cat_id = str(expense.category_id)
                if cat_id in category_spending:
                    category_spending[cat_id] += amount
            
            # Calculate total income
            total_income = sum(float(income.amount) for income in incomes)
            
            # Generate analysis
            analysis = f"""
            Analiza budżetu:
            
            💰 Łączne przychody: ${total_income:,.2f}
            🛒 Łączne wydatki: ${total_expenses:,.2f}
            📊 Saldo: ${total_income - total_expenses:,.2f}
            
            📈 Wykorzystanie budżetu:
            """
            
            recommendations = []
            over_budget_categories = []
            
            for cat_id, budget in category_budgets.items():
                spent = category_spending.get(cat_id, 0)
                if budget > 0:
                    usage_pct = (spent / budget) * 100
                    cat_name = next((c.name for c in categories if str(c.id) == cat_id), "Nieznana")
                    analysis += f"\n• {cat_name}: ${spent:.2f} / ${budget:.2f} ({usage_pct:.1f}%)"
                    
                    if usage_pct > 100:
                        over_budget_categories.append(cat_name)
            
            # Generate recommendations
            if over_budget_categories:
                recommendations.append(f"Przekroczono budżet w kategoriach: {', '.join(over_budget_categories)}")
            
            if total_expenses > total_income:
                recommendations.append("Wydatki przewyższają przychody - rozważ cięcia kosztów")
            elif total_income - total_expenses > total_income * 0.3:
                recommendations.append("Doskonałe zarządzanie budżetem - rozważ zwiększenie oszczędności")
            
            if len(expenses) < 10:
                recommendations.append("Śledź więcej wydatków dla lepszej analizy budżetu")
            
            key_metrics = {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "balance": total_income - total_expenses,
                "categories_count": len(categories),
                "expenses_count": len(expenses)
            }
            
            return AIAnalysisResponse(
                analysis=analysis.strip(),
                recommendations=recommendations,
                key_metrics=key_metrics
            )
            
        except Exception as e:
            logger.error(f"Error in budget analysis: {e}")
            return AIAnalysisResponse(
                analysis="Wystąpił błąd podczas analizy budżetu.",
                recommendations=["Sprawdź dane budżetu i spróbuj ponownie"],
                key_metrics={}
            )
    
    def generate_custom_analysis(self, query: str, db: Session) -> str:
        """Generate custom analysis based on user query"""
        try:
            # Simple keyword-based responses
            query_lower = query.lower()
            
            if "inwestycje" in query_lower or "portfel" in query_lower:
                investments = db.query(Investment).all()
                if investments:
                    return f"Masz {len(investments)} pozycji inwestycyjnych w portfelu. Czy chcesz przeprowadzić szczegółową analizę?"
                else:
                    return "Nie masz jeszcze żadnych inwestycji. Rozważ rozpoczęcie inwestowania."
            
            elif "budżet" in query_lower or "wydatki" in query_lower:
                expenses = db.query(Expense).all()
                if expenses:
                    total = sum(float(e.amount) for e in expenses)
                    return f"Łącznie masz {len(expenses)} wydatków o wartości ${total:,.2f}. Mogę pomóc w analizie kategorii."
                else:
                    return "Nie masz jeszcze żadnych wydatków do analizy."
            
            elif "oszczędności" in query_lower or "cele" in query_lower:
                goals = db.query(SavingsGoal).all()
                if goals:
                    completed = sum(1 for g in goals if g.is_completed)
                    return f"Masz {len(goals)} celów oszczędnościowych, z czego {completed} zostało osiągniętych."
                else:
                    return "Nie masz jeszcze celów oszczędnościowych. Rozważ ich utworzenie."
            
            else:
                return "Mogę pomóc w analizie Twojego portfela inwestycyjnego, budżetu i celów oszczędnościowych. O czym chciałbyś się dowiedzieć?"
            
        except Exception as e:
            logger.error(f"Error in custom analysis: {e}")
            return "Wystąpił błąd podczas generowania analizy. Spróbuj ponownie."
    
    def calculate_var(self, returns: List[float], confidence_level: float) -> Dict[str, float]:
        """Calculate Value at Risk (VaR) and Expected Shortfall"""
        try:
            if not returns:
                return {"var": 0.0, "expected_shortfall": 0.0}
            
            returns_array = np.array(returns)
            
            # Calculate VaR
            var_percentile = (1 - confidence_level) * 100
            var = np.percentile(returns_array, var_percentile)
            
            # Calculate Expected Shortfall (conditional VaR)
            tail_losses = returns_array[returns_array <= var]
            expected_shortfall = np.mean(tail_losses) if len(tail_losses) > 0 else var
            
            return {
                "var": float(var),
                "expected_shortfall": float(expected_shortfall)
            }
            
        except Exception as e:
            logger.error(f"Error calculating VaR: {e}")
            return {"var": 0.0, "expected_shortfall": 0.0}