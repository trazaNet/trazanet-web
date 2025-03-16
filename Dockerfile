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
FROM node:20.11.1-slim

WORKDIR /app

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar dependencias del backend y herramientas necesarias
RUN apt-get update && \
    apt-get install -y curl python3 make g++ && \
    npm ci --only=production && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copiar el código fuente del backend
COPY backend/. .

# Crear directorio public y copiar los archivos del frontend
COPY --from=frontend-builder /app/frontend/dist/traza-net/. ./public/

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Exponer el puerto (Railway configurará el puerto automáticamente)
EXPOSE ${PORT}

# Script para verificar el servicio y mostrar más información
RUN echo '#!/bin/sh\n\
echo "Checking health endpoint..."\n\
response=$(curl -s http://localhost:${PORT}/healthz)\n\
echo "Response from healthz: $response"\n\
if [ "$(echo $response | grep -c "\"status\":\"ok\"")" = "1" ]; then\n\
  echo "Health check passed"\n\
  exit 0\n\
else\n\
  echo "Health check failed"\n\
  exit 1\n\
fi' > /healthcheck.sh && chmod +x /healthcheck.sh

# Healthcheck para Railway usando el script
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
    CMD /healthcheck.sh

# Comando para iniciar el backend con logging adicional
CMD echo "Starting server on port ${PORT}" && node src/index.js 