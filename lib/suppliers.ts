// Supplier Management Utilities
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface Supplier {
  id: string;
  restaurant_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  lead_time_days?: number;
  min_order_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  lead_time_days?: number;
  min_order_quantity?: number;
}

// Create new supplier
export async function createSupplier(
  restaurantId: string,
  data: CreateSupplierInput
): Promise<Supplier> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert([{
      restaurant_id: restaurantId,
      ...data,
      is_active: true,
    }])
    .select()
    .single();
    
  if (error) throw new Error(`Failed to create supplier: ${error.message}`);
  return supplier as Supplier;
}

// Get all suppliers for a restaurant
export async function getSupplers(restaurantId: string): Promise<Supplier[]> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: suppliers, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name');
    
  if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
  return suppliers as Supplier[];
}

// Get supplier by ID
export async function getSupplierById(supplierId: string): Promise<Supplier> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();
    
  if (error) throw new Error(`Failed to fetch supplier: ${error.message}`);
  return supplier as Supplier;
}

// Update supplier
export async function updateSupplier(
  supplierId: string,
  data: Partial<CreateSupplierInput>
): Promise<Supplier> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', supplierId)
    .select()
    .single();
    
  if (error) throw new Error(`Failed to update supplier: ${error.message}`);
  return supplier as Supplier;
}

// Soft delete supplier
export async function deleteSupplier(supplierId: string): Promise<void> {
  const supabase = createServerComponentClient({ cookies });
  
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', supplierId);
    
  if (error) throw new Error(`Failed to delete supplier: ${error.message}`);
}

// Calculate supplier performance metrics
export async function getSupplierMetrics(supplierId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get metrics from database
  const { data: metrics, error } = await supabase
    .from('supplier_metrics')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('month', { ascending: false })
    .limit(12);
    
  if (error) throw new Error(`Failed to fetch metrics: ${error.message}`);
  return metrics;
}

// Get supplier costs for items
export async function getSupplierCosts(
  supplierId: string,
  itemIds: string[]
) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: costs, error } = await supabase
    .from('supplier_item_costs')
    .select('*')
    .eq('supplier_id', supplierId)
    .in('item_id', itemIds);
    
  if (error) throw new Error(`Failed to fetch costs: ${error.message}`);
  return costs;
}
