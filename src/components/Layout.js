import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
          Arabic Writing Practice
        </Link>
        <Link
          to="/review"
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
            ${pathname.startsWith('/review')
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
          Review
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
