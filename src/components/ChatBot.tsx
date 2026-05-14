'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ExternalLink } from 'lucide-react';
import { getProducts } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Recommendation {
  id: string;
  reason: string;
}

function parseRecommendations(text: string): { clean: string; recs: Recommendation[] } {
  const match = text.match(/```recommendation\n([\s\S]*?)```/);
  if (!match) return { clean: text, recs: [] };
  try {
    const recs = JSON.parse(match[1]);
    const clean = text.replace(/```recommendation\n[\s\S]*?```/, '').trim();
    return { clean, recs };
  } catch {
    return { clean: text, recs: [] };
  }
}

function RecommendationCards({ recs, products }: { recs: Recommendation[]; products: Product[] }) {
  if (recs.length === 0) return null;
  const matched = recs
    .map(r => ({ rec: r, product: products.find(p => p.id === r.id) }))
    .filter(x => x.product);

  if (matched.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {matched.map(({ rec, product: p }) => (
        <div key={p!.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 line-clamp-1">{p!.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{rec.reason}</div>
            <div className="text-sm font-bold text-orange-500 mt-1">{p!.current_price.toLocaleString()}원</div>
          </div>
          {(p!.coupang_affiliate_url ?? p!.naver_affiliate_url) && (
            <a
              href={p!.coupang_affiliate_url ?? p!.naver_affiliate_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-orange-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              구매 <ExternalLink size={10} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ msg, products }: { msg: Message; products: Product[] }) {
  const isUser = msg.role === 'user';
  const { clean, recs } = parseRecommendations(msg.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        {!isUser && <div className="text-xs text-gray-400 mb-1 ml-1">🐱 CatsIndex AI</div>}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
        }`}>
          {clean}
        </div>
        {!isUser && <RecommendationCards recs={recs} products={products} />}
      </div>
    </div>
  );
}

const QUICK_STARTS = [
  '🐱 어떤 사료를 선택해야 할지 모르겠어요',
  '🪣 고양이 모래를 바꾸고 싶어요',
  '⚖️ 고양이가 살이 쪄서 다이어트 사료를 찾아요',
  '😿 고양이가 밥을 잘 안 먹어요',
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 저는 CatsIndex AI 어드바이저예요 🐱\n\n고양이에게 맞는 사료와 모래를 찾아드릴게요. 아래 중 하나를 선택하거나, 직접 질문해 주세요!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts(undefined, 1, 100).then(({ data }) => setProducts(data));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('API 오류');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantText },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '죄송해요, 일시적인 오류가 발생했어요. 다시 시도해 주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '620px' }}>
      {/* 헤더 */}
      <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🐱</span>
        <div>
          <div className="text-white font-semibold text-sm">CatsIndex AI 어드바이저</div>
          <div className="text-orange-100 text-xs">고양이 사료·모래 맞춤 추천</div>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} products={products} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 size={16} className="animate-spin text-orange-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 시작 (메시지 1개일 때만) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-1.5 bg-gray-50">
          {QUICK_STARTS.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs text-left bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-orange-300 hover:bg-orange-50 transition-colors line-clamp-1"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="고양이에 대해 알려주세요..."
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 focus:bg-white transition-colors"
          disabled={loading}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="shrink-0 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-xl transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
