#!/usr/bin/env bash
set -euo pipefail
SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$SDK_ROOT"
export ANDROID_HOME="$SDK_ROOT"
mkdir -p "$SDK_ROOT/cmdline-tools"

if [[ ! -x "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
  echo "Installing Android command-line tools..."
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/tools.zip" https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q "$tmp/tools.zip" -d "$tmp"
  mkdir -p "$SDK_ROOT/cmdline-tools/latest"
  mv "$tmp/cmdline-tools/"* "$SDK_ROOT/cmdline-tools/latest/"
  rm -rf "$tmp"
fi

yes | "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_ROOT" --licenses >/dev/null
"$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_ROOT" \
  "platform-tools" "platforms;android-34" "build-tools;34.0.0"

if ! command -v gradle >/dev/null 2>&1; then
  GDIR="$HOME/gradle-8.7"
  if [[ ! -x "$GDIR/bin/gradle" ]]; then
    tmp="$(mktemp -d)"
    curl -fsSL -o "$tmp/gradle.zip" https://services.gradle.org/distributions/gradle-8.7-bin.zip
    unzip -q "$tmp/gradle.zip" -d "$HOME"
    rm -rf "$tmp"
  fi
  export PATH="$HOME/gradle-8.7/bin:$PATH"
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "sdk.dir=$SDK_ROOT" > "$ROOT/android/local.properties"
cd "$ROOT/android"
gradle assembleDebug --no-daemon
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
echo "APK: $APK"
