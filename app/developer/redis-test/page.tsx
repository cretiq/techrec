import RedisTestComponent from '@/components/redis-test-component';

export default function RedisTestPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Redis Connection Test</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Use this page to test your Redis connection. This is a developer tool to verify that your 
          Redis instance is properly configured and accessible from your application.
        </p>
      </div>
      
      <RedisTestComponent />
      
      <div className="text-sm text-gray-500 text-center space-y-2">
        <p>💡 <strong>Tip:</strong> Check your browser's Network tab and Console for detailed logs during testing.</p>
        <p>🔧 This page uses the <code>/api/redis-test</code> endpoint to interact with your Redis instance.</p>
      </div>
    </div>
  );
} 