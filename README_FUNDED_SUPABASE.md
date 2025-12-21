# CONFIGURAR TABLA FUNDED EN SUPABASE

## Pasos para conectar Funded con Supabase:

### 1. Acceder al Dashboard de Supabase
- Ve a: https://supabase.com/dashboard
- Inicia sesión con tu cuenta
- Selecciona tu proyecto: **gakiamardmlgftfrlxkm**

### 2. Crear la tabla funded_accounts

#### Opción A: Usando el SQL Editor (Recomendado)
1. En el menú lateral, selecciona **SQL Editor**
2. Haz clic en **New Query**
3. Copia y pega TODO el contenido del archivo `setup_funded_table.sql`
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Verifica que aparezca: "Success. No rows returned"

#### Opción B: Usando el Table Editor
1. En el menú lateral, selecciona **Table Editor**
2. Haz clic en **Create a new table**
3. Configura:
   - **Name:** `funded_accounts`
   - **Enable Row Level Security (RLS):** ✅ Activado
4. Agrega las siguientes columnas:

| Column Name      | Type      | Default Value | Primary | Nullable |
|------------------|-----------|---------------|---------|----------|
| id               | text      | -             | ✅      | ❌       |
| user_id          | uuid      | auth.uid()    | ❌      | ❌       |
| name             | text      | -             | ❌      | ❌       |
| company          | text      | -             | ❌      | ❌       |
| type             | text      | -             | ❌      | ❌       |
| status           | text      | -             | ❌      | ❌       |
| fee              | numeric   | 0             | ❌      | ✅       |
| activation_date  | text      | -             | ❌      | ✅       |
| earnings         | numeric   | 0             | ❌      | ✅       |
| withdrawals      | integer   | 0             | ❌      | ✅       |
| notes            | text      | -             | ❌      | ✅       |
| created_at       | timestamp | now()         | ❌      | ❌       |
| updated_at       | timestamp | now()         | ❌      | ❌       |

5. Haz clic en **Save**

### 3. Configurar Row Level Security (RLS)

Si usaste la Opción A (SQL Editor), las políticas ya están creadas. Si usaste la Opción B, sigue estos pasos:

1. Ve a **Authentication** > **Policies**
2. Selecciona la tabla `funded_accounts`
3. Haz clic en **New Policy**
4. Crea 4 políticas:

**Política 1 - SELECT (Ver):**
- **Policy name:** Users can view their own funded accounts
- **Policy command:** SELECT
- **Target roles:** authenticated
- **USING expression:** `auth.uid() = user_id`

**Política 2 - INSERT (Crear):**
- **Policy name:** Users can insert their own funded accounts
- **Policy command:** INSERT
- **Target roles:** authenticated
- **WITH CHECK expression:** `auth.uid() = user_id`

**Política 3 - UPDATE (Actualizar):**
- **Policy name:** Users can update their own funded accounts
- **Policy command:** UPDATE
- **Target roles:** authenticated
- **USING expression:** `auth.uid() = user_id`
- **WITH CHECK expression:** `auth.uid() = user_id`

**Política 4 - DELETE (Eliminar):**
- **Policy name:** Users can delete their own funded accounts
- **Policy command:** DELETE
- **Target roles:** authenticated
- **USING expression:** `auth.uid() = user_id`

### 4. Verificar la configuración

1. Ve a **Table Editor**
2. Selecciona `funded_accounts`
3. Deberías ver la tabla vacía (es normal)
4. Ve a **Authentication** > **Policies**
5. Verifica que las 4 políticas estén activas (con check verde ✅)

### 5. Probar la sincronización

1. Abre tu aplicación: `index.html`
2. Inicia sesión con tu usuario
3. Ve a la sección **Funded**
4. Crea una cuenta de prueba:
   - Nombre: "Test FTMO"
   - Compañía: FTMO
   - Tipo: Evaluation
   - Estado: Active
   - Fee: 100
5. Haz clic en **Guardar**
6. Abre la consola del navegador (F12)
7. Deberías ver: `✅ Funded account saved to Supabase successfully`
8. Ve a Supabase > **Table Editor** > `funded_accounts`
9. Deberías ver tu cuenta de prueba allí

### 6. Verificar sincronización bidireccional

1. En Supabase, edita manualmente un campo de la cuenta (por ejemplo, cambia el fee)
2. Cierra sesión en tu aplicación
3. Vuelve a iniciar sesión
4. Ve a **Funded**
5. Deberías ver el cambio reflejado

---

## ✅ Estado de Integración

- [x] Funciones JavaScript creadas
- [x] Sincronización en CREATE
- [x] Sincronización en UPDATE
- [x] Sincronización en DELETE
- [x] Carga inicial desde Supabase
- [x] Subida de datos locales a nube
- [ ] **PENDIENTE: Crear tabla en Supabase** ⬅️ EJECUTA `setup_funded_table.sql`

---

## 🔧 Solución de Problemas

### Error: "relation 'funded_accounts' does not exist"
- **Causa:** La tabla no se ha creado en Supabase
- **Solución:** Ejecuta el script SQL del paso 2

### Error: "new row violates row-level security policy"
- **Causa:** Las políticas RLS no están configuradas correctamente
- **Solución:** Verifica que las 4 políticas estén activas en el paso 3

### No se sincronizan los datos
- **Causa:** No hay usuario autenticado
- **Solución:** Cierra sesión y vuelve a iniciar sesión
- **Verificación:** Abre la consola (F12) y busca "Sincronización inteligente iniciada"

### Los datos no aparecen después de sincronizar
- **Causa:** El filtro de fechas puede estar activo
- **Solución:** Haz clic en "Todo el tiempo" en el selector de fechas

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12) para ver mensajes de error
2. Verifica en Supabase > **Logs** los errores de la base de datos
3. Asegúrate de que tu usuario esté autenticado correctamente
