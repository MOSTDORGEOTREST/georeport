#!/bin/sh
set -eu

CERTBOT_EMAIL="${CERTBOT_EMAIL:-sheepdolly2023@gmail.com}"
WEBROOT=/var/www/certbot
RELOAD_FLAG="$WEBROOT/.reload-nginx"

request_webroot() {
    certbot certonly \
        --webroot --webroot-path "$WEBROOT" \
        --cert-name georeport.ru \
        --domain georeport.ru --domain www.georeport.ru \
        --email "$CERTBOT_EMAIL" \
        --agree-tos --no-eff-email --non-interactive \
        --keep-until-expiring \
        --deploy-hook "touch $RELOAD_FLAG"
}

request_standalone() {
    certbot certonly \
        --standalone \
        --cert-name georeport.ru \
        --domain georeport.ru --domain www.georeport.ru \
        --email "$CERTBOT_EMAIL" \
        --agree-tos --no-eff-email --non-interactive \
        --keep-until-expiring \
        --deploy-hook "touch $RELOAD_FLAG"
}

case "${1:-daemon}" in
    webroot)
        request_webroot
        ;;
    standalone)
        request_standalone
        ;;
    daemon)
        trap 'exit 0' TERM INT

        until request_webroot; do
            echo "Initial certificate request failed; retrying in 5 minutes" >&2
            sleep 300
        done

        touch "$RELOAD_FLAG"

        while :; do
            certbot renew \
                --webroot --webroot-path "$WEBROOT" \
                --deploy-hook "touch $RELOAD_FLAG"
            sleep 12h & wait $!
        done
        ;;
    *)
        echo "Usage: $0 [daemon|webroot|standalone]" >&2
        exit 2
        ;;
esac
