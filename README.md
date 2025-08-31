# TrazaNet - Sistema de Trazabilidad Ganadera

Sistema completo de trazabilidad ganadera desarrollado con Angular 19 (Frontend) y Node.js (Backend).

## 🏗️ Estructura del Proyecto

```
trazaNet/
├── web/
│   ├── frontend/          # Aplicación Angular
│   └── backend/           # API Node.js
├── docker/                # Configuración Docker
├── vercel.json           # Configuración Vercel
└── README.md
```

## 🚀 Deploy en Vercel

### Frontend (Angular)

El frontend está configurado para deploy automático en Vercel:

1. **Conectar repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa este repositorio
   - Vercel detectará automáticamente la configuración

2. **Configuración automática:**
   - Build Command: `cd web/frontend && npm install && npm run build:prod`
   - Output Directory: `web/frontend/dist/traza-net/browser`
   - Framework Preset: Angular

3. **Variables de entorno (opcional):**
   - En el dashboard de Vercel, agrega variables si es necesario

### Backend (Node.js)

Para el backend, puedes usar:
- **Railway** (recomendado)
- **Heroku**
- **DigitalOcean**
- **AWS**

## 🔧 Configuración Local

### Frontend
```bash
cd web/frontend
npm install
npm start
```

### Backend
```bash
cd web/backend
npm install
npm start
```

## 📝 Notas Importantes

- **URL del Backend**: Cambiar en `web/frontend/src/environments/environment.prod.ts`
- **CORS**: Configurar en el backend para permitir el dominio de Vercel
- **Base de Datos**: Configurar según el proveedor elegido

## 🐳 Docker

Para desarrollo local con Docker:

```bash
cd docker
docker-compose up
```

## 📄 Licencia

Este proyecto es privado y confidencial.