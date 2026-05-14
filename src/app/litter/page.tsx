import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts, getBrands } from '@/lib/supabase';
import type { SortOption } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';

export const revalidate = 0;

export const metadata = {
  title: '고양이 모래 최저가 | CatsIndex',
};

const SUBCATEGORIES = [
  { value: null,        label: '전체' },
  { value: 'tofu',      label: '🟤 두부모래' },
  { value: 'bentonite', label: '⚫ 벤토나이트' },
  { value: 'crystal',   label: '💠 크리스탈' },
  { value: 'wood',      label: '🪵 우드펠렛' },
  { value: 'corn',      label: '🌽 옥수수' },
  { value: 'cassava',   label: '🌿 카사바' },
  { value: 'paper',     label: '📰 종이모래' },
];

const LITTER_UNIT_TYPES = [
  { value: 'kg', label: '⚖️ kg' },
  { value: 'L',  label: '💧 L' },
];

const PAGE_SIZE = 60;

export default async function LitterPage({
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
    getProducts('litter', page, PAGE_SIZE, q, sub, {
      sort, unitType, brand, minUnitPrice: minUnit, maxUnitPrice: maxUnit, minSize, maxSize,
    }),
    getBrands('litter'),
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
    return `/litter${params.size ? `?${params}` : ''}`;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🪣 고양이 모래 최저가</h1>
        <p className="text-sm text-gray-500">
          매일 새벽 자동 업데이트 · 총 {total.toLocaleString()}개
          {q && ` · "${q}" 검색 결과`}
        </p>
      </div>

      <Suspense><SearchBar placeholder="모래 이름 또는 브랜드 검색..." /></Suspense>

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
        <FilterBar unitTypes={LITTER_UNIT_TYPES} unitPriceLabel="원/kg 또는 원/L" brands={brands} />
      </Suspense>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {q ? `"${q}"에 해당하는 제품이 없어요 😿` : '아직 데이터를 수집 중이에요 🐱'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
  );
}
