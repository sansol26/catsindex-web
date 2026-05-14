'use client';

import { useEffect, useRef } from 'react';

export default function CoupangBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement('script');
    script.src = 'https://ads-partners.coupang.com/g.js';
    script.async = true;
    script.onload = () => {
      new (window as any).PartnersCoupang.G({
        id: 989011,
        template: 'carousel',
        trackingCode: 'AF1774132',
        width: '100%',
        height: '140',
        tsource: '',
      });
    };
    ref.current.appendChild(script);
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div ref={ref} style={{ width: '100%', height: '140px', overflow: 'hidden' }} />
    </div>
  );
}
