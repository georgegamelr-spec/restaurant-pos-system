import { supabase } from '../supabase';
import { OrderRow, OrderItemRow } from './tables';
import { Order, OrderItem } from '@/types/restaurant';

// Get all orders with optional filtering
export async function getAllOrders(filters?: {
  status?: string;
  tableId?: string;
}) {
  let query = supabase.from('orders').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.tableId) {
    query = query.eq('table_id', filters.tableId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as OrderRow[];
}

// Get a single order by ID
export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data as OrderRow;
}

// Get order items for an order
export async function getOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data as OrderItemRow[];
}

// Create a new order
export async function createOrder(tableId: string, taxRate: number = 0.15) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        table_id: tableId,
        subtotal: 0,
        tax_rate: taxRate,
        tax_amount: 0,
        total: 0,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as OrderRow;
}

// Add item to order
export async function addOrderItem(
  orderId: string,
  itemId: string,
  item: Omit<OrderItem, 'id'>
) {
  const { data: newItem, error } = await supabase
    .from('order_items')
    .insert([
      {
        order_id: orderId,
        item_id: itemId,
        name_ar: item.nameAr,
        name_en: item.nameEn,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newItem as OrderItemRow;
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: 'open' | 'completed' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'completed' && {
        completed_at: new Date().toISOString(),
      }),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as OrderRow;
}
