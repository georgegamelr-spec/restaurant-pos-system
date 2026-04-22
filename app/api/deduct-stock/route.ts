import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper: convert quantity to grams/ml base unit for comparison
function toBaseUnit(quantity: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'kg': return quantity * 1000;
    case 'liter': return quantity * 1000;
    case 'g':
    case 'ml':
    case 'piece':
    default: return quantity;
  }
}

function fromBaseUnit(quantity: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'kg': return quantity / 1000;
    case 'liter': return quantity / 1000;
    default: return quantity;
  }
}

/**
 * Deduct stock for a single inventory item.
 * If the item has sub_recipes, deduct its children instead.
 * Returns list of { inventory_id, amount_deducted } for logging.
 */
async function deductSingleItem(
  supabase: any,
  inventoryId: string,
  quantityNeeded: number,
  unit: string,
  orderId: string,
  depth = 0
): Promise<{ success: boolean; deducted: any[] }> {
  if (depth > 5) return { success: false, deducted: [] }; // prevent infinite loops

  // Check if this inventory item has sub_recipes
  const { data: subRecipes } = await supabase
    .from('sub_recipes')
    .select('*')
    .eq('parent_inventory_id', inventoryId);

  const hasSubRecipes = subRecipes && subRecipes.length > 0;

  if (hasSubRecipes) {
    // This item is a compound ingredient - deduct its children instead
    const allDeducted: any[] = [];
    for (const sub of subRecipes) {
      // Scale sub-recipe quantity by how many units of parent we need
      // e.g., if burger needs 50g sauce, and sauce recipe is per 100g,
      // we scale: (quantityNeeded / 100) * sub.quantity_needed
      // For simplicity: directly use sub.quantity_needed per 1 unit of parent
      const scaledQty = sub.quantity_needed * quantityNeeded;
      const result = await deductSingleItem(
        supabase,
        sub.child_inventory_id,
        scaledQty,
        sub.unit,
        orderId,
        depth + 1
      );
      allDeducted.push(...result.deducted);
    }
    return { success: true, deducted: allDeducted };
  }

  // No sub_recipes - deduct directly from inventory
  const baseQty = toBaseUnit(quantityNeeded, unit);

  const { data: invItem } = await supabase
    .from('inventory')
    .select('id, quantity_on_hand, unit_of_measure, product_name')
    .eq('id', inventoryId)
    .single();

  if (!invItem) return { success: false, deducted: [] };

  const currentBase = toBaseUnit(invItem.quantity_on_hand, invItem.unit_of_measure);
  const newBase = Math.max(0, currentBase - baseQty);
  const newQty = fromBaseUnit(newBase, invItem.unit_of_measure);

  await supabase
    .from('inventory')
    .update({ quantity_on_hand: newQty })
    .eq('id', inventoryId);

  // Log the movement
  await supabase.from('stock_movements').insert({
    inventory_id: inventoryId,
    movement_type: 'sale_deduction',
    quantity: -baseQty,
    unit: 'base_unit',
    reference_id: orderId,
    reference_type: 'order',
    notes: `Auto deducted for order`,
  }).catch(() => {}); // ignore if stock_movements table doesn't exist

  return {
    success: true,
    deducted: [{ inventory_id: inventoryId, product_name: invItem.product_name, amount: baseQty }],
  };
}

// POST /api/deduct-stock
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { order_id, items } = body;

    // items: [{ menu_item_id, quantity }]
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items array required' }, { status: 400 });
    }

    const allDeducted: any[] = [];

    for (const orderItem of items) {
      const { menu_item_id, quantity } = orderItem;

      // Get the recipe for this menu item
      const { data: recipes } = await supabase
        .from('menu_item_recipes')
        .select('*')
        .eq('menu_item_id', menu_item_id);

      if (!recipes || recipes.length === 0) continue; // no recipe, skip

      for (const recipe of recipes) {
        // Total needed = recipe quantity * order quantity
        const totalNeeded = recipe.quantity_needed * quantity;

        const result = await deductSingleItem(
          supabase,
          recipe.inventory_id,
          totalNeeded,
          recipe.unit,
          order_id || 'unknown'
        );

        allDeducted.push(...result.deducted);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deducted ${allDeducted.length} inventory items`,
      deducted: allDeducted,
    });
  } catch (error: any) {
    console.error('deduct-stock error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
