import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const range = searchParams.get('range') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date('2000-01-01');
        break;
    }

    let query = supabase
      .from('stock_movements')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('movement_type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch stock movements' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in stock movements API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { product_id, quantity_change, movement_type, reference_id, notes } = body;

    if (!product_id || !quantity_change || !movement_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('stock_movements')
      .insert([
        {
          product_id,
          quantity_change,
          movement_type,
          reference_id,
          notes,
          created_by: 'system', // Would be user ID in production
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to record stock movement' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
