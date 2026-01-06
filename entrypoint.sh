#!/bin/bash

set -e

# ENV_ARGS=""
# DEBUG=0
# DEBUG_ARGS=""

set -a
[ -f /etc/odoo/.env ] && . /etc/odoo/.env
set +a

printenv
# if [ "$DEBUG" -eq "1" ]; then
#    echo "🛠️  Mode debug activé"
#    exec python3 -m debugpy \
#     --listen 0.0.0.0:5678 \
#     /usr/bin/odoo \
#     -c /etc/odoo/odoo.conf \
#     $ENV_ARGS
# else
exec odoo -c /etc/odoo/odoo.conf $ENV_ARGS
# fi
