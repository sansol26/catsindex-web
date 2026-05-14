import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Category = 'food' | 'litter' | 'supplies';

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: Category;
  subcategory: string | null;
  image_url: string | null;
  coupang_affiliate_url: string | null;
  naver_affiliate_url: string | null;
  current_price: number;
  prev_price: number | null;
  price_updated_at: string;
  unit_size: number | null;
  unit_type: string | null;
  unit_price: number | null;
}

export interface PriceHistory {
  price: number;
  recorded_at: string;
}

export interface StorePrice {
  store_name: string;
  price: number;
  recorded_at: string;
}

export type SortOption = 'price_asc' | 'price_desc' | 'unit_price_asc' | 'unit_price_desc';

export interface ProductFilters {
  sort?: SortOption;
  unitType?: string;       // 'kg' | 'L' | 'g' | 'ml'
  minUnitPrice?: number;
  maxUnitPrice?: number;
  minSize?: number;
  maxSize?: number;
  brand?: string;
}

export async function getProducts(
  category?: Category,
  page = 1,
  pageSize = 60,
  search?: string,
  subcategory?: string,
  filters?: ProductFilters,
): Promise<{ data: Product[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sort = filters?.sort ?? 'price_asc';
  const orderCol   = sort.startsWith('unit_price') ? 'unit_price' : 'current_price';
  const ascending  = sort.endsWith('_asc');

  let query = supabase
    .from('product_lowest_prices')
    .select('*', { count: 'exact' })
    .order(orderCol, { ascending, nullsFirst: false })
    .range(from, to);

  if (category)               query = query.eq('category', category);
  if (subcategory)            query = query.eq('subcategory', subcategory);
  if (search)                 query = query.ilike('name', `%${search}%`);
  if (filters?.unitType)      query = query.eq('unit_type', filters.unitType);
  if (filters?.minUnitPrice)  query = query.gte('unit_price', filters.minUnitPrice);
  if (filters?.maxUnitPrice)  query = query.lte('unit_price', filters.maxUnitPrice);
  if (filters?.minSize)       query = query.gte('unit_size', filters.minSize);
  if (filters?.maxSize)       query = query.lte('unit_size', filters.maxSize);
  if (filters?.brand)         query = query.eq('brand', filters.brand);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('product_lowest_prices')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getPriceHistory(productId: string): Promise<PriceHistory[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('price, recorded_at')
    .eq('product_id', productId)
    .order('recorded_at', { ascending: true })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

/** 카테고리별 브랜드 목록 (최대 200개, 알파벳순) */
export async function getBrands(category: Category): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .eq('category', category)
    .not('brand', 'is', null)
    .order('brand', { ascending: true });
  if (error || !data) return [];
  const unique = [...new Set(data.map(r => r.brand as string).filter(Boolean))];
  return unique.slice(0, 200);
}

export async function getStorePrices(productId: string): Promise<StorePrice[]> {
  const { data, error } = await supabase
    .from('store_prices')
    .select('store_name, price, recorded_at')
    .eq('product_id', productId)
    .order('recorded_at', { ascending: false })
    .limit(50);
  if (error) return [];
  if (!data || data.length === 0) return [];

  const latestDate = data[0].recorded_at.slice(0, 10);
  const recent = data.filter(d => d.recorded_at.slice(0, 10) === latestDate);

  const storeMap = new Map<string, StorePrice>();
  for (const row of recent) {
    if (!storeMap.has(row.store_name) || row.price < storeMap.get(row.store_name)!.price) {
      storeMap.set(row.store_name, row);
    }
  }
  return [...storeMap.values()].sort((a, b) => a.price - b.price);
}
