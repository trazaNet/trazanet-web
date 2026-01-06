# Multi-stage build para la Web App

# Etapa 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Copiar los archivos estáticos desde la etapa de build
# Nota: La ruta de salida 'dist/traza-movil/browser' depende de tu angular.json
COPY --from=builder /app/dist/traza-movil/browser /usr/share/nginx/html

# Copiar una configuración personalizada de Nginx si es necesario (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]