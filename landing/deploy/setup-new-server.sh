#!/bin/bash
set -euo pipefail

SITE_DIR="/var/www/schweiz-zahlt"
ENV_FILE="/etc/schweiz-zahlt.env"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3-venv python3-pip nginx certbot python3-certbot-nginx

mkdir -p "$SITE_DIR/backend/data" "$SITE_DIR/downloads"
chown -R www-data:www-data "$SITE_DIR/backend" "$SITE_DIR/downloads"

cd "$SITE_DIR/backend"
python3 -m venv venv
./venv/bin/pip install -q -r requirements.txt
./venv/bin/python3 -c "from app import ensure_db; ensure_db()"

if [ ! -f "$ENV_FILE" ]; then
  SECRET=$(openssl rand -hex 32)
  PASS=$(openssl rand -base64 12 | tr -d '/+=' | head -c 12)
  HASH=$(cd "$SITE_DIR/backend" && ./venv/bin/python3 -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('$PASS'))")
  cat > "$ENV_FILE" << EOF
ADMIN_SECRET_KEY=$SECRET
ADMIN_PASSWORD_HASH=$HASH
EOF
  chmod 600 "$ENV_FILE"
  echo "ADMIN PASSWORD: $PASS"
fi

cp "$SITE_DIR/deploy/nginx-schweiz-zahlt-init.conf" /etc/nginx/sites-available/schweiz-zahlt
ln -sf /etc/nginx/sites-available/schweiz-zahlt /etc/nginx/sites-enabled/schweiz-zahlt

cp "$SITE_DIR/deploy/schweiz-zahlt.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable schweiz-zahlt
systemctl restart schweiz-zahlt

nginx -t
systemctl reload nginx

if [ ! -d /etc/letsencrypt/live/benefitseurope.com ]; then
  certbot --nginx -d benefitseurope.com -d www.benefitseurope.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || true
fi

if [ -d /etc/letsencrypt/live/benefitseurope.com ]; then
  cp "$SITE_DIR/deploy/nginx-schweiz-zahlt.conf" /etc/nginx/sites-available/schweiz-zahlt
  nginx -t
  systemctl reload nginx
  echo "SSL enabled for benefitseurope.com"
else
  echo "SSL cert not issued yet (DNS may still point elsewhere). Site works on HTTP."
fi

echo "Done. Admin: http://153.52.103.34/admin"
