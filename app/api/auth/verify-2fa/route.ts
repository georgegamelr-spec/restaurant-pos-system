import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyBackupCode } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, backupCodes, method } = body;

    if (!token || !backupCodes) {
      return NextResponse.json(
        { error: 'Token and backup codes are required' },
        { status: 400 }
      );
    }

    // Verify using OTP token
    if (method === 'token') {
      const verified = verifyToken(token, token);

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid or expired 2FA code' },
          { status: 400 }
        );
      }
    }
    // Verify using backup code
    else if (method === 'backup') {
      const { valid, remaining } = verifyBackupCode(backupCodes, token);

      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid backup code' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          message: '2FA verified successfully',
          remainingBackupCodes: remaining.length,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid verification method' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: '2FA verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
