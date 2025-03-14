FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración primero
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@17.2.2

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar solo los archivos construidos
COPY --from=builder /app/dist/traza-net /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 