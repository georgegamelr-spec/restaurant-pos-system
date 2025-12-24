'use client';

import { supabase } from './supabase';
import type { AuthError } from '@supabase/supabase-js';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface PasswordResetData {
  email: string;
}

export async function signUp(data: SignUpData) {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error) throw error;
    return { success: true, data: authData };
  } catch (error) {
    return { success: false, error: (error as AuthError).message };
  }
}

export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return { success: true, data: authData };
  } catch (error) {
    return { success: false, error: (error as AuthError).message };
  }
}

export async function resetPassword(data: PasswordResetData) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/password-reset`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as AuthError).message };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as AuthError).message };
  }
}

export async function verifyEmail(token: string) {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as AuthError).message };
  }
}
