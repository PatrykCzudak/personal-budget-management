#!/bin/bash

echo "🚀 Uruchamianie aplikacji Personal Budget Management (Python FastAPI + React)"
echo "=================================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker nie jest uruchomiony. Uruchom Docker i spróbuj ponownie."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose nie jest dostępny. Zainstaluj docker-compose."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Tworzenie pliku .env..."
    cat > .env << EOF
DATABASE_URL=postgresql://budget_user:budget_password@localhost:5432/budget_db
PYTHONPATH=/app

# For production deployment
POSTGRES_DB=budget_db
POSTGRES_USER=budget_user
POSTGRES_PASSWORD=budget_password
EOF
fi

echo "🏗️  Budowanie kontenerów..."
docker-compose build

echo "🚀 Uruchamianie usług..."
docker-compose up -d

echo "⏳ Oczekiwanie na uruchomienie bazy danych..."
sleep 10

# Wait for PostgreSQL to be ready
echo "🔍 Sprawdzanie stanu bazy danych..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec postgres pg_isready -U budget_user -d budget_db >/dev/null 2>&1; then
        echo "✅ Baza danych jest gotowa"
        break
    fi
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Timeout podczas oczekiwania na bazę danych"
    echo "📋 Sprawdzanie logów..."
    docker-compose logs postgres
    exit 1
fi

echo "⏳ Oczekiwanie na uruchomienie backendu..."
sleep 15

# Check if backend is responding
echo "🔍 Sprawdzanie stanu backendu..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:8000/ >/dev/null 2>&1; then
        echo "✅ Backend jest gotowy"
        break
    fi
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Timeout podczas oczekiwania na backend"
    echo "📋 Sprawdzanie logów backendu..."
    docker-compose logs backend
    exit 1
fi

echo "⏳ Oczekiwanie na uruchomienie frontendu..."
sleep 10

# Check if frontend is responding
echo "🔍 Sprawdzanie stanu frontendu..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        echo "✅ Frontend jest gotowy"
        break
    fi
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "⚠️  Frontend może jeszcze się uruchamiać"
    echo "📋 Sprawdzanie logów frontendu..."
    docker-compose logs frontend
fi

echo ""
echo "🎉 Aplikacja została uruchomiona!"
echo "=================================================================="
echo "📱 Frontend (React):     http://localhost:3000"
echo "🔌 Backend API (FastAPI): http://localhost:8000"
echo "🔍 API Docs (Swagger):   http://localhost:8000/docs"
echo "🗃️  PostgreSQL:          localhost:5432"
echo ""
echo "📋 Sprawdzenie statusu kontenerów:"
docker-compose ps

echo ""
echo "📊 Aby zobaczyć logi:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Aby zatrzymać aplikację:"
echo "   ./stop.sh"

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    echo "🌐 Otwieranie przeglądarki..."
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    echo "🌐 Otwieranie przeglądarki..."
    open http://localhost:3000
fi