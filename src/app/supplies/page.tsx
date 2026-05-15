import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import BrandSidebar from '@/components/BrandSidebar';

const FEATURED_SUPPLIES_BRANDS = [
  { name: '리터로봇', label: '리터로봇' },
  { name: '펫킷', label: '펫킷' },
  { name: '캣링크', label: '캣링크' },
  { name: '캣잇', label: '캣잇' },
  { name: '아이리스', label: '아이리스' },
  { name: '페로시안', label: '페로시안' },
  { name: '냥쌤', label: '냥쌤' },
  { name: '포우장', label: '포우장' },
];

export const revalidate = 0;

export const metadata = {
  title: '고양이 용품 | CatsIndex',
};

const SUBCATEGORIES = [
  { value: null,          label: '전체' },
  { value: 'toilet',     label: '🚽 화장실·모래통' },
  { value: 'scoop',      label: '🥄 스쿱·삽' },
  { value: 'mat',        label: '🟫 모래매트' },
  { value: 'deodorizer', label: '💨 탈취제' },
  { value: 'cleaner',    label: '🧹 청소용품' },
  { value: 'other',      label: '기타' },
];

const PAGE_SIZE = 60;

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; page?: string; q?: string }>;
}) {
  const { sub, page: pageStr, q } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));

  const { data: products, total } = await getProducts('supplies', page, PAGE_SIZE, q, sub);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const base = { sub: sub ?? null, page: null, q: q ?? null, ...overrides };
    Object.entries(base).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/supplies${params.size ? `?${params}` : ''}`;
  }

  return (
    <div className="flex gap-6">
      {/* 브랜드 사이드바 */}
      <Suspense>
        <BrandSidebar brands={FEATURED_SUPPLIES_BRANDS} />
      </Suspense>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">🧹 고양이 용품</h1>
          <p className="text-sm text-gray-500">
            매일 새벽 자동 업데이트 · 총 {total.toLocaleString()}개
            {q && ` · "${q}" 검색 결과`}
          </p>
        </div>

        <Suspense>
          <SearchBar placeholder="용품 이름 또는 브랜드 검색..." />
        </Suspense>

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
