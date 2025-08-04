#!/bin/bash

echo "🛑 Zatrzymywanie aplikacji Personal Budget Management"
echo "================================================="

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose nie jest dostępny."
    exit 1
fi

echo "🔍 Sprawdzanie działających kontenerów..."
if [ "$(docker-compose ps -q)" ]; then
    echo "⏹️  Zatrzymywanie kontenerów..."
    docker-compose down
    
    echo ""
    echo "🧹 Czy chcesz usunąć woluminy danych? (y/N)"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            echo "🗑️  Usuwanie woluminów..."
            docker-compose down -v
            docker volume prune -f
            echo "✅ Woluminy zostały usunięte"
            ;;
        *)
            echo "✅ Woluminy zachowane (dane pozostaną)"
            ;;
    esac
    
    echo ""
    echo "🧹 Czy chcesz usunąć obrazy aplikacji? (y/N)"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            echo "🗑️  Usuwanie obrazów..."
            docker-compose down --rmi local
            echo "✅ Obrazy zostały usunięte"
            ;;
        *)
            echo "✅ Obrazy zachowane (szybsze następne uruchomienie)"
            ;;
    esac
    
else
    echo "ℹ️  Brak działających kontenerów"
fi

echo ""
echo "✅ Aplikacja została zatrzymana"
echo ""
echo "🚀 Aby uruchomić ponownie:"
echo "   ./start.sh"