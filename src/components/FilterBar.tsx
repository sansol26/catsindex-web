'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'price_asc',       label: '가격 낮은순' },
  { value: 'price_desc',      label: '가격 높은순' },
  { value: 'unit_price_asc',  label: '단위가격 낮은순' },
  { value: 'unit_price_desc', label: '단위가격 높은순' },
] as const;

interface FilterBarProps {
  unitTypes: { value: string; label: string }[];
  unitPriceLabel?: string;
  brands?: string[];   // 서버에서 미리 조회한 브랜드 목록
}

export default function FilterBar({
  unitTypes,
  unitPriceLabel = '원/kg·L',
  brands = [],
}: FilterBarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const [open, setOpen]             = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const sort     = sp.get('sort')      ?? 'price_asc';
  const unitType = sp.get('unit_type') ?? '';
  const minUnit  = sp.get('min_unit')  ?? '';
  const maxUnit  = sp.get('max_unit')  ?? '';
  const minSize  = sp.get('min_size')  ?? '';
  const maxSize  = sp.get('max_size')  ?? '';
  const brand    = sp.get('brand')     ?? '';

  const [lMinUnit, setLMinUnit] = useState(minUnit);
  const [lMaxUnit, setLMaxUnit] = useState(maxUnit);
  const [lMinSize, setLMinSize] = useState(minSize);
  const [lMaxSize, setLMaxSize] = useState(maxSize);

  useEffect(() => {
    setLMinUnit(sp.get('min_unit') ?? '');
    setLMaxUnit(sp.get('max_unit') ?? '');
    setLMinSize(sp.get('min_size') ?? '');
    setLMaxSize(sp.get('max_size') ?? '');
  }, [sp]);

  const filteredBrands = useMemo(() =>
    brandSearch
      ? brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
      : brands,
    [brands, brandSearch]
  );

  const hasRangeFilter = minUnit || maxUnit || minSize || maxSize || unitType || brand;
  const hasAnyFilter   = hasRangeFilter || sort !== 'price_asc';

  function push(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    params.delete('page');
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === '') params.delete(k);
      else params.set(k, v);
    }
    router.push(`${pathname}?${params}`);
  }

  function applyRanges() {
    push({ min_unit: lMinUnit, max_unit: lMaxUnit, min_size: lMinSize, max_size: lMaxSize });
    setOpen(false);
  }

  function reset() {
    setLMinUnit(''); setLMaxUnit('');
    setLMinSize(''); setLMaxSize('');
    setBrandSearch('');
    push({ sort: null, unit_type: null, min_unit: null, max_unit: null,
           min_size: null, max_size: null, brand: null });
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      {/* ── 정렬 + 필터 토글 ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {SORT_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => push({ sort: opt.value })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              sort === opt.value
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button onClick={() => setOpen(o => !o)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            hasRangeFilter
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
          }`}
        >
          <SlidersHorizontal size={12} />
          필터{hasRangeFilter ? ' ●' : ''}
          <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {hasAnyFilter && (
          <button onClick={reset}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <X size={11} /> 초기화
          </button>
        )}
      </div>

      {/* 현재 브랜드 필터 표시 */}
      {brand && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">브랜드:</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {brand}
            <button onClick={() => push({ brand: null })} className="ml-0.5 hover:text-blue-800">
              <X size={10} />
            </button>
          </span>
        </div>
      )}

      {/* ── 필터 패널 ── */}
      {open && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">

          {/* 브랜드 */}
          {brands.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">브랜드</p>
              <input
                type="text"
                placeholder="브랜드 검색..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400"
              />
              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                {filteredBrands.length === 0 && (
                  <p className="text-xs text-gray-400">검색 결과 없음</p>
                )}
                {filteredBrands.map(b => (
                  <button key={b}
                    onClick={() => { push({ brand: b }); setOpen(false); }}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      brand === b
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 단위 타입 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">단위 타입</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => push({ unit_type: null })}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  !unitType ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >전체</button>
              {unitTypes.map(ut => (
                <button key={ut.value} onClick={() => push({ unit_type: ut.value })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    unitType === ut.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {ut.label}
                </button>
              ))}
            </div>
          </div>

          {/* 단위가격 구간 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              단위가격 구간 <span className="font-normal text-gray-400">({unitPriceLabel})</span>
            </p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="최소" value={lMinUnit}
                onChange={e => setLMinUnit(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <span className="text-gray-300 shrink-0">—</span>
              <input type="number" placeholder="최대" value={lMaxUnit}
                onChange={e => setLMaxUnit(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <span className="text-xs text-gray-400 shrink-0">원</span>
            </div>
          </div>

          {/* 용량 구간 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              용량 구간 <span className="font-normal text-gray-400">(kg 또는 L)</span>
            </p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="최소" value={lMinSize}
                onChange={e => setLMinSize(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <span className="text-gray-300 shrink-0">—</span>
              <input type="number" placeholder="최대" value={lMaxSize}
                onChange={e => setLMaxSize(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <span className="text-xs text-gray-400 shrink-0">kg/L</span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setOpen(false)}
              className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
              취소
            </button>
            <button onClick={applyRanges}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600">
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
