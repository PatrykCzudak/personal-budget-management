#!/usr/bin/env python3
"""
Prosty skrypt do uruchomienia aplikacji Python FastAPI + React frontend
Alternatywa do Docker w środowisku Replit
"""
import subprocess
import time
import sys
import signal
import os
from pathlib import Path

class ApplicationRunner:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = False
    
    def signal_handler(self, signum, frame):
        print("\n\n⚠️  Otrzymano sygnał zatrzymania...")
        self.stop()
        sys.exit(0)
    
    def start_backend(self):
        """Start Python FastAPI backend on port 8000"""
        print("🚀 Uruchamiam backend Python FastAPI...")
        os.chdir("backend")
        
        # Sprawdź czy wszystkie zależności są zainstalowane
        try:
            import fastapi, uvicorn, sqlalchemy
            print("✅ Zależności Python OK")
        except ImportError as e:
            print(f"❌ Brakuje zależności: {e}")
            print("Zainstaluj: pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv yfinance")
            return False
        
        self.backend_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ])
        
        # Czekaj na uruchomienie
        print("⏳ Czekam na uruchomienie backendu...")
        time.sleep(5)
        
        # Test połączenia
        try:
            import requests
            response = requests.get("http://localhost:8000/", timeout=5)
            if response.status_code == 200:
                print("✅ Backend działa na http://localhost:8000")
                return True
        except:
            pass
        
        print("❌ Backend nie odpowiada")
        return False
    
    def start_frontend(self):
        """Start React frontend on port 3000"""
        print("🎨 Uruchamiam frontend React...")
        os.chdir("../frontend")
        
        # Sprawdź czy node_modules istnieją
        if not Path("node_modules").exists():
            print("📦 Instaluję zależności npm...")
            npm_install = subprocess.run(["npm", "install"], capture_output=True, text=True)
            if npm_install.returncode != 0:
                print("❌ Błąd instalacji npm:", npm_install.stderr)
                return False
        
        self.frontend_process = subprocess.Popen([
            "npm", "run", "dev", "--", "--port", "3000"
        ])
        
        print("⏳ Czekam na uruchomienie frontendu...")
        time.sleep(8)
        print("✅ Frontend powinien być dostępny na http://localhost:3000")
        return True
    
    def stop(self):
        """Stop all processes"""
        print("\n🛑 Zatrzymuję aplikację...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
                print("✅ Backend zatrzymany")
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
                print("⚠️  Backend force killed")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
                print("✅ Frontend zatrzymany")
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
                print("⚠️  Frontend force killed")
        
        self.running = False
    
    def run(self):
        """Run the complete application"""
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("🏗️  Uruchamiam Aplikację Budżetową Python...")
        print("=" * 50)
        
        # Start backend
        if not self.start_backend():
            print("❌ Nie udało się uruchomić backendu")
            return
        
        # Start frontend  
        if not self.start_frontend():
            print("❌ Nie udało się uruchomić frontendu")
            self.stop()
            return
        
        self.running = True
        print("\n" + "=" * 50)
        print("🎉 Aplikacja uruchomiona pomyślnie!")
        print("📊 Frontend: http://localhost:3000")
        print("🔌 Backend API: http://localhost:8000")
        print("📖 API Docs: http://localhost:8000/docs")
        print("\n⚠️  Naciśnij Ctrl+C aby zatrzymać")
        print("=" * 50)
        
        # Keep running until stopped
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.stop()

if __name__ == "__main__":
    app = ApplicationRunner()
    app.run()