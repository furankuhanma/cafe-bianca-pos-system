import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    console.error('Supabase error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
  return { success: true };
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};
