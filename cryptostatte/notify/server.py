#!/usr/bin/env python3
"""CryptoStatte visit notifier. Token is read from the environment, never from the site JS."""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = int(os.environ.get("NOTIFY_PORT", "8787"))
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHANNEL = os.environ.get("TELEGRAM_CHANNEL", "@CryptoStatte").strip()
COOLDOWN_SEC = int(os.environ.get("NOTIFY_COOLDOWN", "1200"))
CHATS_PATH = Path(os.environ.get("NOTIFY_CHATS", "/opt/cryptostatte-notify/chats.json"))

_recent: dict[str, float] = {}
_lock = threading.Lock()
_offset = 0


def load_chats() -> list[int]:
    try:
        data = json.loads(CHATS_PATH.read_text(encoding="utf-8"))
        return [int(x) for x in data if str(x).lstrip("-").isdigit()]
    except (OSError, ValueError, json.JSONDecodeError):
        return []


def save_chat(chat_id: int) -> None:
    with _lock:
        chats = load_chats()
        if chat_id not in chats:
            chats.append(chat_id)
            CHATS_PATH.parent.mkdir(parents=True, exist_ok=True)
            CHATS_PATH.write_text(json.dumps(chats), encoding="utf-8")


def telegram(method: str, payload: dict) -> dict:
    if not TOKEN:
        return {"ok": False, "description": "no token"}
    url = f"https://api.telegram.org/bot{TOKEN}/{method}"
    body = urllib.parse.urlencode(payload).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        try:
            return json.loads(exc.read().decode())
        except Exception:
            return {"ok": False, "description": str(exc)}
    except Exception as exc:
        return {"ok": False, "description": str(exc)}


def send_text(chat_id, text: str) -> dict:
    return telegram(
        "sendMessage",
        {
            "chat_id": str(chat_id),
            "text": text,
            "disable_web_page_preview": "true",
        },
    )


def parse_device(ua: str) -> tuple[str, str, str]:
    raw = ua or ""
    low = raw.lower()
    if "iphone" in low:
        kind = "iPhone"
    elif "ipad" in low:
        kind = "iPad"
    elif "android" in low and "mobile" in low:
        kind = "Android-телефон"
    elif "android" in low:
        kind = "Android-планшет"
    elif "windows" in low:
        kind = "Windows"
    elif "mac os" in low or "macintosh" in low:
        kind = "Mac"
    elif "cros" in low:
        kind = "Chromebook"
    elif "linux" in low:
        kind = "Linux"
    else:
        kind = "Неизвестно"

    if "telegram" in low:
        browser = "Telegram"
    elif "edg/" in low:
        browser = "Edge"
    elif "opr/" in low or "opera" in low:
        browser = "Opera"
    elif "firefox" in low or "fxios" in low:
        browser = "Firefox"
    elif "crios" in low or ("chrome" in low and "safari" in low):
        browser = "Chrome"
    elif "safari" in low:
        browser = "Safari"
    elif "yabrowser" in low or "yowser" in low:
        browser = "Яндекс"
    else:
        browser = "Браузер"

    if "iphone" in low or "ipad" in low or "ios" in low:
        form = "Мобильное" if "iphone" in low else "Планшет"
    elif "mobile" in low or "android" in low:
        form = "Мобильное"
    else:
        form = "Компьютер"
    return form, kind, browser


def lookup_geo(ip: str) -> dict:
    empty = {"country": "не определена", "region": "", "city": "", "isp": "", "org": ""}
    if not ip or ip.startswith(("127.", "10.", "192.168.", "172.16.")):
        return empty
    url = f"http://ip-api.com/json/{urllib.parse.quote(ip)}?fields=status,country,countryCode,regionName,city,isp,org,query"
    try:
        with urllib.request.urlopen(url, timeout=6) as resp:
            data = json.loads(resp.read().decode())
        if data.get("status") != "success":
            return empty
        return {
            "country": f"{data.get('country') or '—'} ({data.get('countryCode') or '—'})",
            "region": data.get("regionName") or "",
            "city": data.get("city") or "",
            "isp": data.get("isp") or "",
            "org": data.get("org") or "",
        }
    except Exception:
        return empty


def client_ip(handler: BaseHTTPRequestHandler) -> str:
    forwarded = handler.headers.get("X-Forwarded-For") or handler.headers.get("X-Real-IP") or ""
    if forwarded:
        return forwarded.split(",")[0].strip()
    return handler.client_address[0]


