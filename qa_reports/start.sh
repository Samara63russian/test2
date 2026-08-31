#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Установка зависимостей backend ==="
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt

echo "=== Установка зависимостей frontend ==="
cd ../frontend
npm install

echo "=== Сборка frontend ==="
npm run build

echo "=== Запуск сервера ==="
cd ../backend
source venv/bin/activate
echo "Сервер: http://localhost:8000"
echo "Логин: admin / admin123"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
