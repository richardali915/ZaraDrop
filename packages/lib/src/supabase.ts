import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export async function callFunction(name: string, payload: unknown) {
  const { data, error } = await supabase.functions.invoke(name, { body: payload as any });
  if (error) throw error;
  return data;
}

export async function uploadFile(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function fetchOrdersForUser(userId: string, role: 'customer' | 'store' | 'rider') {
  let query = supabase
    .from('orders')
    .select('id, order_code, status, total, payment_method, payment_status, customer_id, rider_id, store_id, destination, eta, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (role === 'customer') {
    query = query.eq('customer_id', userId);
  } else if (role === 'store') {
    query = query.eq('store_id', userId);
  } else {
    query = query.eq('rider_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createOrder(payload: {
  customer_id: string;
  store_id: string;
  total: number;
  payment_method: string;
  destination: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...payload, status: payload.status ?? 'pending', created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMerchantRequests(storeId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_code, status, total, customer_id, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchOpenRiderJobs() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_code, status, total, customer_id, store_id, eta, created_at')
    .in('status', ['ready', 'pending', 'accepted'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
