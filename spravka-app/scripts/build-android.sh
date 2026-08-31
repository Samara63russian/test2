#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building web frontend"
(cd frontend && npm install --silent && npm run build)

echo "==> Syncing Capacitor www"
rm -rf android-app/www
cp -r frontend/dist android-app/www

# Ensure Android platform exists
if [[ ! -d android-app/android ]]; then
  echo "==> Adding Android platform"
  (cd android-app && npx cap add android)
fi

(cd android-app && npx cap sync android)

# Install Android command-line tools if missing
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT ANDROID_HOME="$ANDROID_SDK_ROOT"
mkdir -p "$ANDROID_SDK_ROOT"

if [[ ! -x "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
  echo "==> Installing Android cmdline-tools"
  TMP=$(mktemp -d)
  cd "$TMP"
  curl -fsSL -o cmdtools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q cmdtools.zip
  mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools/latest"
  mv cmdline-tools/* "$ANDROID_SDK_ROOT/cmdline-tools/latest/"
  cd "$ROOT"
fi

YES="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"
yes | "$YES" --sdk_root="$ANDROID_SDK_ROOT" "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/tmp/sdk-install.log 2>&1 || true

# Accept licenses
yes | "$YES" --sdk_root="$ANDROID_SDK_ROOT" --licenses >/tmp/sdk-licenses.log 2>&1 || true

# local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > android-app/android/local.properties

# Allow cleartext HTTP for LAN servers
MANIFEST="android-app/android/app/src/main/AndroidManifest.xml"
if [[ -f "$MANIFEST" ]] && ! grep -q 'usesCleartextTraffic' "$MANIFEST"; then
  sed -i 's/<application/<application android:usesCleartextTraffic="true"/' "$MANIFEST"
fi

echo "==> Building debug APK"
(cd android-app/android && chmod +x gradlew && ./gradlew assembleDebug --no-daemon)

APK="android-app/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ -f "$APK" ]]; then
  mkdir -p "$ROOT/dist"
  cp "$APK" "$ROOT/dist/spravka-debug.apk"
  echo "APK ready: $ROOT/dist/spravka-debug.apk"
  ls -lh "$ROOT/dist/spravka-debug.apk"
else
  echo "APK not found" >&2
  exit 1
fi
