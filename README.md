# 🐍 Aplikacja budżetowa

## ✨ Kompletna implementacja

Aplikacja do zarządzania budżetem osobistym w **Python FastAPI**.
Projekt posiada modułową architekturę oraz całkowicie nowy backend.

## 🏗️ Architektura backendu

### Struktura modułowa FastAPI

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

### Metoda 1: automatyczny skrypt
```bash
cd aplikacja_python
python run_local.py
```

### Metoda 2: ręczne uruchomienie

**Backend (Python FastAPI):**
```bash
cd aplikacja_python/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend (React):**
```bash
cd aplikacja_python/frontend
npm install
npm run dev -- --port 3000
```

## 🌐 Dostęp

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Dokumentacja API**: http://localhost:8000/docs

## ⚙️ Kluczowe różnice w porównaniu z Node.js

| Aspekt | Python FastAPI |
|--------|----------------|
| **Język** | Python |
| **Framework** | FastAPI |
| **ORM** | SQLAlchemy |
| **Walidacja** | Pydantic |
| **Struktura** | Modularne routery |
| **Typowanie** | Wskazówki typów w Pythonie |
| **Dokumentacja** | Swagger/OpenAPI |

## 🔧 Moduły backendu

### 1. **Database (database.py)**
- połączenie z PostgreSQL dzięki zmiennej środowiskowej `DATABASE_URL`
- automatyczne tworzenie tabel
- zarządzanie sesjami SQLAlchemy

### 2. **Models (models.py)**
- modele ORM SQLAlchemy z kluczami głównymi UUID
- typ `DECIMAL` do przechowywania kwot finansowych
- relacje pomiędzy tabelami

### 3. **Schemas (schemas.py)**
- modele Pydantic dla zapytań i odpowiedzi
- automatyczna walidacja danych
- bezpieczeństwo typów dla API

### 4. **Routers**
- **Categories**: kategorie budżetowe z limitami i kolorami
- **Incomes**: różne typy przychodów
- **Expenses**: wydatki z filtrowaniem po dacie
- **Investments**: portfel z cenami Yahoo Finance
- **Savings**: cele oszczędnościowe z progresem
- **AI**: analiza portfela i budżetu, kalkulacje VaR
- **Prices**: wyszukiwanie i aktualizacja danych z Yahoo Finance

### 5. **Services**
- **PriceService**: automatyczne aktualizacje co 15 minut
- **AIService**: analizy finansowe i rekomendacje

## 📊 Funkcjonalności

### Zarządzanie budżetem
- ✅ kategorie z limitami i kolorami
- ✅ różne typy przychodów
- ✅ wydatki przypisane do kategorii
- ✅ filtrowanie po miesiącach i latach

### Portfel inwestycyjny
- ✅ akcje, ETF-y i obligacje
- ✅ automatyczne ceny z Yahoo Finance
- ✅ kalkulacja zysków i strat
- ✅ wykresy alokacji

### Analiza ryzyka
- ✅ Value at Risk (VaR) 95% i 99%
- ✅ Expected Shortfall
- ✅ metryki ryzyka portfela
- ✅ scenariusze stress testów

### Asystent AI
- ✅ analiza portfela i rekomendacje
- ✅ analiza budżetu i optymalizacja
- ✅ niestandardowe zapytania
- ✅ inteligentne insighty

## 🗄️ Baza danych

Baza PostgreSQL z automatycznym tworzeniem tabel:

```sql
categories     -- kategorie budżetowe
incomes        -- źródła przychodów
expenses       -- wydatki osobiste
investments    -- pozycje portfela
savings_goals  -- cele oszczędnościowe
```

## 🌍 Integracje

- **Yahoo Finance**: ceny akcji w czasie rzeczywistym
- **PostgreSQL**: trwałe przechowywanie w Replit
- **APScheduler**: automatyczne aktualizacje co 15 minut

## 📚 Dokumentacja API

Po uruchomieniu backendu dokumentacja jest dostępna pod adresem:
http://localhost:8000/docs.  
Swagger umożliwia testowanie wszystkich endpointów bezpośrednio z przeglądarki.

## ✅ Status implementacji

- ✅ **Backend FastAPI**: kompletnie przepisany i modułowy
- ✅ **Wszystkie endpointy**: Categories, Incomes, Expenses, Investments, Savings, AI, Prices
- ✅ **Integracja bazy danych**: SQLAlchemy z PostgreSQL
- ✅ **Konfiguracja frontendu**: React skonfigurowany do współpracy z API
- ✅ **Yahoo Finance**: automatyczne aktualizacje cen
- ✅ **Analiza AI**: analiza portfela i budżetu wraz z kalkulacją VaR

## 🎯 Następne kroki

1. **Uruchom backend**: `python -m uvicorn main:app --port 8000`
2. **Uruchom frontend**: `npm run dev -- --port 3000`
3. **Otwórz aplikację**: http://localhost:3000
4. **Sprawdź dokumentację API**: http://localhost:8000/docs
