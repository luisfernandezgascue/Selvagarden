-- Add modo_aplicacion column to products for shelf labels
ALTER TABLE products
ADD COLUMN IF NOT EXISTS modo_aplicacion TEXT;

COMMENT ON COLUMN products.modo_aplicacion IS 'Usage instructions shown on shelf labels (etiquetas de anaquel). Displayed as "Modo de uso: ..." If null, shows default text.';