def is_bot(ua: str) -> bool:
    low = (ua or "").lower()
    return any(x in low for x in (
        "bot", "spider", "crawler", "preview", "slurp", "facebookexternal",
        "pingdom", "uptimerobot", "headlesschrome", "python-requests", "curl/", "wget",
    ))


def build_message(ip: str, ua: str, extra: dict) -> str:
    geo = lookup_geo(ip)
    form, kind, browser = parse_device(ua)
    place = " · ".join(x for x in (geo["city"], geo["region"]) if x) or "—"
    ref = (extra.get("ref") or "").strip() or "прямой заход"
    if len(ref) > 180:
        ref = ref[:177] + "..."
    now = time.strftime("%d.%m.%Y %H:%M:%S UTC", time.gmtime())
    return "\n".join([
        "👁 Новый вход на cryptostatte.shop",
        "",
        f"🌍 Страна: {geo['country']}",
        f"🏙 Город: {place}",
        f"📱 Устройство: {form} · {kind}",
        f"🌐 Браузер: {browser}",
        f"🖥 Экран: {extra.get('screen') or '—'}",
        f"🗣 Язык: {extra.get('lang') or '—'}",
        f"🕒 Пояс: {extra.get('tz') or '—'}",
        f"📄 Страница: {extra.get('path') or '/'}",
        f"🔗 Откуда: {ref}",
        f"🛰 IP: {ip}",
        f"📡 Сеть: {geo['isp'] or geo['org'] or '—'}",
        f"⏰ {now}",
    ])


def notify_all(text: str) -> None:
    targets = []
    if CHANNEL:
        targets.append(CHANNEL)
    targets.extend(load_chats())
    seen = set()
    for chat in targets:
        key = str(chat)
        if key in seen:
            continue
        seen.add(key)
        result = send_text(chat, text)
        if not result.get("ok"):
            print(f"telegram fail {chat}: {result.get('description')}", flush=True)


def handle_visit(ip: str, ua: str, extra: dict) -> None:
    if is_bot(ua):
        return
    now = time.time()
    with _lock:
        last = _recent.get(ip, 0)
        if now - last < COOLDOWN_SEC:
            return
        _recent[ip] = now
        if len(_recent) > 4000:
            cutoff = now - COOLDOWN_SEC
            for key, ts in list(_recent.items()):
                if ts < cutoff:
                    del _recent[key]
    notify_all(build_message(ip, ua, extra))


def poll_telegram() -> None:
    global _offset
    while True:
        try:
            data = telegram("getUpdates", {"timeout": 25, "offset": _offset, "allowed_updates": json.dumps(["message"])})
            for upd in data.get("result") or []:
                _offset = int(upd.get("update_id", 0)) + 1
                msg = upd.get("message") or {}
                chat = msg.get("chat") or {}
                chat_id = chat.get("id")
                text = (msg.get("text") or "").strip()
                if chat_id and (text.startswith("/start") or chat.get("type") in {"private", "group", "supergroup"}):
                    save_chat(int(chat_id))
                    send_text(
                        chat_id,
                        "Бот трафика CryptoStatte активен.\n"
                        "Сюда будут приходить входы на сайт: страна, устройство и источник.",
                    )
        except Exception as exc:
            print(f"poll error: {exc}", flush=True)
            time.sleep(5)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

    def _send(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.startswith("/health"):
            self._send(200, {"ok": True})
            return
        self._send(404, {"ok": False})

    def do_POST(self) -> None:
        if not self.path.startswith("/visit"):
            self._send(404, {"ok": False})
            return
        length = int(self.headers.get("Content-Length") or 0)
        if length > 8000:
            self._send(413, {"ok": False})
            return
        raw = self.rfile.read(length) if length else b"{}"
        try:
            extra = json.loads(raw.decode() or "{}")
            if not isinstance(extra, dict):
                extra = {}
        except json.JSONDecodeError:
            extra = {}
        ua = self.headers.get("User-Agent") or extra.get("ua") or ""
        threading.Thread(
            target=handle_visit,
            args=(client_ip(self), ua, extra),
            daemon=True,
        ).start()
        self._send(200, {"ok": True})


def main() -> None:
    if not TOKEN:
        raise SystemExit("TELEGRAM_BOT_TOKEN is missing")
    CHATS_PATH.parent.mkdir(parents=True, exist_ok=True)
    threading.Thread(target=poll_telegram, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"notify listening on 127.0.0.1:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
