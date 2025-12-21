# 🚀 Despliegue del Proxy en Vercel - SIEMPRE ACTIVO

Esta guía te permitirá tener el proxy **disponible 24/7 GRATIS** para que todos los usuarios puedan usar la plataforma.

---

## ✅ VENTAJAS DE VERCEL

- 🌍 **Disponible 24/7** - Nunca se apaga
- 💰 **GRATIS** - No cuesta nada
- ⚡ **Rápido** - Servidores globales
- 🔄 **Auto-deploy** - Se actualiza automáticamente cuando haces cambios
- 🔒 **HTTPS gratis** - Seguridad incluida

---

## 📋 PASO 1: Preparar tu cuenta

### 1.1 Crear cuenta en Vercel (si no la tienes)

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel

### 1.2 Crear cuenta en GitHub (si no la tienes)

1. Ve a [github.com](https://github.com)
2. Click en **"Sign up"**
3. Completa el registro

---

## 📋 PASO 2: Subir el proyecto a GitHub

### 2.1 Abrir Git Bash en tu carpeta del proyecto

1. Abre la carpeta `tradersurvivir su` en el explorador
2. Click derecho → **"Git Bash Here"** (si no aparece, instala Git desde [git-scm.com](https://git-scm.com))

### 2.2 Inicializar Git (si no lo has hecho)

```bash
git init
```

### 2.3 Crear .gitignore

Crea un archivo llamado `.gitignore` en la raíz con este contenido:

```
node_modules/
.env
.env.local
*.log
.DS_Store
.vercel
```

### 2.4 Hacer commit

```bash
git add .
git commit -m "Deploy: Trader Survivor con proxy"
```

### 2.5 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. **Nombre del repositorio**: `trader-survivor-proxy`
3. **Público o Privado**: Tu elección (ambos funcionan)
4. **NO marques** ninguna casilla (README, .gitignore, etc.)
5. Click en **"Create repository"**

### 2.6 Conectar y subir

GitHub te mostrará comandos similares a estos (cópialos de TU página):

```bash
git remote add origin https://github.com/TU-USUARIO/trader-survivor-proxy.git
git branch -M main
git push -u origin main
```

**IMPORTANTE:** Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## 📋 PASO 3: Desplegar en Vercel

### 3.1 Importar proyecto

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Si no ves tu repositorio, click en **"Adjust GitHub App Permissions"** y da acceso
3. Selecciona el repositorio **`trader-survivor-proxy`**
4. Click en **"Import"**

### 3.2 Configurar proyecto

En la pantalla de configuración:

- **Project Name**: `trader-survivor-proxy` (o el que prefieras)
- **Framework Preset**: Deja **"Other"**
- **Root Directory**: `./` (dejar por defecto)
- **Build Command**: Dejar vacío
- **Output Directory**: Dejar vacío
- **Environment Variables**: No añadas nada por ahora

### 3.3 Desplegar

1. Click en **"Deploy"**
2. Espera 30-60 segundos
3. ✅ **¡Listo!** Vercel te dará una URL como: `https://trader-survivor-proxy.vercel.app`

---

## 📋 PASO 4: Configurar la URL en tu aplicación

### 4.1 Obtener tu URL de Vercel

Después del deploy, Vercel te mostrará algo como:

```
https://trader-survivor-proxy-abc123.vercel.app
```

**Copia esta URL completa.**

### 4.2 Ya está configurado automáticamente ✅

**¡No necesitas hacer nada!** El código ya detecta automáticamente si está en producción o desarrollo:

- **En Vercel** (producción): Usa `https://tu-dominio.vercel.app/api`
- **En tu PC** (desarrollo): Usa `http://127.0.0.1:8003`

---

## 🧪 PASO 5: Probar que funciona

### 5.1 Verificar el proxy

Abre en tu navegador:

```
https://TU-DOMINIO.vercel.app/api/health
```

Deberías ver algo como:

```json
{
  "status": "OK",
  "timestamp": "2025-12-21T...",
  "environment": "production",
  "version": "1.0.0",
  "exchanges": ["BingX", "MEXC", "Bitget"],
  "message": "Trader Survivor API funcionando correctamente"
}
```

### 5.2 Probar tu aplicación

1. Sube también el `index.html` a Vercel (mismo proceso)
2. O abre tu `index.html` local
3. Abre la consola del navegador (F12)
4. Deberías ver:

```
🌍 Modo: PRODUCCIÓN
🔗 Proxy URL: https://tu-dominio.vercel.app/api
✅ Proxy server activo: {...}
```

---

## 🔄 ACTUALIZACIONES AUTOMÁTICAS

Cada vez que hagas cambios en tu código:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

**Vercel automáticamente**:
1. Detecta los cambios
2. Redespliega tu aplicación
3. La actualiza en segundos

---

## 🌐 COMPARTIR CON OTROS USUARIOS

Ahora puedes compartir tu aplicación:

**Opción 1: Subir todo a Vercel**
```
https://tu-app.vercel.app
```

**Opción 2: Solo el proxy en Vercel, app local**
- Los usuarios usan tu `index.html` localmente
- La aplicación se conecta automáticamente al proxy en Vercel
- **No necesitan instalar Node.js ni npm**

---

## ❓ PREGUNTAS FRECUENTES

### ¿Vercel es realmente gratis?
✅ Sí, para proyectos personales y pequeños equipos es 100% gratis.

### ¿Cuánto tiempo está activo?
✅ 24/7/365 - Siempre disponible.

### ¿Tengo que pagar por tráfico?
✅ No, el plan gratuito incluye:
- 100 GB de bandwidth/mes
- Unlimited deployments
- Automatic HTTPS

### ¿Puedo usar mi propio dominio?
✅ Sí, en Vercel puedes añadir un dominio personalizado gratis.

### ¿Qué pasa si un usuario usa la app?
✅ El proxy en Vercel maneja las peticiones automáticamente.
✅ No importa cuántos usuarios tengas (dentro de los límites del plan gratuito).

---

## 🎯 RESUMEN RÁPIDO

```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/trader-survivor-proxy.git
git push -u origin main

# 2. Desplegar en Vercel
# Ve a vercel.com/new y selecciona tu repo

# 3. ¡Listo!
# Tu proxy está en: https://tu-dominio.vercel.app
# Health check: https://tu-dominio.vercel.app/api/health
```

---

## 🆘 SOPORTE

Si tienes problemas:

1. **Logs en Vercel**: Ve a tu proyecto → Tab "Deployments" → Click en el deployment → Ver logs
2. **Consola del navegador**: F12 para ver errores
3. **GitHub Issues**: Abre un issue en tu repositorio

---

## ✅ CHECKLIST FINAL

- [ ] Cuenta en GitHub creada
- [ ] Cuenta en Vercel creada
- [ ] Proyecto subido a GitHub
- [ ] Proyecto desplegado en Vercel
- [ ] Health check funcionando
- [ ] Aplicación conectándose al proxy
- [ ] BingX/Bitget/MEXC funcionando

**¡Todo listo para que otros usuarios usen tu plataforma!** 🎉
