# ⚡ GUÍA ULTRA RÁPIDA - Proxy Siempre Activo

## 🎯 OBJETIVO
Tener el proxy disponible 24/7 GRATIS para que todos los usuarios puedan usar la plataforma.

---

## 📝 PASOS (5 minutos)

### 1️⃣ Crear cuentas (GRATIS)
- **GitHub**: https://github.com/signup
- **Vercel**: https://vercel.com (login con GitHub)

### 2️⃣ Subir a GitHub
```bash
# Abre Git Bash en la carpeta del proyecto
git init
git add .
git commit -m "Deploy proxy"
git remote add origin https://github.com/TU-USUARIO/trader-survivor.git
git push -u origin main
```

### 3️⃣ Desplegar en Vercel
1. Ve a: https://vercel.com/new
2. Selecciona tu repositorio
3. Click "Deploy"
4. ✅ ¡Listo en 30 segundos!

### 4️⃣ Verificar
Abre: `https://tu-dominio.vercel.app/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "exchanges": ["BingX", "MEXC", "Bitget"]
}
```

---

## 🔄 ACTUALIZAR (Después del primer deploy)

Solo ejecuta:
```bash
DEPLOY_RAPIDO.bat
```

O manualmente:
```bash
git add .
git commit -m "Update"
git push
```

**Vercel actualiza automáticamente en 30 segundos.**

---

## ✅ VENTAJAS

✅ **Gratis** - $0 al mes  
✅ **24/7** - Siempre disponible  
✅ **Auto-deploy** - Se actualiza solo  
✅ **HTTPS** - Seguridad incluida  
✅ **Global** - Servidores en todo el mundo  

---

## 🌐 USAR CON OTROS USUARIOS

**Opción 1**: Subir todo a Vercel
- URL para usuarios: `https://tu-app.vercel.app`

**Opción 2**: Solo proxy en Vercel
- Usuarios usan `index.html` local
- El proxy se conecta automáticamente a Vercel
- **No necesitan Node.js instalado**

---

## 📚 MÁS INFORMACIÓN

Lee el archivo completo: `DESPLEGAR_PROXY_VERCEL.md`

---

## ❓ PREGUNTAS

**¿Vercel es gratis?**  
✅ Sí, plan gratuito incluye todo lo que necesitas.

**¿Cuántos usuarios puede soportar?**  
✅ Miles. El plan gratuito tiene 100GB/mes de bandwidth.

**¿Funciona con BingX, Bitget y MEXC?**  
✅ Sí, todos están configurados.

**¿Qué pasa si hago cambios?**  
✅ Ejecuta `DEPLOY_RAPIDO.bat` y se actualiza automáticamente.

---

## 🆘 AYUDA

- **Logs**: https://vercel.com/dashboard → Tu proyecto → Deployments
- **Health check**: `https://tu-dominio.vercel.app/api/health`
- **Consola navegador**: F12 para ver errores

---

**¡Listo para producción!** 🚀
