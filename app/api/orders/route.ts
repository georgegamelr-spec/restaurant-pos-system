import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

// POST - إنشاء طلب جديد + خصم المخزون تلقائياً
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items, taxRate = 0.14, notes } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'tableId و items مطلوبين' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: OrderItem) => sum + item.subtotal,
      0
    );
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // 1. حفظ الطلب في قاعدة البيانات
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          table_id: tableId,
          items: items,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          status: 'open',
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, error: orderError.message },
        { status: 400 }
      );
    }

    // 2. خصم المخزون تلقائياً حسب مكونات وصفة كل صنف
    const deductItems = items.map((item: OrderItem) => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
    }));

    // هنستدعي الدالة مش الـ API عشان نحافظ على الأداء
    const deductionResult = await deductStockForOrder(
      order.id,
      deductItems
    );

    return NextResponse.json({
      success: true,
      order,
      stockDeduction: deductionResult,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - جلب كل الطلبات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('table_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (tableId) query = query.eq('table_id', tableId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * دالة داخلية تخصم المخزون حسب وصفة كل صنف
 */
async function deductStockForOrder(
  orderId: string,
  items: Array<{ menu_item_id: string; quantity: number }>
) {
  const results = [];

  for (const item of items) {
    // جلب مكونات وصفة الصنف
    const { data: recipes } = await supabase
      .from('menu_item_recipes')
      .select(`
        inventory_id,
        quantity,
        unit,
        inventory:inventory_id (
          id,
          product_name,
          quantity_on_hand
        )
      `)
      .eq('menu_item_id', item.menu_item_id);

    if (!recipes || recipes.length === 0) continue;

    for (const recipe of recipes) {
      const inv = recipe.inventory as {
        id: string;
        product_name: string;
        quantity_on_hand: number;
      } | null;

      if (!inv) continue;

      const deductQty = convertToGrams(recipe.quantity, recipe.unit) * item.quantity;
      const newQty = Math.max(0, inv.quantity_on_hand - deductQty);

      // خصم من المخزون
      await supabase
        .from('inventory')
        .update({
          quantity_on_hand: newQty,
          last_updated: new Date().toISOString(),
          status:
            newQty === 0 ? 'out_of_stock' : newQty <= 500 ? 'low_stock' : 'in_stock',
        })
        .eq('id', inv.id);

      // سجل حركة المخزون
      await supabase.from('stock_movements').insert([{
        inventory_id: inv.id,
        movement_type: 'sale_deduction',
        quantity: -deductQty,
        unit: 'g',
        reference_id: orderId,
        reference_type: 'order',
        notes: `خصم بيع طلب ${orderId}`,
        created_at: new Date().toISOString(),
      }]);

      results.push({
        ingredient: inv.product_name,
        deducted: deductQty,
        remaining: newQty,
        unit: 'g',
      });
    }
  }

  return results;
}

/** تحويل أي وحدة للجرام */
function convertToGrams(qty: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'kg': return qty * 1000;
    case 'liter': case 'l': return qty * 1000;
    case 'gram': case 'g': return qty;
    case 'ml': return qty;
    default: return qty;
  }
}
