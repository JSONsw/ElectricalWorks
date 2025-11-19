import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

(async () => {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase database');
    }
  })();

// Initialize database schema (run this once via SQL Editor in Supabase)
export async function initDatabase() {
  // This should be run via Supabase SQL Editor
  // See SUPABASE_SETUP.md for the SQL schema
  console.log('Database schema should be created via Supabase SQL Editor. See SUPABASE_SETUP.md');
  
  // Create default admin user if it doesn't exist
  const { data: adminCheck } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@crm.com')
    .single();

  if (!adminCheck) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const { error } = await supabase.from('users').insert({
      email: 'admin@crm.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    });
    if (error) {
      console.error('Error creating admin user:', error);
    }
  }
}

// Database helper functions
export async function dbGet(table: string, filters: any = {}, select: string = '*') {
  let query = supabase.from(table).select(select);

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('dbGet error:', error);
    throw error;
  }
  return data || null;
}

export async function dbAll(table: string, filters: any = {}, select: string = '*', orderBy?: string) {
  let query = supabase.from(table).select(select);

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    }
  }

  // Apply ordering
  if (orderBy) {
    const [column, direction] = orderBy.split(' ');
    query = query.order(column, { ascending: direction !== 'DESC' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('dbAll error:', error);
    throw error;
  }
  return data || [];
}

export async function dbRun(table: string, data: any, operation: 'insert' | 'update' | 'delete' = 'insert', filters?: any) {
  if (operation === 'insert') {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return result;
  } else if (operation === 'update') {
    let query = supabase.from(table).update(data);
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    const { data: result, error } = await query.select().single();
    if (error) throw error;
    return result;
  } else if (operation === 'delete') {
    let query = supabase.from(table).delete();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    const { error } = await query;
    if (error) throw error;
    return { success: true };
  }
}

// Helper for complex queries with joins
export async function dbQuery(table: string, options: {
  select?: string;
  filters?: any;
  joins?: Array<{ table: string; on: string; type?: 'left' | 'inner' }>;
  orderBy?: string;
}) {
  const { select = '*', filters = {}, joins = [], orderBy } = options;
  
  // Build select with joins
  let selectQuery = select;
  if (joins.length > 0) {
    // For Supabase, we need to use the select format with foreign table references
    // Example: "leads(*), users:assigned_trade_id(*)"
    const joinSelects = joins.map(join => {
      const foreignKey = join.on.split('=')[0].trim();
      return `${join.table}:${foreignKey}(*)`;
    });
    selectQuery = `${select}, ${joinSelects.join(', ')}`;
  }
  
  let query = supabase.from(table).select(selectQuery);
  
  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  
  // Apply ordering
  if (orderBy) {
    const [column, direction] = orderBy.split(' ');
    query = query.order(column, { ascending: direction !== 'DESC' });
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('dbQuery error:', error);
    throw error;
  }
  return data || [];
}

// Export supabase client for direct access if needed
export default supabase;
