FROM nginx:alpine

COPY dist /var/www/ui

COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80 default_server;

  root /var/www;
  index index.html;

  server_name brewblox;
  access_log off;
  gzip on;
  gzip_vary on;
  gzip_min_length 10240;
  gzip_types
    text/plain
    application/javascript
    application/x-javascript
    text/javascript
    text/xml
    text/css;

  # Add /ui prefix if missing
  location ~* ^/(?!(ui|static)) {
    rewrite ^/(.*)$ /ui/$1;
    try_files $uri $uri/ @rewrites;
  }

  # Redirect root /ui to UI index
  location ~ ^/ui/?$ {
    rewrite ^/(.*)$ /ui/index.html last;
  }

  # Normal handling of all /ui prefixed files
  location /ui/ {
    try_files $uri $uri/ @rewrites;
  }

  # File was not found, forward to UI index
  location @rewrites {
    rewrite ^(.+)$ /ui/index.html last;
  }

  # The index file itself is small, and should not be cached
  # The JS/CSS chunks have hashed names to handle caching
  location /ui/index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma no-cache;
    expires 0;
  }

  # Basic cache-control for static files
  location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|pem|der)$ {
    sendfile on;
    tcp_nopush on;
    expires max;
    add_header Pragma public;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }
}
EOF
