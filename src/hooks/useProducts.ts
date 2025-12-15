import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (fetchError) throw fetchError;

      const productsWithImage = (data || []).map(product => ({
        ...product,
        image: product.image_url ?? null,
      }));

      setProducts(productsWithImage);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
