FROM odoo:18

USER root

COPY ./entrypoint.sh /
RUN chmod +x /entrypoint.sh

# Installer venv et créer l'environnement virtuel
# RUN apt-get update && apt-get install -y --no-install-recommends \
#         python3-venv \
#     && python3 -m venv /opt/venv \
#     && /opt/venv/bin/pip install --upgrade pip \
#     && /opt/venv/bin/pip install debugpy pydevd-odoo \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# ENV PATH="/opt/venv/bin:$PATH"
USER odoo

ENTRYPOINT ["/entrypoint.sh"]
CMD ["odoo"]
