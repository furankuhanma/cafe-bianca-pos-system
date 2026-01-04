// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { initDatabase, getAllCategories } from '../lib/database';
import type { Category } from '../lib/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize database if not already done
      await initDatabase();

      // Get all active categories
      const data = await getAllCategories();

      // Map to match expected Category type
      const mappedCategories = data.map(cat => ({
        ...cat,
        is_active: cat.is_active === 1,
      }));

      setCategories(mappedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
}