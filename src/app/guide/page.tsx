import ChatBot from '@/components/ChatBot';

export const metadata = {
  title: 'AI 추천 가이드 | CatsIndex',
};

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🐱 AI 추천 가이드</h1>
        <p className="text-gray-500 text-sm">고양이 품종·나이·고민을 알려주시면 딱 맞는 사료와 모래를 추천해드려요</p>
      </div>

      <ChatBot />

      {/* 정적 가이드 (챗봇 아래 참고용) */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-700">📖 간단 선택 가이드</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { emoji: '🐱', title: '0~6개월 키튼', desc: '키튼 전용, 단백질 30% 이상, DHA 포함 권장' },
            { emoji: '😺', title: '6개월~7세 성묘', desc: '건식+습식 7:3 혼합으로 수분 섭취 보완' },
            { emoji: '🐈', title: '7세↑ 노령묘', desc: '습식 비중↑, 관절·신장 영양소 포함 제품' },
            { emoji: '🟤', title: '두부모래', desc: '먼지 적고 친환경, 호흡기 예민한 고양이 추천' },
            { emoji: '⚫', title: '벤토나이트', desc: '응고력 최강, 냄새 제거 우수 (먼지 주의)' },
            { emoji: '💠', title: '크리스탈', desc: '냄새 완벽 차단, 교체 주기 길어 경제적' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-2.5">
              <span className="text-xl">{emoji}</span>
              <div>
                <div className="font-semibold text-gray-800 text-xs mb-0.5">{title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
