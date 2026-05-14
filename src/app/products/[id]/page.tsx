import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, TrendingDown, TrendingUp, Store } from 'lucide-react';
import { getProduct, getPriceHistory, getStorePrices } from '@/lib/supabase';
import { formatUnitPrice } from '@/lib/unitPrice';
import PriceChart from '@/components/PriceChart';

export const revalidate = 3600;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, history, storePrices] = await Promise.all([
    getProduct(id),
    getPriceHistory(id),
    getStorePrices(id),
  ]);

  if (!product) notFound();

  const affiliateUrl = product.coupang_affiliate_url ?? product.naver_affiliate_url ?? '#';
  const categoryLabel = product.category === 'food' ? '사료' : '모래';
  const categoryHref = `/${product.category}`;

  const priceDiff = product.prev_price ? product.current_price - product.prev_price : null;
  const pricePct = product.prev_price ? Math.abs(Math.round((priceDiff! / product.prev_price) * 100)) : null;

  const lowestPrice = history.length > 0 ? Math.min(...history.map(h => h.price)) : product.current_price;
  const highestPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : product.current_price;

  const unitPriceStr = formatUnitPrice(product.unit_price, product.unit_type);
  const lowestStorePrice = storePrices[0]?.price ?? product.current_price;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href={categoryHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors">
        <ArrowLeft size={14} /> {categoryLabel} 목록으로
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* 상품 이미지 */}
        <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-contain p-6" />
          ) : (
            <span className="text-6xl">🐱</span>
          )}
        </div>

        <div className="p-6 space-y-4">
          {product.brand && <span className="text-sm text-gray-400 font-medium">{product.brand}</span>}
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          {/* 현재 가격 + 단위 가격 */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-bold text-gray-900">
              {product.current_price.toLocaleString()}원
            </span>
            {unitPriceStr && (
              <span className="text-sm font-semibold text-blue-500 pb-1">≈ {unitPriceStr}</span>
            )}
            {priceDiff !== null && priceDiff !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-semibold pb-1 ${priceDiff < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {priceDiff < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                어제보다 {pricePct}% {priceDiff < 0 ? '↓' : '↑'}
                <span className="font-normal text-gray-400 ml-1">
                  ({product.prev_price!.toLocaleString()}원)
                </span>
              </div>
            )}
          </div>

          {/* 최저/최고 요약 */}
          {history.length > 1 && (
            <div className="flex gap-4 text-sm bg-gray-50 rounded-xl p-3">
              <div>
                <span className="text-gray-400">역대 최저</span>
                <div className="font-bold text-emerald-600">{lowestPrice.toLocaleString()}원</div>
              </div>
              <div>
                <span className="text-gray-400">역대 최고</span>
                <div className="font-bold text-rose-500">{highestPrice.toLocaleString()}원</div>
              </div>
              <div>
                <span className="text-gray-400">수집 기간</span>
                <div className="font-bold text-gray-700">{history.length}일</div>
              </div>
            </div>
          )}

          {/* 가격 차트 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">가격 변동 추이</h2>
            <PriceChart history={history} />
          </div>

          {/* 스토어별 가격 비교 */}
          {storePrices.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Store size={14} /> 판매처별 가격 비교
              </h2>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {storePrices.map((s, i) => {
                  const isLowest = s.price === lowestStorePrice;
                  const diffPct = i > 0
                    ? Math.round(((s.price - lowestStorePrice) / lowestStorePrice) * 100)
                    : 0;
                  return (
                    <div
                      key={s.store_name}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                        i < storePrices.length - 1 ? 'border-b border-gray-100' : ''
                      } ${isLowest ? 'bg-emerald-50' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-2">
                        {isLowest && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            최저가
                          </span>
                        )}
                        <span className={`${isLowest ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {s.store_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {diffPct > 0 && (
                          <span className="text-xs text-rose-400">+{diffPct}%</span>
                        )}
                        <span className={`font-bold ${isLowest ? 'text-emerald-700' : 'text-gray-700'}`}>
                          {s.price.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">* 네이버 쇼핑 기준, 매일 새벽 업데이트</p>
            </div>
          )}

          {/* 구매 버튼 */}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-base"
          >
            최저가로 구매하기 <ExternalLink size={16} />
          </a>
          <p className="text-xs text-center text-gray-400">
            쿠팡 파트너스 활동으로 수수료를 받을 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
