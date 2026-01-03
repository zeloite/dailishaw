-- Add sort_order column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(category_id, sort_order);

-- Initialize sort_order for existing products (order by created_at)
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at ASC) - 1 as row_num
  FROM products
  WHERE sort_order = 0
)
UPDATE products SET sort_order = numbered_products.row_num
FROM numbered_products
WHERE products.id = numbered_products.id;
