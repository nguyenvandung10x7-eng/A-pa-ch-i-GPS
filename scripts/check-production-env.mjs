const isProduction = process.env.CONTEXT === 'production';

if (!isProduction) {
  process.exit(0);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

const failures = [];

if (!supabaseUrl) {
  failures.push('VITE_SUPABASE_URL is missing');
} else {
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== 'https:') failures.push('VITE_SUPABASE_URL must use https');
    if (parsed.hostname === 'your-project.supabase.co' || parsed.hostname.includes('your-project')) {
      failures.push('VITE_SUPABASE_URL still uses the example placeholder');
    }
  } catch {
    failures.push('VITE_SUPABASE_URL is not a valid absolute URL');
  }
}

if (!supabaseAnonKey) {
  failures.push('VITE_SUPABASE_ANON_KEY is missing');
} else if (supabaseAnonKey === 'your-anon-key' || supabaseAnonKey.includes('your-anon-key')) {
  failures.push('VITE_SUPABASE_ANON_KEY still uses the example placeholder');
}

if (failures.length > 0) {
  console.error('Production environment validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Production environment validation passed.');
