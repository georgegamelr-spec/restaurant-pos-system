-- ====================================================
-- SQL Migration: sub_recipes (وصفات فرعية)
-- الوصفة الفرعية = مكون له مكونات خاصة به
-- مثال: صوص البرجر هو مكون في البرجر، لكن عنده وصفته: طماطم + ثوم + زيت
-- Run this in Supabase Dashboard > SQL Editor
-- ====================================================

-- جدول الوصفات الفرعية
-- كل سطر يقول: المكون X (من المخزون) يتكون من المكون Y بكمية Z
CREATE TABLE IF NOT EXISTS sub_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- المكون الأصلي (parent): مكون موجود في inventory وهو نفسه له وصفة فرعية
  parent_inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  -- المكون الفرعي: مكون من المخزون
  child_inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'g',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- لا يمكن تكرار نفس المكون الفرعي تحت نفس الأصل
  UNIQUE(parent_inventory_id, child_inventory_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_recipes_parent ON sub_recipes(parent_inventory_id);
CREATE INDEX IF NOT EXISTS idx_sub_recipes_child ON sub_recipes(child_inventory_id);

ALTER TABLE sub_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read sub_recipes" ON sub_recipes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sub_recipes" ON sub_recipes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update sub_recipes" ON sub_recipes
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete sub_recipes" ON sub_recipes
  FOR DELETE TO authenticated USING (true);

-- ====================================================
-- كيف يشتغل النظام بعد التطبيق:
-- 1. تعمل وصفة للأيتم المباع: برجر -> صوص 50g
-- 2. تعمل وصفة فرعية للصوص: صوص -> طماطم 30g + ثوم 5g + زيت 15ml
-- 3. عند البيع:
--    - السيستم يشوف البرجر محتاج صوص 50g
--    - يشوف الصوص عنده وصفة فرعية
--    - يخصم من المخزون: طماطم 30g + ثوم 5g + زيت 15ml
--    - مش يخصم الصوص نفسه (لأنه مكون مركب)
-- ====================================================
