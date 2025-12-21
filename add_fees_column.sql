-- Script para agregar la columna 'fees' a la tabla operations
-- Ejecuta este comando en el SQL Editor de Supabase

ALTER TABLE operations ADD COLUMN IF NOT EXISTS fees numeric DEFAULT 0;

-- Actualizar operaciones existentes que no tienen fees (opcional)
UPDATE operations SET fees = 0 WHERE fees IS NULL;
