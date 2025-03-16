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
RUN npm run build -- --configuration=production && \
    ls -la dist/traza-net/

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
COPY --from=frontend-builder /app/frontend/dist/traza-net/browser/. ./public/

# Verificar que index.html existe
RUN ls -la public/ && \
    if [ ! -f public/index.html ]; then \
      echo "Error: index.html not found in public directory" && \
      exit 1; \
    fi

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Exponer el puerto (Railway configurará el puerto automáticamente)
EXPOSE ${PORT}

# Script para verificar el servicio y mostrar más información
RUN echo '#!/bin/sh\n\
echo "Checking health endpoint..."\n\
echo "Current time: $(date)"\n\
echo "Attempting to connect to http://localhost:${PORT}/healthz"\n\
curl_output=$(curl -v http://localhost:${PORT}/healthz 2>&1)\n\
echo "Curl verbose output:"\n\
echo "$curl_output"\n\
response=$(echo "$curl_output" | grep -A1 "< HTTP")\n\
echo "HTTP Response:"\n\
echo "$response"\n\
if echo "$curl_output" | grep -q "\"status\":\"ok\""; then\n\
  echo "Health check passed"\n\
  exit 0\n\
else\n\
  echo "Health check failed"\n\
  echo "Process list:"\n\
  ps aux\n\
  echo "Network status:"\n\
  netstat -tulpn\n\
  exit 1\n\
fi' > /healthcheck.sh && chmod +x /healthcheck.sh

# Healthcheck para Railway usando el script
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=3 \
    CMD /healthcheck.sh

# Comando para iniciar el backend con logging adicional
CMD echo "Starting server on port ${PORT}" && \
    echo "Environment variables:" && \
    env | grep -v "PASSWORD\|KEY" && \
    echo "Contents of public directory:" && \
    ls -la public/ && \
    node src/index.js 