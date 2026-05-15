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

  return (
    <aside className="w-36 shrink-0">
      <div className="sticky top-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 py-2.5 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">브랜드</span>
        </div>
        <ul className="py-1">
          <li>
            <button
              onClick={() => select(null)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                !current
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
          </li>
          {brands.map(({ name, label }) => (
            <li key={name}>
              <button
                onClick={() => select(name)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  current === name
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
  );
}
