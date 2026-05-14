import Anthropic from '@anthropic-ai/sdk';
import { getProducts } from '@/lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

// Next.js 16 Turbopack 버그 우회: .env.local 직접 파싱
function readEnvLocal(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const content = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    const match = content.match(new RegExp(`^${key}=([^\r\n]+)`, 'm'));
    return match?.[1]?.trim().replace(/^["']|["']$/g, '');
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = readEnvLocal('ANTHROPIC_API_KEY');
    console.log('[Chat] API key:', apiKey ? `${apiKey.slice(0, 15)}...` : 'MISSING');

    const client = new Anthropic({ apiKey });

    // DB에서 상위 제품 목록 가져와서 AI에게 컨텍스트로 제공
    const [{ data: foodProducts }, { data: litterProducts }] = await Promise.all([
      getProducts('food', 1, 20),
      getProducts('litter', 1, 20),
    ]);

    const topFood = foodProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.current_price,
    }));

    const topLitter = litterProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.current_price,
    }));

    const systemPrompt = `당신은 고양이 전문 케어 어드바이저입니다. CatsIndex 사이트의 AI 추천 챗봇으로, 고양이 보호자들이 최적의 사료와 모래를 선택할 수 있도록 도와줍니다.

## 현재 최저가 제품 목록 (DB 기준)

### 사료 TOP 20 (가격 오름차순)
${JSON.stringify(topFood, null, 2)}

### 모래 TOP 20 (가격 오름차순)
${JSON.stringify(topLitter, null, 2)}

## 대화 가이드라인

1. **정보 수집**: 고양이의 품종, 나이(개월/년), 체중, 현재 먹는 사료/모래, 불편한 점을 파악하세요.
2. **맞춤 추천**: 수집한 정보를 바탕으로 위 제품 목록에서 2~3개를 추천하세요.
3. **추천 형식**: 반드시 아래 JSON 블록을 응답에 포함하세요 (추천할 때만):

\`\`\`recommendation
[
  {"id": "제품UUID", "reason": "추천 이유 한 줄"},
  {"id": "제품UUID", "reason": "추천 이유 한 줄"}
]
\`\`\`

4. **전문성**: 영양학적 근거, 성분, 고양이 건강 정보를 친절하고 전문적으로 설명하세요.
5. **언어**: 반드시 한국어로만 답변하세요. 따뜻하고 공감하는 말투를 사용하세요.
6. **주의**: 위 제품 목록에 없는 제품은 추천하지 마세요.`;

    // 스트리밍 응답
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            stream: true,
          });

          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          console.error('[Chat API] Stream error:', err);
          controller.enqueue(encoder.encode(`[오류] ${(err as Error).message}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[Chat API] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
