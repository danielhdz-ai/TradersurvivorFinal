# 🚀 GUÍA RÁPIDA - Subir a Vercel en 5 Minutos

## ✅ LO QUE YA ESTÁ LISTO:

- ✅ Carpeta `/api` con BingX, MEXC y Bitget
- ✅ `vercel.json` configurado
- ✅ `package.json` con dependencias

---

## 📝 PASOS RÁPIDOS:

### 1️⃣ SUBIR A GITHUB (2 minutos)

```bash
# En la terminal, desde la carpeta del proyecto:
git init
git add .
git commit -m "Deploy a Vercel"
```

**Crear repo en GitHub:**
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `trader-survivor`
3. Click en **Create repository**

**Subir:**
```bash
git remote add origin https://github.com/TU-USUARIO/trader-survivor.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ DEPLOY EN VERCEL (2 minutos)

1. Ve a [vercel.com](https://vercel.com)
2. Sign up con GitHub
3. Click en **Add New** → **Project**
4. Selecciona tu repo `trader-survivor`
5. Click en **Deploy**
6. ¡Espera 1-2 minutos!

---

### 3️⃣ ACTUALIZAR URL EN TU CÓDIGO (1 minuto)

Vercel te dará una URL como: `https://trader-survivor-abc123.vercel.app`

**Opción A - Editar en tu PC:**

1. Abre `config.js`
2. Busca la línea 19:
   ```javascript
   productionAPI: 'https://TU-DOMINIO.vercel.app/api',
   ```
3. Cámbiala por:
   ```javascript
   productionAPI: 'https://trader-survivor-abc123.vercel.app/api',
   ```
4. Busca la línea 10:
   ```javascript
   environment: 'development',
   ```
5. Cámbiala por:
   ```javascript
   environment: 'production',
   ```
6. Guarda y sube:
   ```bash
   git add config.js
   git commit -m "Update production URL"
   git push
   ```

**Opción B - Editar en GitHub:**

1. Ve a tu repo en GitHub
2. Abre `config.js`
3. Click en el lápiz (Edit)
4. Cambia `TU-DOMINIO` por tu URL real
5. Cambia `environment: 'development'` por `environment: 'production'`
6. Click en **Commit changes**

---

### 4️⃣ PROBAR (30 segundos)

1. Abre: `https://tu-dominio.vercel.app`
2. Ve a **Plataformas** → **MEXC**
3. Click en **Conectar**
4. Pega tus credenciales:
   - API Key: `mx0vgliXB82PLN7Ajr`
   - Secret Key: `9a29ad75229e4d2e987e4b7b22030823`
5. Click en **Probar Conexión**

✅ Si funciona, ¡ya está en producción!

---

## 🔥 COMANDOS ÚTILES

**Ver tu app:**
```
https://tu-dominio.vercel.app
```

**Ver health check:**
```
https://tu-dominio.vercel.app/api/health
```

**Actualizar después de cambios:**
```bash
git add .
git commit -m "Actualización"
git push
```
*(Vercel redeploya automáticamente)*

---

## ❌ SI ALGO FALLA:

### Error: "404 Not Found" en /api/...
- Verifica que la carpeta `/api` esté en el proyecto
- Verifica que `vercel.json` esté en la raíz

### Error: "Module not found: axios"
- Verifica que `package.json` tenga axios en dependencies
- Redeploy el proyecto

### Las APIs no responden
1. Abre la consola del navegador (F12)
2. Verifica que las URLs sean: `https://tu-dominio.vercel.app/api/mexc`
3. Verifica que `config.js` tenga `environment: 'production'`

---

## 🎉 ¡LISTO!

Tu aplicación está en la nube, funcionando 24/7, sin necesidad de `npm start`.

**Lo que tienes ahora:**
- ✅ App pública en internet
- ✅ APIs funcionando permanentemente
- ✅ Sin servidor local necesario
- ✅ Actualizaciones automáticas con `git push`

---

## 📞 SOPORTE RÁPIDO

**Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
**Ver logs:** Dashboard → Tu proyecto → Deployments → View Function Logs

---

**Tiempo total:** 5-10 minutos  
**Costo:** GRATIS (plan Hobby de Vercel)