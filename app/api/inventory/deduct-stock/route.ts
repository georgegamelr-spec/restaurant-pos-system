import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * دالة تحويل الوحدات للوحدة الأساسية للمخزون (gram)
 * الكمية دائماي تخزن بالجرام في المخزون
 */
function convertToBaseUnit(quantity: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'gram':
    case 'g':
      return quantity;
    case 'kg':
    case 'kilogram':
      return quantity * 1000;
    case 'ml':
    case 'milliliter':
      return quantity; // ml == gram في السوائل
    case 'liter':
    case 'l':
      return quantity * 1000;
    case 'piece':
    case 'pcs':
    case 'unit':
      return quantity; // القطعة = دائماً 1
    default:
      return quantity;
  }
}

/**
 * POST /api/inventory/deduct-stock
 * خصم المخزون لكل صنف تم بيعه حسب مكونات وصفته
 *
 * البيانات المطلوبة:
 * {
 *   order_id: string,
 *   items: [
 *     { menu_item_id: string, quantity: number },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'لازم تبعت عناصر الطلب' },
        { status: 400 }
      );
    }

    const deductionResults: Array<{
      menu_item_id: string;
      inventory_id: string;
      ingredient_name: string;
      deducted_quantity: number;
      unit: string;
      remaining_stock: number;
      success: boolean;
      error?: string;
    }> = [];

    const stockErrors: string[] = [];

    // لكل صنف في الطلب
    for (const orderItem of items) {
      const { menu_item_id, quantity: orderedQty } = orderItem;

      // 1. جلب مكونات الوصفة لهذا الصنف
      const { data: recipes, error: recipesError } = await supabase
        .from('menu_item_recipes')
        .select(`
          id,
          inventory_id,
          quantity,
          unit,
          inventory:inventory_id (
            id,
            product_name,
            quantity_on_hand,
            unit_of_measure
          )
        `)
        .eq('menu_item_id', menu_item_id);

      if (recipesError || !recipes || recipes.length === 0) {
        // لو مفيش وصفة للصنف - متابع بدون خصم
        continue;
      }

      // 2. لكل مكون في الوصفة
      for (const recipe of recipes) {
        const inv = recipe.inventory as {
          id: string;
          product_name: string;
          quantity_on_hand: number;
          unit_of_measure: string;
        } | null;

        if (!inv) continue;

        // احسب الكمية المطلوب خصمها (مكون * عدد الصنف المطلوب)
        const quantityInBaseUnit = convertToBaseUnit(recipe.quantity, recipe.unit) * orderedQty;

        // 3. تحقق إن الكمية كافية
        if (inv.quantity_on_hand < quantityInBaseUnit) {
          stockErrors.push(
            `المخزون غير كافي لـ: ${inv.product_name} (متوفر: ${inv.quantity_on_hand}g, مطلوب: ${quantityInBaseUnit}g)`
          );
          deductionResults.push({
            menu_item_id,
            inventory_id: inv.id,
            ingredient_name: inv.product_name,
            deducted_quantity: quantityInBaseUnit,
            unit: 'g',
            remaining_stock: inv.quantity_on_hand,
            success: false,
            error: 'مخزون غير كافي',
          });
          continue;
        }

        // 4. خصم الكمية من المخزون
        const newQuantity = inv.quantity_on_hand - quantityInBaseUnit;

        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            quantity_on_hand: newQuantity,
            last_updated: new Date().toISOString(),
            status:
              newQuantity === 0
                ? 'out_of_stock'
                : newQuantity <= 500 // أقل من 500 جرام = low_stock
                ? 'low_stock'
                : 'in_stock',
          })
          .eq('id', inv.id);

        if (updateError) {
          deductionResults.push({
            menu_item_id,
            inventory_id: inv.id,
            ingredient_name: inv.product_name,
            deducted_quantity: quantityInBaseUnit,
            unit: 'g',
            remaining_stock: inv.quantity_on_hand,
            success: false,
            error: updateError.message,
          });
          continue;
        }

        // 5. سجل حركة المخزون
        await supabase.from('stock_movements').insert([
          {
            inventory_id: inv.id,
            movement_type: 'sale_deduction',
            quantity: -quantityInBaseUnit,
            unit: 'g',
            reference_id: order_id || null,
            reference_type: 'order',
            notes: `خصم بيع - صنف ${menu_item_id} x${orderedQty}`,
            created_at: new Date().toISOString(),
          },
        ]);

        deductionResults.push({
          menu_item_id,
          inventory_id: inv.id,
          ingredient_name: inv.product_name,
          deducted_quantity: quantityInBaseUnit,
          unit: 'g',
          remaining_stock: newQuantity,
          success: true,
        });
      }
    }

    // لو فيه أخطاء مخزون - هيرجع تحذير بسو مايوقفش الطلب
    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          warning: 'بعض المكونات مخزونها غير كافي',
          errors: stockErrors,
          results: deductionResults,
        },
        { status: 207 } // 207 = Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم خصم المخزون بنجاح',
      results: deductionResults,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
