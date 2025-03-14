FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de configuración primero
COPY package*.json ./
COPY .npmrc ./

# Instalar Angular CLI y dependencias del proyecto
RUN npm install -g @angular/cli@17.2.2 && \
    npm install

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:stable

# Copiar los archivos construidos
COPY --from=builder /app/dist/traza-net /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 