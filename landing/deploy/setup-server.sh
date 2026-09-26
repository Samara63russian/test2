#!/bin/bash
set -euo pipefail

SITE_DIR="/var/www/schweiz-zahlt"
ENV_FILE="/etc/schweiz-zahlt.env"

apt-get update -qq
apt-get install -y -qq python3-venv python3-pip

cd "$SITE_DIR/backend"
python3 -m venv venv
./venv/bin/pip install -q -r requirements.txt

mkdir -p "$SITE_DIR/backend/data"
chown -R www-data:www-data "$SITE_DIR/backend/data" "$SITE_DIR/downloads"

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
  echo "(saved in $ENV_FILE as hash)"
fi

cp "$SITE_DIR/deploy/nginx-schweiz-zahlt.conf" /etc/nginx/sites-available/schweiz-zahlt
ln -sf /etc/nginx/sites-available/schweiz-zahlt /etc/nginx/sites-enabled/schweiz-zahlt

cp "$SITE_DIR/deploy/schweiz-zahlt.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable schweiz-zahlt
systemctl restart schweiz-zahlt

nginx -t
systemctl reload nginx

echo "Done. Admin: http://$(hostname -I | awk '{print $1}')/admin"
