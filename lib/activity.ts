import { createClient } from '@/utils/supabase/server';

export async function logActivity(
  userId: string,
  action: string,
  description: string,
  resource?: string,
  resourceId?: string
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        description,
        resource,
        resource_id: resourceId,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
