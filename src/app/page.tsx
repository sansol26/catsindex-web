import Link from 'next/link';
import { TrendingDown } from 'lucide-react';
import { getProducts } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

export default async function HomePage() {
  const [{ data: foodProducts, total: foodTotal }, { data: litterProducts, total: litterTotal }] = await Promise.all([
    getProducts('food', 1, 60),
    getProducts('litter', 1, 60),
  ]);

  const deals = [...foodProducts, ...litterProducts]
    .filter(p => p.prev_price && p.current_price < p.prev_price)
    .sort((a, b) => {
      const aPct = (a.prev_price! - a.current_price) / a.prev_price!;
      const bPct = (b.prev_price! - b.current_price) / b.prev_price!;
      return bPct - aPct;
    })
    .slice(0, 4);

  return (
    <div className="space-y-10">
      {/* 히어로 */}
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🐱 고양이 사료 &amp; 모래<br />
          <span className="text-orange-500">최저가</span>를 매일 업데이트해요
        </h1>
        <p className="text-gray-500 mb-6">가격 변동을 추적하고, 우리 고양이에게 딱 맞는 제품을 AI가 추천해드려요</p>
        <div className="flex gap-3 justify-center">
          <Link href="/food" className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
            사료 최저가 보기
          </Link>
          <Link href="/litter" className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            모래 최저가 보기
          </Link>
        </div>
      </section>

      {/* 오늘의 가격 하락 특가 */}
      {deals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900">오늘 가격이 내렸어요</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* 카테고리 바로가기 */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link href="/food" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-md transition-all">
          <div className="text-4xl mb-3">🥩</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">고양이 사료</h2>
          <p className="text-sm text-gray-500">건식·습식·생식 {foodTotal.toLocaleString()}개 제품 가격 트래킹 중</p>
        </Link>
        <Link href="/litter" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-md transition-all">
          <div className="text-4xl mb-3">🪣</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">고양이 모래</h2>
          <p className="text-sm text-gray-500">두부·벤토나이트·크리스탈 {litterTotal.toLocaleString()}개 제품 가격 트래킹 중</p>
        </Link>
      </section>

      {/* AI 추천 배너 */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 flex items-center justify-between gap-4 border border-orange-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">우리 고양이에게 맞는 제품이 뭘까요?</h2>
          <p className="text-sm text-gray-600">품종·나이·체중을 알려주면 AI가 딱 맞는 사료와 모래를 추천해드려요</p>
        </div>
        <Link href="/guide" className="shrink-0 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm">
          추천받기
        </Link>
      </section>
    </div>
  );
}
