# Multi-stage build para la Web App (Angular 17)

# Etapa 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Generar build de producción
RUN npm run build -- --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Borrar archivos por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos estáticos desde la etapa de build
# Basado en angular.json -> outputPath: dist/traza-net
COPY --from=builder /app/dist/traza-net/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
