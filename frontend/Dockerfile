FROM node:18-alpine AS builder

WORKDIR /app

# Kopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności
RUN npm ci

# Kopiuj resztę kodu frontendu
COPY . .

# W produkcyjnym kontenerze frontend łączy się z usługą backend.
# Używamy nazwy usługi Docker Compose, aby zapewnić prawidłową komunikację
# między kontenerami, gdy aplikacja jest uruchomiona w środowisku produkcyjnym.
ENV VITE_API_BASE="http://localhost:8000"

# Zbuduj aplikację (plik wyjściowy w /app/dist)
RUN npm run build

# Etap produkcyjny - serwowanie statyczne przez nginx
FROM nginx:alpine

# Kopiuj z etapu budowania gotowe pliki statyczne do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiuj własną konfigurację nginx (jeśli potrzebna, np. dla SPA history mode)
# Używamy katalogu conf.d, aby zachować domyślny nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
