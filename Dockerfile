FROM node:20 AS builder

# Crear un usuario no root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 nextjs

# Configurar el directorio de trabajo y los permisos
WORKDIR /app
RUN chown nextjs:nodejs /app

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH

# Copiar archivos de configuración primero
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs .npmrc ./

# Cambiar al usuario no root
USER nextjs

# Instalar dependencias
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install -g @angular/cli@17.2.2 && \
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