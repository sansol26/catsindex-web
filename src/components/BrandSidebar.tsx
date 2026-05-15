'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BrandItem {
  name: string;
  label: string;
}

interface Props {
  brands: BrandItem[];
}

export default function BrandSidebar({ brands }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get('brand');

  function select(name: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (name) {
      params.set('brand', name);
    } else {
      params.delete('brand');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  const allBrands = [{ name: null, label: '전체' }, ...brands];

  return (
    <>
      {/* 모바일: 가로 스크롤 필 */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {allBrands.map(({ name, label }) => (
          <button
            key={label}
            onClick={() => select(name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              current === name || (!current && name === null)
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 데스크톱: 세로 사이드바 */}
      <aside className="hidden lg:block w-36 shrink-0">
        <div className="sticky top-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">브랜드</span>
          </div>
          <ul className="py-1">
            {allBrands.map(({ name, label }) => (
              <li key={label}>
                <button
                  onClick={() => select(name)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    current === name || (!current && name === null)
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
