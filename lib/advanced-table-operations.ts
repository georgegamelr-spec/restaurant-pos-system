// Advanced Table Operations Library
// Handles split, transfer, and bill splitting operations

import { createClient } from '@/utils/supabase/server';

interface SplitTableRequest {
  original_table_id: string;
  new_table_id: string;
  order_ids: string[];
}

interface TransferTableRequest {
  source_table_id: string;
  target_table_id: string;
  order_ids?: string[];
}

interface SplitBillRequest {
  order_id: string;
  split_count: number;
  items_per_split?: Record<number, string[]>;
}

/**
 * Split a table by transferring selected orders to a new table
 */
export async function splitTable(request: SplitTableRequest) {
  const supabase = createClient();

  try {
    // Move selected orders to new table
    const { error: updateError } = await supabase
      .from('orders')
      .update({ table_id: request.new_table_id })
      .in('id', request.order_ids);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Table split successfully',
      original_table_id: request.original_table_id,
      new_table_id: request.new_table_id,
      orders_moved: request.order_ids.length,
    };
  } catch (error) {
    console.error('Error splitting table:', error);
    throw error;
  }
}

/**
 * Transfer orders between tables
 */
export async function transferOrders(request: TransferTableRequest) {
  const supabase = createClient();

  try {
    const orderIds = request.order_ids || [];

    if (orderIds.length === 0) {
      // Transfer all orders if no specific IDs provided
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', request.source_table_id);

      if (orders) {
        orderIds.push(...orders.map(o => o.id));
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ table_id: request.target_table_id })
      .in('id', orderIds);

    if (error) throw error;

    return {
      success: true,
      message: 'Orders transferred successfully',
      source_table: request.source_table_id,
      target_table: request.target_table_id,
      orders_transferred: orderIds.length,
    };
  } catch (error) {
    console.error('Error transferring orders:', error);
    throw error;
  }
}

/**
 * Split a bill among guests
 */
export async function splitBill(request: SplitBillRequest) {
  const supabase = createClient();

  try {
    // Fetch order items
    const { data: orderItems, error: fetchError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', request.order_id);

    if (fetchError) throw fetchError;

    // Calculate split amounts
    const splits: Record<number, any> = {};

    if (request.items_per_split) {
      // Item-specific splits
      for (let i = 0; i < request.split_count; i++) {
        const itemIds = request.items_per_split[i] || [];
        const items = orderItems?.filter(item =>
          itemIds.includes(item.id)
        ) || [];

        const amount = items.reduce((sum, item) => sum + item.price, 0);
        splits[i] = {
          guest: i + 1,
          items,
          amount,
        };
      }
    } else {
      // Equal split
      const totalAmount =
        orderItems?.reduce((sum, item) => sum + item.price, 0) || 0;
      const amountPerGuest = totalAmount / request.split_count;

      for (let i = 0; i < request.split_count; i++) {
        splits[i] = {
          guest: i + 1,
          items_count: Math.ceil(
            (orderItems?.length || 0) / request.split_count
          ),
          amount: amountPerGuest,
        };
      }
    }

    // Create split bills in database
    const billRecords = Object.entries(splits).map(([index, split]) => ({
      order_id: request.order_id,
      guest_number: parseInt(index) + 1,
      total_guests: request.split_count,
      amount: split.amount,
      items: split.items || [],
      status: 'pending',
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('split_bills')
      .insert(billRecords);

    if (insertError) throw insertError;

    return {
      success: true,
      message: 'Bill split successfully',
      order_id: request.order_id,
      total_guests: request.split_count,
      splits: Object.values(splits),
    };
  } catch (error) {
    console.error('Error splitting bill:', error);
    throw error;
  }
}

/**
 * Get split bill details
 */
export async function getSplitBillDetails(orderId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('split_bills')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching split bill details:', error);
    throw error;
  }
}

/**
 * Update split bill status (mark as paid)
 */
export async function updateSplitBillStatus(
  billId: string,
  status: 'pending' | 'paid'
) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('split_bills')
      .update({
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', billId);

    if (error) throw error;

    return { success: true, message: `Bill marked as ${status}` };
  } catch (error) {
    console.error('Error updating bill status:', error);
    throw error;
  }
}
