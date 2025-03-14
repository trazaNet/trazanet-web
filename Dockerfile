FROM node:20 AS builder

# Crear un usuario no root con un directorio home válido
RUN mkdir -p /home/nextjs && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 --home /home/nextjs nextjs && \
    chown -R nextjs:nodejs /home/nextjs

# Configurar el directorio de trabajo y los permisos
WORKDIR /app
RUN chown nextjs:nodejs /app

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/nextjs/.npm-global
ENV PATH=$PATH:/home/nextjs/.npm-global/bin

# Cambiar al usuario no root
USER nextjs

# Crear y configurar el directorio para npm global
RUN mkdir -p /home/nextjs/.npm-global && \
    npm config set prefix '/home/nextjs/.npm-global'

# Copiar archivos de configuración primero
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs .npmrc ./

# Instalar dependencias
RUN npm install -g @angular/cli@17.2.2 && \
    npm install

# Copiar el resto de archivos
COPY --chown=nextjs:nodejs . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:stable

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos
COPY --from=builder /app/dist/traza-net /usr/share/nginx/html

# Configurar permisos en nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 