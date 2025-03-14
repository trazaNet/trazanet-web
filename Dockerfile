FROM node:20 AS frontend-builder

# Configurar el directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copiar archivos de configuración del frontend
COPY package*.json ./
COPY .npmrc ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el código fuente del frontend
COPY src ./src

# Construir la aplicación Angular
RUN npm run build

# Etapa del backend
FROM node:20-slim

WORKDIR /app

# Copiar archivos del backend
COPY backend/package*.json ./
COPY backend/.npmrc ./
COPY backend/src ./src

# Instalar dependencias del backend
RUN npm install --production

# Crear directorio public y copiar los archivos construidos del frontend
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/dist/traza-net/* ./public/

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE ${PORT}

# Comando para iniciar el backend
CMD ["node", "src/index.js"] 