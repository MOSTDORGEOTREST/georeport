#!/bin/sh
set -eu

ACTIVE_CONFIG=/etc/nginx/conf.d/default.conf
ACME_CONFIG=/etc/nginx/georeport/acme-http.conf
HTTPS_CONFIG=/etc/nginx/georeport/app.conf
FULLCHAIN=/etc/letsencrypt/live/georeport.ru/fullchain.pem
PRIVATE_KEY=/etc/letsencrypt/live/georeport.ru/privkey.pem
RELOAD_FLAG=/var/www/certbot/.reload-nginx
MODE_FILE=/tmp/georeport-nginx-mode

certificate_ready() {
    [ -s "$FULLCHAIN" ] && [ -s "$PRIVATE_KEY" ]
}

install_config() {
    cp "$1" "$ACTIVE_CONFIG"
}

if certificate_ready; then
    install_config "$HTTPS_CONFIG"
    if nginx -t >/dev/null 2>&1; then
        printf '%s\n' https > "$MODE_FILE"
    else
        install_config "$ACME_CONFIG"
        printf '%s\n' http > "$MODE_FILE"
    fi
else
    install_config "$ACME_CONFIG"
    printf '%s\n' http > "$MODE_FILE"
fi

watch_certificate() {
    while sleep 15; do
        mode="$(cat "$MODE_FILE" 2>/dev/null || printf '%s' http)"

        if [ "$mode" = http ] && certificate_ready; then
            cp "$ACTIVE_CONFIG" "${ACTIVE_CONFIG}.previous"
            install_config "$HTTPS_CONFIG"

            if nginx -t; then
                printf '%s\n' https > "$MODE_FILE"
                nginx -s reload || true
                rm -f "${ACTIVE_CONFIG}.previous" "$RELOAD_FLAG"
            else
                mv "${ACTIVE_CONFIG}.previous" "$ACTIVE_CONFIG"
            fi
            continue
        fi

        if [ "$mode" = https ] && [ -f "$RELOAD_FLAG" ]; then
            if nginx -t; then
                nginx -s reload || true
                rm -f "$RELOAD_FLAG"
            fi
        fi
    done
}

watch_certificate &
