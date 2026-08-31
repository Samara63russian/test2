#!/bin/bash
set -e

cd "$(dirname "$0")/frontend"

if [ -z "$1" ]; then
  echo "Использование: ./build-android.sh <URL_СЕРВЕРА>"
  echo "Пример: ./build-android.sh http://192.168.1.100:8000"
  exit 1
fi

SERVER_URL="$1"

echo "=== Сборка frontend с API: $SERVER_URL ==="
VITE_API_URL="${SERVER_URL}/api" npm run build

echo "=== Инициализация Capacitor Android ==="
if [ ! -d "android" ]; then
  npx cap add android
fi

npx cap sync android

echo ""
echo "=== Для сборки APK выполните: ==="
echo "  cd frontend/android"
echo "  ./gradlew assembleDebug"
echo ""
echo "APK будет в: frontend/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Или откройте в Android Studio:"
echo "  npx cap open android"
