#!/bin/bash
set -euo pipefail

SITE_DIR="/var/www/schweiz-zahlt"

if [ ! -d /etc/letsencrypt/live/benefitseurope.com ]; then
  cp "$SITE_DIR/deploy/nginx-schweiz-zahlt-init.conf" /etc/nginx/sites-available/schweiz-zahlt
  ln -sf /etc/nginx/sites-available/schweiz-zahlt /etc/nginx/sites-enabled/schweiz-zahlt
  nginx -t
  systemctl reload nginx
  certbot --nginx -d benefitseurope.com -d www.benefitseurope.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || true
fi

cp "$SITE_DIR/deploy/nginx-schweiz-zahlt.conf" /etc/nginx/sites-available/schweiz-zahlt
nginx -t
systemctl reload nginx
systemctl restart schweiz-zahlt
echo "Domain switch complete: benefitseurope.com"
