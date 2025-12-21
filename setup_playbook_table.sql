-- Crear tabla para setups de Playbook en Supabase
CREATE TABLE IF NOT EXISTS setups (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    description TEXT,
    tags TEXT,
    images TEXT[], -- Array de imágenes en base64
    
    -- Campos para estadísticas (se calculan desde operations)
    times_used INTEGER DEFAULT 0,
    last_used_date TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_setups_user_id ON setups(user_id);

-- Índice para filtros por categoría
CREATE INDEX IF NOT EXISTS idx_setups_category ON setups(category);

-- Índice para filtros por rating
CREATE INDEX IF NOT EXISTS idx_setups_rating ON setups(rating);

-- Índice para búsqueda por fecha de creación
CREATE INDEX IF NOT EXISTS idx_setups_created_at ON setups(created_at DESC);

-- Políticas de seguridad (Row Level Security)
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios setups
CREATE POLICY "Users can view their own setups"
    ON setups
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios setups
CREATE POLICY "Users can insert their own setups"
    ON setups
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios setups
CREATE POLICY "Users can update their own setups"
    ON setups
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios setups
CREATE POLICY "Users can delete their own setups"
    ON setups
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_setups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_setups_updated_at
    BEFORE UPDATE ON setups
    FOR EACH ROW
    EXECUTE FUNCTION update_setups_updated_at();
