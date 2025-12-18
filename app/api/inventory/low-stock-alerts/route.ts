import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');

    let query = supabase
      .from('low_stock_alerts')
      .select(`
        *,
        products:product_id (*),
        suppliers:supplier_id (*)
      `)
      .eq('dismissed', false)
      .order('alert_level', { ascending: false })
      .order('current_quantity', { ascending: true });

    if (level && level !== 'all') {
      query = query.eq('alert_level', level);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in low stock alerts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { product_id, current_quantity, minimum_threshold, reorder_quantity, alert_level } = body;

    if (!product_id || !current_quantity || !minimum_threshold || !alert_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('low_stock_alerts')
      .insert([
        {
          product_id,
          current_quantity,
          minimum_threshold,
          reorder_quantity,
          alert_level,
          dismissed: false,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const alertId = url.pathname.split('/').pop();

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('low_stock_alerts')
      .update({ dismissed: true })
      .eq('id', alertId)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to dismiss alert' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
