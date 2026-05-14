import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <span className="text-2xl">🐱</span>
          <span>CatsIndex</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/food"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            사료
          </Link>
          <Link
            href="/litter"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            모래
          </Link>
          <Link
            href="/supplies"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            용품
          </Link>
          <Link
            href="/guide"
            className="px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            추천 가이드
          </Link>
        </nav>
      </div>
    </header>
  );
}
