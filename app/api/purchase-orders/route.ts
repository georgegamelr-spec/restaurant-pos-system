'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkPermission } from '@/lib/rbac';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkPermission(user.id, 'purchase_orders:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(id, name, contact_person, email, phone), items:purchase_order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/purchase-orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkPermission(user.id, 'purchase_orders:create');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { supplier_id, items, expected_delivery_date, notes } = body;

    const total_amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_cost), 0);

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([
        {
          supplier_id,
          items,
          expected_delivery_date,
          notes,
          total_amount,
          status: 'pending',
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await logActivity(user.id, 'create_purchase_order', `Created PO for supplier ${supplier_id}`, 'purchase_orders', data.id);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/purchase-orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkPermission(user.id, 'purchase_orders:update');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(user.id, 'update_purchase_order', `Updated PO #${id} status to ${status}`, 'purchase_orders', id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT /api/purchase-orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkPermission(user.id, 'purchase_orders:delete');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await supabase
      .from('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);

    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logActivity(user.id, 'delete_purchase_order', `Deleted PO #${id}`, 'purchase_orders', id);

    return NextResponse.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/purchase-orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
