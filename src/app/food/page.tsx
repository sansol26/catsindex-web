import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts, getBrands } from '@/lib/supabase';
import type { SortOption } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import BrandSidebar from '@/components/BrandSidebar';

const FEATURED_FOOD_BRANDS = [
  { name: '로얄캐닌', label: '로얄캐닌' },
  { name: '힐스', label: '힐스' },
  { name: '오리젠', label: '오리젠' },
  { name: '아카나', label: '아카나' },
  { name: '퓨리나', label: '퓨리나' },
  { name: '이나바', label: '이나바' },
  { name: '모노지', label: '모노지' },
  { name: '네추럴코어', label: '네추럴코어' },
  { name: '쉬바', label: '쉬바' },
  { name: '위시카', label: '위시카' },
  { name: '카르나4', label: '카르나4' },
  { name: '파미나', label: '파미나' },
];

export const revalidate = 0;

export const metadata = {
  title: '고양이 사료 최저가 | CatsIndex',
};

const SUBCATEGORIES = [
  { value: null,     label: '전체' },
  { value: 'dry',    label: '🌾 건식' },
  { value: 'wet',    label: '🥫 습식·캔' },
  { value: 'raw',    label: '🥩 생식·동결건조' },
  { value: 'snack',  label: '🍗 간식·트릿' },
  { value: 'sample', label: '🎁 샘플·소분' },
];

const FOOD_UNIT_TYPES = [
  { value: 'kg',  label: '⚖️ kg' },
  { value: 'g',   label: '🔬 g' },
  { value: 'L',   label: '💧 L' },
  { value: 'ml',  label: '💧 ml' },
];

const PAGE_SIZE = 60;

export default async function FoodPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const sub      = sp.sub;
  const page     = Math.max(1, parseInt(sp.page ?? '1', 10));
  const q        = sp.q;
  const sort     = (sp.sort ?? 'price_asc') as SortOption;
  const unitType = sp.unit_type;
  const brand    = sp.brand;
  const minUnit  = sp.min_unit ? Number(sp.min_unit) : undefined;
  const maxUnit  = sp.max_unit ? Number(sp.max_unit) : undefined;
  const minSize  = sp.min_size ? Number(sp.min_size) : undefined;
  const maxSize  = sp.max_size ? Number(sp.max_size) : undefined;

  const [{ data: products, total }, brands] = await Promise.all([
    getProducts('food', page, PAGE_SIZE, q, sub, {
      sort, unitType, brand, minUnitPrice: minUnit, maxUnitPrice: maxUnit, minSize, maxSize,
    }),
    getBrands('food'),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const base: Record<string, string | null> = {
      sub: sub ?? null, page: null, q: q ?? null,
      sort: sort !== 'price_asc' ? sort : null,
      brand: brand ?? null,
      unit_type: unitType ?? null,
      min_unit: sp.min_unit ?? null,
      max_unit: sp.max_unit ?? null,
      min_size: sp.min_size ?? null,
      max_size: sp.max_size ?? null,
      ...overrides,
    };
    Object.entries(base).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/food${params.size ? `?${params}` : ''}`;
  }

  return (
    <div className="flex gap-6">
      {/* 브랜드 사이드바 */}
      <Suspense>
        <BrandSidebar brands={FEATURED_FOOD_BRANDS} />
      </Suspense>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">🥩 고양이 사료 최저가</h1>
          <p className="text-sm text-gray-500">
            매일 새벽 자동 업데이트 · 총 {total.toLocaleString()}개
            {q && ` · "${q}" 검색 결과`}
            {brand && ` · ${brand}`}
          </p>
        </div>

        <Suspense><SearchBar placeholder="사료 이름 또는 브랜드 검색..." /></Suspense>

        {/* 서브카테고리 */}
        <div className="flex gap-2 flex-wrap">
          {SUBCATEGORIES.map(({ value, label }) => {
            const active = (sub ?? null) === value;
            return (
              <Link key={label} href={buildHref({ sub: value, page: null })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* 정렬 + 필터 */}
        <Suspense>
          <FilterBar unitTypes={FOOD_UNIT_TYPES} unitPriceLabel="원/kg 또는 원/100g" brands={brands} />
        </Suspense>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {q ? `"${q}"에 해당하는 제품이 없어요 😿` : '아직 데이터를 수집 중이에요 🐱'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {page > 1 && (
                  <Link href={buildHref({ page: String(page - 1) })}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                    ← 이전
                  </Link>
                )}
                <span className="text-sm text-gray-500">{page} / {totalPages} 페이지</span>
                {page < totalPages && (
                  <Link href={buildHref({ page: String(page + 1) })}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                    다음 →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
