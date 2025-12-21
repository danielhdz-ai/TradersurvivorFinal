# 🚀 Guía de Deploy en Vercel - Trader Survivor

Esta guía te llevará paso a paso para subir tu aplicación a Vercel.

---

## 📋 Requisitos Previos

- ✅ Cuenta en GitHub (gratis)
- ✅ Cuenta en Vercel (gratis)
- ✅ Git instalado en tu computadora

---

## 🎯 Paso 1: Preparar el Proyecto

### 1.1 Verificar estructura de archivos

Tu proyecto debe tener esta estructura:

```
tradersurvivir su/
├── api/
│   ├── bingx.js        ✅ Ya creado
│   ├── mexc.js         ✅ Ya creado
│   ├── bitget.js       ✅ Ya creado
│   └── health.js       ✅ Ya creado
├── index.html          ✅ Tu aplicación
├── vercel.json         ✅ Ya creado
├── package.json        ✅ Ya existe
└── (otros archivos...)
```

### 1.2 Actualizar URL de la API en tu código

Abre `index.html` y busca estas líneas (aprox. línea 10233 o donde esté definido):

**BUSCA:**
```javascript
const PROXY_URL = window.PROXY_URL || 'http://127.0.0.1:8003';
```

**REEMPLAZA POR:**
```javascript
const PROXY_URL = window.PROXY_URL || 'https://TU-DOMINIO.vercel.app/api';
```

**NOTA:** Cambiarás `TU-DOMINIO` después del deploy. Por ahora déjalo así.

---

## 🎯 Paso 2: Subir a GitHub

### 2.1 Inicializar Git (si no lo has hecho)

Abre una terminal en la carpeta del proyecto:

```bash
git init
```

### 2.2 Crear archivo .gitignore

Crea un archivo llamado `.gitignore` con este contenido:

```
node_modules/
.env
.env.local
*.log
.DS_Store
.vercel
```

### 2.3 Hacer commit

```bash
git add .
git commit -m "Initial commit - Trader Survivor"
```

### 2.4 Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en el **+** (arriba derecha) → **New repository**
3. Nombre: `trader-survivor`
4. Descripción: "Trading journal with multi-exchange support"
5. **NO** marques ninguna casilla (README, .gitignore, etc.)
6. Click en **Create repository**

### 2.5 Conectar y subir

GitHub te mostrará comandos. Cópialos y pégalos en tu terminal:

```bash
git remote add origin https://github.com/TU-USUARIO/trader-survivor.git
git branch -M main
git push -u origin main
```

---

## 🎯 Paso 3: Deploy en Vercel

### 3.1 Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **Sign Up**
3. Selecciona **Continue with GitHub**
4. Autoriza a Vercel

### 3.2 Importar proyecto

1. En el dashboard de Vercel, click en **Add New** → **Project**
2. Busca tu repositorio `trader-survivor`
3. Click en **Import**

### 3.3 Configurar proyecto

**Framework Preset:** Other (o déjalo en blanco)

**Root Directory:** `./` (dejar por defecto)

**Build Command:** (dejar vacío)

**Output Directory:** `./` (dejar por defecto)

**Install Command:** `npm install`

### 3.4 Variables de entorno (OPCIONAL)

Si quieres agregar variables de entorno:

Click en **Environment Variables** y agrega:

```
NODE_ENV = production
```

### 3.5 Deploy

Click en **Deploy** y espera 1-2 minutos.

---

## 🎯 Paso 4: Configurar URLs en tu Aplicación

### 4.1 Obtener tu URL de Vercel

Después del deploy, Vercel te dará una URL como:

```
https://trader-survivor-abc123.vercel.app
```

### 4.2 Actualizar tu código

**Opción A - Editar directamente en GitHub:**

1. Ve a tu repositorio en GitHub
2. Abre `index.html`
3. Click en el lápiz (Edit)
4. Busca la línea con `PROXY_URL`
5. Cámbiala por:

```javascript
const PROXY_URL = 'https://trader-survivor-abc123.vercel.app/api';
```

6. Click en **Commit changes**

**Opción B - Editar localmente:**

