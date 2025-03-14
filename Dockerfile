FROM node:20 AS builder

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del frontend
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto de archivos del frontend
COPY . .

# Construir la aplicación Angular
RUN npm run build

# Etapa del backend
FROM node:20-slim

WORKDIR /app

# Copiar archivos del backend
COPY backend/package*.json ./
COPY backend/src ./src

# Instalar dependencias del backend
RUN npm install --production

# Copiar los archivos construidos del frontend
COPY --from=builder /app/dist/traza-net ./public

# Exponer el puerto que Railway asignará
EXPOSE ${PORT}

# Comando para iniciar el backend
CMD ["npm", "start"] 