import { createClient, type Session, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  },
});

export type SupabaseAuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const resolveSafeRedirect = (redirectTo?: string) => {
  if (!redirectTo) return window.location.origin;

  try {
    const parsed = new URL(redirectTo, window.location.origin);
    return parsed.origin === window.location.origin ? parsed.toString() : window.location.origin;
  } catch {
    return window.location.origin;
  }
};

export const signInWithGoogle = async (redirectTo?: string) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: resolveSafeRedirect(redirectTo),
    },
  });

  if (error) {
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};
