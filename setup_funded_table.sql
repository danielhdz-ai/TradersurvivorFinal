-- Crear tabla para cuentas funded en Supabase
CREATE TABLE IF NOT EXISTS funded_accounts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('evaluation', 'live')),
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
    fee NUMERIC DEFAULT 0,
    activation_date TEXT,
    earnings NUMERIC DEFAULT 0,
    withdrawals INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_funded_accounts_user_id ON funded_accounts(user_id);

-- Índice para filtros por tipo
CREATE INDEX IF NOT EXISTS idx_funded_accounts_type ON funded_accounts(type);

-- Índice para filtros por estado
CREATE INDEX IF NOT EXISTS idx_funded_accounts_status ON funded_accounts(status);

-- Políticas de seguridad (Row Level Security)
ALTER TABLE funded_accounts ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias cuentas funded
CREATE POLICY "Users can view their own funded accounts"
    ON funded_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias cuentas funded
CREATE POLICY "Users can insert their own funded accounts"
    ON funded_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias cuentas funded
CREATE POLICY "Users can update their own funded accounts"
    ON funded_accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias cuentas funded
CREATE POLICY "Users can delete their own funded accounts"
    ON funded_accounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_funded_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_funded_accounts_updated_at
    BEFORE UPDATE ON funded_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_funded_accounts_updated_at();
