import { NextRequest, NextResponse } from 'next/server';
import { resetPassword, updatePassword } from '@/lib/auth-supabase';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, token } = body;

    // Request password reset
    if (email && !token) {
      const result = await resetPassword({ email });
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Password reset link sent to your email' },
        { status: 200 }
      );
    }

    // Update password with token
    if (token && newPassword) {
      const result = await updatePassword(newPassword);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Password updated successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