1. Abre `index.html` en tu editor
2. Busca `PROXY_URL` y actualiza la URL
3. Guarda el archivo
4. Sube los cambios:

```bash
git add index.html
git commit -m "Update API URL for production"
git push
```

Vercel detectará el cambio y redesplegará automáticamente.

---

## 🎯 Paso 5: Probar tu Aplicación

### 5.1 Abrir la aplicación

Ve a: `https://tu-dominio.vercel.app`

### 5.2 Verificar el health check

Abre: `https://tu-dominio.vercel.app/api/health`

Deberías ver:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "exchanges": ["BingX", "MEXC", "Bitget"],
  "message": "Trader Survivor API funcionando correctamente"
}
```

### 5.3 Configurar credenciales de API

1. Ve a la sección **Plataformas**
2. Click en **BingX** → **Conectar**
3. Ingresa tus credenciales:
   - API Key: `mx0vgliXB82PLN7Ajr`
   - Secret Key: `9a29ad75229e4d2e987e4b7b22030823`
4. Click en **Guardar**
5. Click en **Probar Conexión**

Si todo está bien, verás: ✅ **Conexión exitosa**

---

## 🎯 Paso 6: Dominio Personalizado (OPCIONAL)

### 6.1 Agregar dominio propio

Si tienes un dominio (ej: `tradersurvivir.com`):

1. En Vercel, ve a tu proyecto
2. Click en **Settings** → **Domains**
3. Ingresa tu dominio
4. Sigue las instrucciones para configurar DNS

### 6.2 Actualizar URLs

Si agregas dominio personalizado, actualiza `PROXY_URL` a:

```javascript
const PROXY_URL = 'https://tradersurvivir.com/api';
```

---

## 🔧 Mantenimiento y Actualizaciones

### Actualizar el código

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel redesplegará automáticamente en 1-2 minutos.

### Ver logs

1. Ve a tu proyecto en Vercel
2. Click en **Deployments**
3. Click en el deployment más reciente
4. Click en **View Function Logs**

---

## ❌ Solución de Problemas

### Error: "404 Not Found" al llamar a /api/...

**Causa:** Las rutas no están configuradas correctamente.

**Solución:**
- Verifica que `vercel.json` esté en la raíz del proyecto
- Verifica que la carpeta `api/` exista con los archivos `.js`

### Error: "Module not found: 'axios'"

**Causa:** Las dependencias no se instalaron.

**Solución:**
- Verifica que `package.json` tenga `axios` en dependencies
- Redeploy el proyecto

### Error: "CORS policy"

**Causa:** Los headers CORS no están configurados.

**Solución:**
- Ya están configurados en los archivos `.js` de `/api`
- Si persiste, agrega tu dominio específico en lugar de `*`

### Las APIs no responden

**Causa:** URL incorrecta o credenciales inválidas.

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta conectar una API
4. Verifica la URL de la petición
5. Verifica que sea: `https://tu-dominio.vercel.app/api/bingx`

---

## 📊 Verificación Final

Checklist antes de usar en producción:

- [ ] ✅ Proyecto subido a GitHub
- [ ] ✅ Deployed en Vercel
- [ ] ✅ `/api/health` responde correctamente
- [ ] ✅ `PROXY_URL` apunta a tu dominio de Vercel
- [ ] ✅ Credenciales de MEXC configuradas
- [ ] ✅ Test de conexión exitoso
- [ ] ✅ Sincronización de trades funciona

---

## 🎉 ¡Listo!

Tu aplicación está en producción y lista para usar.

**URLs importantes:**

- Aplicación: `https://tu-dominio.vercel.app`
- API Health: `https://tu-dominio.vercel.app/api/health`
- Dashboard Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)

---

## 💡 Consejos Finales

1. **Seguridad:** NUNCA expongas tus API Keys en el código
2. **Backups:** GitHub guarda todo tu historial
3. **Monitoreo:** Revisa los logs en Vercel regularmente
4. **Performance:** Vercel tiene analytics gratis
5. **Límites:** Plan gratuito: 100GB bandwidth/mes (más que suficiente)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel
2. Revisa la consola del navegador (F12)
3. Verifica que `PROXY_URL` sea correcto
4. Verifica que `/api/health` funcione

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0