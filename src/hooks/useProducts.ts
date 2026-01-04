// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { initDatabase, getAllProducts } from '../lib/database';
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

      // Initialize database if not already done
      await initDatabase();

      // Get all available products
      const data = await getAllProducts(false);

      // Map to match expected Product type
      const productsWithImage = data.map(product => ({
        ...product,
        image: product.image_url ?? null,
        is_available: product.is_available === 1,
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