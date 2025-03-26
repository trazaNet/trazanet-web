# Dockerización de TrazaNet

Este directorio contiene los archivos necesarios para ejecutar TrazaNet utilizando Docker.

## Estructura de archivos

- `docker-compose.yml`: Configuración principal que define todos los servicios
- `Dockerfile.backend`: Dockerfile para construir la imagen del backend (Python/FastAPI)
- `Dockerfile.frontend`: Dockerfile para construir la imagen del frontend (Angular)
- `nginx.conf`: Configuración de Nginx para el frontend
- `.env`: Variables de entorno para los distintos servicios
- `init-scripts/`: Scripts SQL para inicializar la base de datos

## Requisitos previos

- Docker y Docker Compose instalados en tu sistema
- Git para clonar el repositorio

## Instrucciones de uso

1. Asegúrate de estar en la raíz del proyecto TrazaNet.

2. Configura tus variables de entorno:
   ```
   cp docker/.env.example docker/.env
   ```
   Edita el archivo `docker/.env` con tus valores personalizados.

3. Construye y ejecuta los contenedores:
   ```
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. Accede a los servicios:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3001
   - pgAdmin: http://localhost:5050
     - Usuario: admin@trazanet.com
     - Contraseña: admin123

5. Para detener los contenedores:
   ```
   docker-compose -f docker/docker-compose.yml down
   ```

## Servicios incluidos

- **PostgreSQL**: Base de datos principal (puerto 5432)
- **pgAdmin**: Interfaz web para administrar PostgreSQL (puerto 5050)
- **Backend**: API REST con FastAPI (puerto 3001)
- **Frontend**: Aplicación Angular (puerto 4200)

## Volúmenes persistentes

- `postgres_data`: Datos de PostgreSQL

## Redes

Todos los servicios se comunican a través de la red `trazanet-network`.

## Solución de problemas

- Si tienes problemas para acceder a la API desde el frontend, verifica la configuración de CORS en el backend y el proxy en el frontend.
- Para ver los logs de un servicio específico: `docker-compose -f docker/docker-compose.yml logs -f [servicio]`
- Para reconstruir un servicio específico: `docker-compose -f docker/docker-compose.yml up -d --build [servicio]` 