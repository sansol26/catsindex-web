import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://www.catsindex.co.kr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/food`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/litter`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/supplies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // 동적 제품 페이지
  const { data: products } = await supabase
    .from('products')
    .select('id, price_updated_at')
    .order('price_updated_at', { ascending: false })
    .limit(5000);

  const productPages: MetadataRoute.Sitemap = (products || []).map(p => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: new Date(p.price_updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
