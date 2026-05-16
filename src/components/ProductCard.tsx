'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';
import type { Product } from '@/lib/supabase';
import { formatUnitPrice } from '@/lib/unitPrice';

function PriceBadge({ current, prev }: { current: number; prev: number | null }) {
  if (!prev || prev === current) return null;
  const diff = current - prev;
  const pct = Math.abs(Math.round((diff / prev) * 100));

  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
        <TrendingDown size={11} /> {pct}%↓
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">
      <TrendingUp size={11} /> {pct}%↑
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const affiliateUrl = product.coupang_affiliate_url ?? product.naver_affiliate_url ?? '#';
  const unitPriceStr = formatUnitPrice(product.unit_price, product.unit_type);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.img-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'img-fallback absolute inset-0 flex items-center justify-center text-4xl';
                fallback.textContent = '🐱';
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🐱</div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.brand && (
          <span className="text-xs text-gray-400 font-medium">{product.brand}</span>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {product.current_price.toLocaleString()}원
              </span>
              {product.prev_price && product.prev_price !== product.current_price && (
                <span className="ml-1.5 text-xs text-gray-400 line-through">
                  {product.prev_price.toLocaleString()}원
                </span>
              )}
            </div>
            <PriceBadge current={product.current_price} prev={product.prev_price} />
          </div>

          {/* 단위당 가격 */}
          {unitPriceStr && (
            <div className="text-xs text-blue-500 font-medium mt-0.5">
              ≈ {unitPriceStr}
            </div>
          )}
        </div>

        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl py-2 transition-colors mt-1"
        >
          최저가 구매 <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
