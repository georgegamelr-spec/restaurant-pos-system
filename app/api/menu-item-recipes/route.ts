import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - جلب مكونات وصفة صنف معين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menu_item_id');

    let query = supabase
      .from('menu_item_recipes')
      .select(`
        *,
        inventory:inventory_id (
          id,
          product_name,
          product_code,
          unit_of_measure,
          quantity_on_hand
        )
      `);

    if (menuItemId) {
      query = query.eq('menu_item_id', menuItemId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - إضافة مكون لوصفة صنف
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menu_item_id, inventory_id, quantity, unit } = body;

    if (!menu_item_id || !inventory_id || !quantity || !unit) {
      return NextResponse.json(
        { error: 'menu_item_id و inventory_id و quantity و unit مطلوبة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('menu_item_recipes')
      .insert([
        {
          menu_item_id,
          inventory_id,
          quantity: Number(quantity),
          unit, // gram, kg, liter, ml, piece
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, message: 'تم إضافة المكون بنجاح' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - تعديل كمية مكون في وصفة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity, unit } = body;

    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('menu_item_recipes')
      .update({
        quantity: Number(quantity),
        unit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, message: 'تم التعديل بنجاح' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - حذف مكون من وصفة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    const { error } = await supabase
      .from('menu_item_recipes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
