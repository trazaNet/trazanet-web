# Credenciales de Usuarios - TrazaNet

## Usuario Administrador (Hardcodeado en Frontend)

**Email:** `admin@mail.com`  
**Contraseña:** `admin123`  
**DICOSE:** `ADMIN001`  
**Teléfono:** `099123456`  
**Rol:** Administrador  
**Funcionalidad:** Acceso completo a todas las funciones del sistema

---

## Usuario de Prueba (Hardcodeado en Frontend)

**Email:** `test@example.com`  
**Contraseña:** `password`  
**DICOSE:** `12345`  
**Teléfono:** `099123456`  
**Rol:** Usuario Regular  
**Funcionalidad:** Acceso limitado a funciones básicas

---

## Notas Importantes

1. **Funcionamiento Independiente:** Estos usuarios funcionan incluso cuando el backend no está disponible
2. **Autenticación Mock:** El sistema automáticamente usa autenticación simulada cuando detecta que el backend no responde
3. **Persistencia:** Los datos de sesión se guardan en localStorage del navegador
4. **Seguridad:** Estas credenciales son solo para desarrollo y pruebas

---

## Cómo Usar

1. Inicia el frontend: `cd web/frontend && ng serve`
2. Ve a `http://localhost:4200`
3. Usa cualquiera de las credenciales anteriores para iniciar sesión
4. El sistema funcionará independientemente del estado del backend

---

## Usuarios de Base de Datos (Cuando Backend esté disponible)

Si el backend está funcionando, también puedes usar los usuarios de la base de datos:

- **juan.perez@ejemplo.com** / **pass123** (Admin)
- **maria.rodriguez@ejemplo.com** / **pass456** (Usuario)
- **carlos.gomez@ejemplo.com** / **pass789** (Usuario)
- Y otros usuarios de ejemplo en `docker/init-scripts/sample_data.sql` 