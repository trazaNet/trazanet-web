FROM node:20.11.1-alpine AS frontend-builder

# Configurar el directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copiar package.json y package-lock.json primero para aprovechar la caché de capas
COPY frontend/package*.json ./

# Instalar dependencias del frontend con npm ci para instalación limpia y determinista
RUN npm ci

# Copiar el resto de los archivos del frontend
COPY frontend/. .

# Construir la aplicación Angular en modo producción
RUN npm run build -- --configuration=production

# Etapa del backend
FROM node:20.11.1-alpine

WORKDIR /app

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar dependencias del backend y herramientas necesarias
RUN apk add --no-cache wget curl && \
    npm ci --only=production

# Copiar el código fuente del backend
COPY backend/. .

# Crear directorio public y copiar los archivos del frontend
COPY --from=frontend-builder /app/frontend/dist/traza-net/. ./public/

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto (Railway configurará el puerto automáticamente)
EXPOSE ${PORT}

# Healthcheck para Railway usando curl (más confiable que wget)
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT}/healthz || exit 1

# Comando para iniciar el backend
CMD ["node", "src/index.js"] 