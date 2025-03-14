FROM node:20 AS frontend-builder

# Configurar el directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copiar todos los archivos necesarios para construir el frontend
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el código fuente del frontend y archivos de configuración
COPY src ./src

# Construir la aplicación Angular en modo producción
RUN npm run build -- --configuration=production

# Verificar los archivos generados
RUN ls -la dist/traza-net

# Etapa del backend
FROM node:20-slim

WORKDIR /app

# Copiar solo el package.json del backend
COPY backend/package.json ./package.json

# Instalar dependencias del backend
RUN npm install --production

# Copiar el código fuente del backend
COPY backend/src ./src

# Crear directorio public
RUN mkdir -p public

# Copiar los archivos construidos del frontend
COPY --from=frontend-builder /app/frontend/dist/traza-net/. ./public/

# Verificar los archivos copiados
RUN ls -la public

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE ${PORT}

# Comando para iniciar el backend con más logs
CMD ["sh", "-c", "ls -la public && node src/index.js"] 