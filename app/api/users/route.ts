'use server';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/rbac';

const supabase = createRouteHandlerClient({ cookies });

// GET: List all users with pagination (Admin/Manager only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permission
    const canView = await hasPermission(user.id, 'user:read');
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch users
    let query = supabase.from('user_profiles').select('*');
    
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, restaurant_id } = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permission
    const canCreate = await hasPermission(user.id, 'user:create');
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) throw signUpError;

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authUser.user.id,
          email,
          full_name: fullName,
          role,
          restaurant_id,
          created_by: user.id,
        },
      ])
      .select();

    if (profileError) throw profileError;

    // Log activity
    await supabase.from('user_activity_logs').insert([
      {
        user_id: user.id,
        action: 'create_user',
        target_id: authUser.user.id,
        description: `Created user ${email} with role ${role}`,
      },
    ]);

    return NextResponse.json({
      data: profile[0],
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update user
export async function PUT(request: NextRequest) {
  try {
    const { id, email, fullName, role, isActive } = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permission
    const canUpdate = await hasPermission(user.id, 'user:update');
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update auth user email if provided
    if (email) {
      await supabase.auth.admin.updateUserById(id, { email });
    }

    // Update user profile
    const updateData: any = {};
    if (fullName) updateData.full_name = fullName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('user_activity_logs').insert([
      {
        user_id: user.id,
        action: 'update_user',
        target_id: id,
        description: `Updated user profile`,
      },
    ]);

    return NextResponse.json({
      data: profile[0],
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permission
    const canDelete = await hasPermission(user.id, 'user:delete');
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('user_activity_logs').insert([
      {
        user_id: user.id,
        action: 'delete_user',
        target_id: id,
        description: 'Soft deleted user',
      },
    ]);

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
