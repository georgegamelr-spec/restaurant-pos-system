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

    // Check permission
    const hasPermission = await checkPermission(user.id, 'receipts:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('purchase_receipts')
      .select('*, purchase_order:purchase_orders(id, supplier_id, total_amount), items:receipt_items(*)') 
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/receipts error:', error);
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

    // Check permission
    const hasPermission = await checkPermission(user.id, 'receipts:create');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { purchase_order_id, items, received_date, notes } = body;

    // Create receipt
    const { data: receipt, error } = await supabase
      .from('purchase_receipts')
      .insert([
        {
          purchase_order_id,
          received_date,
          notes,
          created_by: user.id,
          status: 'received',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Insert receipt items and update inventory
    for (const item of items) {
      // Insert receipt item
      const { error: itemError } = await supabase
        .from('receipt_items')
        .insert([
          {
            receipt_id: receipt.id,
            product_id: item.product_id,
            quantity_received: item.quantity_received,
            unit_cost: item.unit_cost,
          },
        ]);

      if (itemError) throw itemError;

      // Update inventory
      const { data: currentStock } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single();

      if (currentStock) {
        await supabase
          .from('inventory')
          .update({
            quantity: currentStock.quantity + item.quantity_received,
            updated_at: new Date().toISOString(),
          })
          .eq('product_id', item.product_id);
      } else {
        // Create new inventory entry if it doesn't exist
        await supabase
          .from('inventory')
          .insert([
            {
              product_id: item.product_id,
              quantity: item.quantity_received,
              warehouse_id: '1', // Default warehouse
            },
          ]);
      }
    }

    // Update purchase order status
    await supabase
      .from('purchase_orders')
      .update({ status: 'received' })
      .eq('id', purchase_order_id);

    // Log activity
    await logActivity(user.id, 'create_receipt', `Received items for PO #${purchase_order_id}`, 'purchase_receipts', receipt.id);

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error('POST /api/receipts error:', error);
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

    // Check permission
    const hasPermission = await checkPermission(user.id, 'receipts:update');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { notes, status } = body;

    const { data, error } = await supabase
      .from('purchase_receipts')
      .update({
        notes,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(user.id, 'update_receipt', `Updated receipt #${id}`, 'purchase_receipts', id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT /api/receipts error:', error);
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

    // Check permission
    const hasPermission = await checkPermission(user.id, 'receipts:delete');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Delete receipt items
    await supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', id);

    const { error } = await supabase
      .from('purchase_receipts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await logActivity(user.id, 'delete_receipt', `Deleted receipt #${id}`, 'purchase_receipts', id);

    return NextResponse.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/receipts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  }
