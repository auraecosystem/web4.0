FROM nginx:alpine

LABEL org.opencontainers.image.title="Web4.0"
LABEL org.opencontainers.image.description="Web4.0 semantic dashboard"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider --quiet http://127.0.0.1/ || exit 1
