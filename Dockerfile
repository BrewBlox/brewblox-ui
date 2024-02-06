FROM nginx:alpine

COPY dist /var/www/ui

COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80 default_server;

  root /var/www;
  # index index.html;
  server_name brewblox;

  access_log off;
  # rewrite_log on;
  absolute_redirect off;
  sendfile on;
  tcp_nopush on;
  gzip on;
  gzip_vary on;
  gzip_types
    text/plain
    application/javascript
    application/x-javascript
    application/json
    text/javascript
    text/xml
    text/css
    image/svg+xml
    font/woff
    font/woff2;

  location = / {
    add_header used_location slash;
    rewrite ^ /ui/index.html;
  }

  location = /ui {
    add_header used_location slashui;
    rewrite ^ /ui/index.html;
  }

  # The index file itself is small, and should not be cached
  location = /ui/index.html {
    expires 0;
    add_header Pragma no-cache;
    add_header Cache-Control "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0";
  }

  # No fallback to index.html for known static file types
  # Static files should be aggressively cached
  # We rely on hashed names for cache invalidation
  location ~* ^/ui/.*\.(?:ico|css|js|svg|gif|jpe?g|png|woff2?)$ {
    expires max;
    add_header Pragma public;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }

  # SPA support: return index.html without redirection
  location /ui/ {
    try_files $uri $uri.html /ui/index.html;
  }

  # Static files are handled separately
  # They should not use the UI index file, but are safe to be indexed
  location /static/ {
    autoindex on;
  }
}
EOF
