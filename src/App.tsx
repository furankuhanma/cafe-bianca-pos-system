import { useEffect } from 'react';
import { supabase, testConnection } from './lib/supabase';

function App() {
  useEffect(() => {
    // Test connection on mount
    testConnection();
    
    // Try to fetch categories
    const testFetch = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching:', error);
      } else {
        console.log('✅ Successfully fetched data:', data);
      }
    };
    
    testFetch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Cafe Bianca POS System
        </h1>
        <p className="text-gray-600">
          Check the console (F12) for connection test results
        </p>
      </div>
    </div>
  );
}

export default App;