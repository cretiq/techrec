'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { ModeToggle } from '@/components/mode-toggle';

export default function DeepThemeDebugPage() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [cssInfo, setCssInfo] = useState<any>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateDebugInfo = () => {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      // Get all theme-related attributes and classes
      const info = {
        timestamp: new Date().toISOString(),
        nextThemes: {
          theme,
          resolvedTheme,
          systemTheme,
        },
        domState: {
          htmlDataTheme: htmlElement.getAttribute('data-theme'),
          htmlClass: htmlElement.className,
          bodyClass: bodyElement.className,
          htmlStyle: htmlElement.style.cssText,
        },
        systemInfo: {
          prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          mediaQueryDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
        }
      };
      
      setDebugInfo(info);
      
      // Test CSS property values
      const testElement = document.getElementById('css-test-element');
      if (testElement) {
        const computedStyles = window.getComputedStyle(testElement);
        setCssInfo({
          backgroundColor: computedStyles.backgroundColor,
          color: computedStyles.color,
          borderColor: computedStyles.borderColor,
        });
      }
    };

    updateDebugInfo();

    // Watch for DOM changes
    const observer = new MutationObserver(updateDebugInfo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDebugInfo);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateDebugInfo);
    };
  }, [mounted, theme, resolvedTheme, systemTheme]);

  if (!mounted) {
    return <div>Loading theme debug...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-base-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Deep Theme Debug</h1>
          <ModeToggle />
        </div>

        {/* Live Theme State */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Live Theme State</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>next-themes:</strong>
                <pre className="text-sm bg-base-300 p-2 rounded mt-1">
                  {JSON.stringify(debugInfo.nextThemes, null, 2)}
                </pre>
              </div>
              <div>
                <strong>DOM State:</strong>
                <pre className="text-sm bg-base-300 p-2 rounded mt-1">
                  {JSON.stringify(debugInfo.domState, null, 2)}
                </pre>
              </div>
            </div>
            <div>
              <strong>System Info:</strong>
              <pre className="text-sm bg-base-300 p-2 rounded mt-1">
                {JSON.stringify(debugInfo.systemInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Visual Test Elements */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Visual Test Elements</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div 
                  id="css-test-element"
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                >
                  <p className="text-gray-900 dark:text-gray-100">
                    Standard Tailwind dark: classes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Should change with theme
                  </p>
                </div>
                
                <div className="p-4 bg-base-100 border border-base-300 rounded">
                  <p className="text-base-content">DaisyUI base colors</p>
                  <p className="text-sm text-base-content/70">Should also change</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>CSS Test Element Computed Styles:</strong>
                  <pre className="text-sm bg-base-300 p-2 rounded mt-1">
                    {JSON.stringify(cssInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Theme Controls */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Manual Theme Controls</h2>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setTheme('light')}
                className="btn btn-sm btn-outline"
              >
                Force Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className="btn btn-sm btn-outline"
              >
                Force Dark
              </button>
              <button 
                onClick={() => setTheme('system')}
                className="btn btn-sm btn-outline"
              >
                Use System
              </button>
              <button 
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'light');
                  console.log('Manually set data-theme to light');
                }}
                className="btn btn-sm btn-warning"
              >
                Manual DOM Light
              </button>
              <button 
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  console.log('Manually set data-theme to dark');
                }}
                className="btn btn-sm btn-warning"
              >
                Manual DOM Dark
              </button>
            </div>
          </div>
        </div>

        {/* CSS Debug Info */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">CSS Debug Info</h2>
            <div className="space-y-4">
              <div>
                <button 
                  onClick={() => {
                    const sheets = Array.from(document.styleSheets);
                    console.log('Stylesheets:', sheets);
                    sheets.forEach((sheet, i) => {
                      try {
                        console.log(`Sheet ${i}:`, sheet.href || 'inline', sheet.cssRules.length, 'rules');
                      } catch (e) {
                        console.log(`Sheet ${i}:`, sheet.href || 'inline', 'CORS blocked');
                      }
                    });
                  }}
                  className="btn btn-sm"
                >
                  Log Stylesheets
                </button>
                <button 
                  onClick={() => {
                    const testEl = document.getElementById('css-test-element');
                    if (testEl) {
                      const computed = window.getComputedStyle(testEl);
                      console.log('Computed styles:', {
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        borderColor: computed.borderColor,
                      });
                    }
                  }}
                  className="btn btn-sm ml-2"
                >
                  Log Computed Styles
                </button>
                <button 
                  onClick={() => {
                    console.log('CSS custom properties:');
                    const computed = window.getComputedStyle(document.documentElement);
                    const props = Array.from(computed).filter(prop => prop.startsWith('--'));
                    props.forEach(prop => {
                      console.log(prop, ':', computed.getPropertyValue(prop));
                    });
                  }}
                  className="btn btn-sm ml-2"
                >
                  Log CSS Variables
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-sm text-base-content/50 text-center">
          Debug info updated: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  );
}