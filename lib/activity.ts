import { createClient } from '@/utils/supabase/server';

export interface ActivityLog {
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}

export async function logActivity(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        details,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
