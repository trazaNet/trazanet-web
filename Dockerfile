FROM node:20 AS builder

WORKDIR /app

# Actualizar npm a la última versión
RUN npm install -g npm@latest

# Copiar archivos de configuración primero
COPY package*.json ./
COPY .npmrc ./

# Instalar Angular CLI globalmente y otras dependencias globales
RUN npm install -g @angular/cli@17.2.2

# Instalar dependencias del proyecto
RUN npm install

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:stable

# Copiar solo los archivos construidos
COPY --from=builder /app/dist/traza-net /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 