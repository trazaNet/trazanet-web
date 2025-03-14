FROM node:20-alpine AS build

# Instalar dependencias necesarias y npm
RUN apk update && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    npm

WORKDIR /app

# Verificar las versiones instaladas
RUN node --version && npm --version

# Copiar archivos de configuración
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias
RUN npm install --no-optional --prefer-offline

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar archivos de la etapa de build
COPY --from=build /app/dist/traza-net /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 