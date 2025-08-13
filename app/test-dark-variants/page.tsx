'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function TestDarkVariantsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-base-100">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Dark Variant Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-200 dark:bg-green-300 border rounded">
            <p className="text-red-800 dark:text-green-800">
              This should be red background with red text in light mode,
              and green background with green text in dark mode.
            </p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            <p className="text-gray-900 dark:text-gray-100">
              White background in light, dark gray in dark mode.
            </p>
          </div>
          
          <div className="p-4 bg-blue-100 dark:bg-blue-900 border rounded">
            <p className="text-blue-800 dark:text-blue-200">
              Blue variations that should switch properly.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p><strong>Current theme:</strong> {theme}</p>
          <p><strong>Resolved theme:</strong> {resolvedTheme}</p>
          <p><strong>System prefers:</strong> {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}</p>
        </div>

        <div className="space-x-2">
          <button 
            onClick={() => setTheme('light')}
            className="px-4 py-2 bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200 rounded"
          >
            Light Mode
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-4 py-2 bg-purple-200 dark:bg-purple-600 text-purple-800 dark:text-purple-200 rounded"
          >
            Dark Mode
          </button>
          <button 
            onClick={() => setTheme('system')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
          >
            System
          </button>
        </div>
      </div>
    </div>
  );
}