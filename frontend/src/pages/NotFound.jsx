// src/pages/NotFound.jsx
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — MediTriage';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <span className="text-5xl text-blue-600 mb-4">✚</span>
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-1">Page not found</p>
      <p className="text-sm text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          Go to Intake Form
        </a>
        <a
          href="/portal"
          className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium px-6 py-2 rounded-lg transition-colors"
        >
          My Portal
        </a>
      </div>
    </div>
  );
}
