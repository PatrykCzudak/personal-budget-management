# 🐍 Aplikacja Budżetowa Python FastAPI

## ✨ Kompletna implementacja 

Aplikacja zarządzania budżetem osobistym przepisana z Node.js/Express na **Python FastAPI** z modułową architekturą i całkowicie nowym backendem.

## 🏗️ Architektura Backend

### Struktura modułowa Python FastAPI

```
backend/
├── main.py              # Główny punkt wejścia aplikacji
├── database.py          # Konfiguracja PostgreSQL i sesje
├── models.py            # Modele SQLAlchemy z właściwymi typami
├── schemas.py           # Walidacja Pydantic dla API
├── requirements.txt     # Zależności Python
├── routers/            # Rozdzielone endpointy API
│   ├── categories.py   # CRUD kategorii budżetowych  
│   ├── incomes.py      # Zarządzanie przychodami
│   ├── expenses.py     # Wydatki z filtrowaniem
│   ├── investments.py  # Portfel inwestycyjny
│   ├── savings.py      # Cele oszczędnościowe
│   ├── ai.py          # Asystent AI i analiza ryzyka
│   └── prices.py      # Yahoo Finance integracja
└── services/          # Logika biznesowa
    ├── price_service.py # Automatyczne aktualizacje cen
    └── ai_service.py    # Analiza AI i VaR calculations
```

## 🚀 Uruchomienie aplikacji

### Metoda 1: Automatyczny skrypt
```bash
cd aplikacja_python
python run_local.py
```

### Metoda 2: Ręczne uruchomienie

**Backend Python FastAPI:**
```bash
cd aplikacja_python/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend React:**
```bash
cd aplikacja_python/frontend  
npm install
npm run dev -- --port 3000
```

## 🌐 Dostęp

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Dokumentacja API**: http://localhost:8000/docs

## ⚙️ Kluczowe różnice vs Node.js

| Aspekt | Node.js/Express | Python FastAPI |
|--------|----------------|----------------|  
| **Język** | TypeScript | Python |
| **Framework** | Express.js | FastAPI |
| **ORM** | Drizzle | SQLAlchemy |
| **Walidacja** | Zod | Pydantic |
| **Struktura** | Monolityczne routy | Modularne routery |
| **Typy** | TypeScript | Python type hints |
| **Auto docs** | Brak | Swagger/OpenAPI |

## 🔧 Moduły Backend

### 1. **Database (database.py)**
- PostgreSQL połączenie z Replit DATABASE_URL
- Automatyczne tworzenie tabel
- Session management dla SQLAlchemy

### 2. **Models (models.py)** 
- SQLAlchemy ORM z UUID primary keys
- DECIMAL typy dla kwot finansowych
- Relacje między tabelami

### 3. **Schemas (schemas.py)**
- Pydantic modele dla request/response
- Automatyczna walidacja danych
- Type safety dla API

### 4. **Routers**
- **Categories**: Kategorie z budżetami i kolorami
- **Incomes**: Przychody (miesięczne, jednorazowe)
- **Expenses**: Wydatki z filtrowaniem po dacie
- **Investments**: Portfel z Yahoo Finance cenami
- **Savings**: Cele oszczędnościowe z progressem
- **AI**: Analiza portfela, budżetu, VaR calculations
- **Prices**: Yahoo Finance search i aktualizacje

### 5. **Services**
- **PriceService**: Automatyczne aktualizacje co 15 min
- **AIService**: Analiza finansowa i rekomendacje

## 📊 Funkcjonalności

### Zarządzanie budżetem
- ✅ Kategorie z limitami i kolorami
- ✅ Przychody różnych typów
- ✅ Wydatki z przypisaniem do kategorii  
- ✅ Filtrowanie po miesiącach i latach

### Portfel inwestycyjny
- ✅ Akcje, ETF, obligacje
- ✅ Automatyczne ceny z Yahoo Finance
- ✅ Kalkulacja zysków/strat
- ✅ Wykresy alokacji

### Analiza ryzyka  
- ✅ Value at Risk (VaR) 95% i 99%
- ✅ Expected Shortfall
- ✅ Metryki ryzyka portfela
- ✅ Stress testing scenariusze

### Asystent AI
- ✅ Analiza portfela i rekomendacje
- ✅ Analiza budżetu i optymalizacja  
- ✅ Niestandardowe zapytania
- ✅ Inteligentne insights

## 🗄️ Baza danych

Używa tej samej bazy PostgreSQL co wersja Node.js z automatycznym tworzeniem tabel:

```sql
categories     -- kategorie budżetowe
incomes        -- źródła przychodów  
expenses       -- wydatki osobiste
investments    -- pozycje portfela
savings_goals  -- cele oszczędnościowe
```

## 🌍 Integracje

- **Yahoo Finance**: Ceny akcji w czasie rzeczywistym
- **PostgreSQL**: Trwałe przechowywanie w Replit
- **APScheduler**: Automatyczne aktualizacje co 15 minut

## 📚 Dokumentacja API

Po uruchomieniu backendu dostępna pod: http://localhost:8000/docs

Automatyczna dokumentacja Swagger z możliwością testowania wszystkich endpointów.

## ✅ Status implementacji

- ✅ **Backend FastAPI**: Kompletnie przepisany z modułową architekturą
- ✅ **Wszystkie endpointy**: Categories, Incomes, Expenses, Investments, Savings, AI, Prices  
- ✅ **Database integration**: SQLAlchemy z PostgreSQL
- ✅ **Frontend configuration**: React skonfigurowany dla Python API
- ✅ **Yahoo Finance**: Automatyczne aktualizacje cen
- ✅ **AI Analysis**: Portfolio i budget analysis z VaR calculations

## 🎯 Następne kroki

1. **Uruchom backend**: `python -m uvicorn main:app --port 8000`
2. **Uruchom frontend**: `npm run dev -- --port 3000`  
3. **Otwórz aplikację**: http://localhost:3000
4. **Sprawdź API docs**: http://localhost:8000/docs

Aplikacja Python jest gotowa do użycia z identyczną funkcjonalnością co wersja Node.js, ale z nowoczesną architekturą FastAPI.