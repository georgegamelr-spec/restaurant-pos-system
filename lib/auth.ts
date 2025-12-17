// Simple client-side authentication utilities
// Note: This is a mock implementation for development purposes
// In production, use a proper auth service like Supabase, Firebase, or Auth0

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'kitchen';
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function loginUser(email: string, password: string): LoginResult {
  if (!validateEmail(email)) {
    return { success: false, error: 'Invalid email format' };
  }
  if (!validatePassword(password)) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  // Mock users for demonstration
  const mockUsers: Record<string, { password: string; user: AuthUser }> = {
    'admin@restaurant.com': {
      password: 'admin123',
      user: { id: '1', email: 'admin@restaurant.com', name: 'مدير', role: 'admin' },
    },
    'manager@restaurant.com': {
      password: 'manager123',
      user: { id: '2', email: 'manager@restaurant.com', name: 'مدير العمليات', role: 'manager' },
    },
    'cashier@restaurant.com': {
      password: 'cashier123',
      user: { id: '3', email: 'cashier@restaurant.com', name: 'كاشير', role: 'cashier' },
    },
  };

  const userRecord = mockUsers[email];
  if (!userRecord || userRecord.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create a simple token (in production, this should be signed JWT from server)
  const token = Buffer.from(JSON.stringify(userRecord.user)).toString('base64');
  return { success: true, token, user: userRecord.user };
}

export function getCurrentUserFromToken(token: string): AuthUser | null {
  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return user as AuthUser;
  } catch {
    return null;
  }
}
