-- ====================================================
-- SQL Migration: menu_item_recipes table
-- Run this in your Supabase SQL Editor
-- ====================================================

-- Create menu_item_recipes table
CREATE TABLE IF NOT EXISTS menu_item_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'g',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by menu item
CREATE INDEX IF NOT EXISTS idx_menu_item_recipes_menu_item_id ON menu_item_recipes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_recipes_inventory_id ON menu_item_recipes(inventory_id);

-- Enable Row Level Security
ALTER TABLE menu_item_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read" ON menu_item_recipes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON menu_item_recipes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON menu_item_recipes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON menu_item_recipes
  FOR DELETE TO authenticated USING (true);

-- Also create stock_movements table if not exists
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) DEFAULT 'g',
  reference_id UUID,
  reference_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_id ON stock_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id ON stock_movements(reference_id);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all" ON stock_movements
  FOR ALL TO authenticated USING (true);

-- ====================================================
-- IMPORTANT: Run this SQL in Supabase Dashboard > SQL Editor
-- ====================================================
