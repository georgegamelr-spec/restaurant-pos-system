import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/sub-recipes?parent_inventory_id=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_inventory_id');

    let query = supabase
      .from('sub_recipes')
      .select(`
        *,
        parent:parent_inventory_id(id, product_name, unit_of_measure, quantity_on_hand),
        child:child_inventory_id(id, product_name, unit_of_measure, quantity_on_hand)
      `)
      .order('created_at', { ascending: true });

    if (parentId) {
      query = query.eq('parent_inventory_id', parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sub-recipes
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { parent_inventory_id, child_inventory_id, quantity_needed, unit, notes } = body;

    if (!parent_inventory_id || !child_inventory_id || !quantity_needed) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
    }

    if (parent_inventory_id === child_inventory_id) {
      return NextResponse.json({ error: 'parent and child cannot be the same item' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sub_recipes')
      .insert({ parent_inventory_id, child_inventory_id, quantity_needed, unit: unit || 'g', notes })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/sub-recipes?id=xxx
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await request.json();
    const { quantity_needed, unit, notes } = body;

    const { data, error } = await supabase
      .from('sub_recipes')
      .update({ quantity_needed, unit, notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sub-recipes?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('sub_recipes').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
