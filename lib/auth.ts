'use client';
// Client-side authentication utilities that integrate with API routes
// Note: The authToken JWT is stored as an HTTP-only cookie by the login API.
// The middleware reads this cookie to protect routes.
// This file stores user profile info in localStorage for quick access on the client.

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

export interface SignupResult {
  success: boolean;
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

/**
 * Login user via API endpoint.
 * The API sets the authToken as an HTTP-only cookie automatically.
 * We store the user object in localStorage for client-side access.
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    if (!validatePassword(password)) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // credentials: 'include' ensures cookies are sent/received
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    // Store user info in localStorage for quick client-side access
    // (token is stored as HTTP-only cookie by the server)
    if (data.user) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Signup user via API endpoint.
 */
export async function signupUser(email: string, password: string): Promise<SignupResult> {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    if (!validatePassword(password)) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Signup failed' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Logout: calls logout API to clear the HTTP-only cookie, then clears localStorage.
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem('currentUser');
  }
}

/**
 * Get the current user from localStorage (client-side only).
 * The actual auth is via HTTP-only cookie read by middleware.
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated by checking localStorage user.
 * For server-side auth checking, the middleware handles it via cookie.
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: AuthUser['role']): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export function hasAnyRole(roles: AuthUser['role'][]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}
