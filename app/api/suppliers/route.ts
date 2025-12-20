import { supabase } from '@/lib/supabase/server';

import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('suppliers').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
total: 0,        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      category,
      paymentTerms,
      deliveryDays,
      minOrder,
      notes,
      status = 'active',
    } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if supplier with same email exists
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Supplier with this email already exists' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase.from('suppliers').insert({
      name,
      email,
      phone,
      address,
      city,
      country,
      category,
      paymentTerms,
      deliveryDays,
      minOrder,
      notes,
      status,
      totalOrders: 0,
      averageRating: 0,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Prevent email changes to existing supplier emails
    if (updateData.email) {
      const { data: existing } = await supabase
        .from('suppliers')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Email already in use by another supplier' },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updateData, updatedAt: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Check if supplier has active purchase orders
    const { data: orders } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('supplier_id', id)
      .eq('status', 'pending');

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with active purchase orders' },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('suppliers').delete().eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
