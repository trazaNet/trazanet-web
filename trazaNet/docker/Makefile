# Variables
COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

# Comandos principales
.PHONY: help build up down restart logs ps clean

help:
	@echo "TrazaNet Docker - Comandos disponibles"
	@echo "======================================"
	@echo "make build    - Construir todos los contenedores"
	@echo "make up       - Iniciar todos los contenedores"
	@echo "make down     - Detener todos los contenedores"
	@echo "make restart  - Reiniciar todos los contenedores"
	@echo "make logs     - Ver logs de todos los contenedores"
	@echo "make ps       - Ver estado de los contenedores"
	@echo "make clean    - Limpiar volúmenes y contenedores"

# Verificar que el archivo .env existe
check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Archivo .env no encontrado. Copiando desde .env.example..."; \
		cp .env.example .env; \
		echo "Por favor, edita el archivo .env con tus valores personalizados."; \
		exit 1; \
	fi

# Construir los contenedores
build: check-env
	docker-compose -f $(COMPOSE_FILE) build

# Iniciar los contenedores
up: check-env
	docker-compose -f $(COMPOSE_FILE) up -d

# Detener los contenedores
down:
	docker-compose -f $(COMPOSE_FILE) down

# Reiniciar los contenedores
restart: down up

# Ver logs de los contenedores
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Ver estado de los contenedores
ps:
	docker-compose -f $(COMPOSE_FILE) ps

# Limpiar volúmenes y contenedores
clean: down
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f 