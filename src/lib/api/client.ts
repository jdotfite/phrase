// lib/api/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// lib/api/base.ts
/**
 * Helper functions for API calls
 */
export async function handleResponse<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise;

  if (error) {
    console.error('API error:', error);
    throw new Error(error.message || 'An unknown error occurred');
  }

  if (!data) {
    throw new Error('No data returned from API');
  }

  return data;
}

// lib/api/phrases.ts
import { supabase } from './client';
import { handleResponse } from './base';
import type { Phrase, NewPhrase, PhraseFilters, PaginatedResponse } from '@/types';

export const phrasesApi = {
  /**
   * Fetch phrases with filtering, sorting, and pagination
   */
  async getPhrases(
    filters?: PhraseFilters,
    pagination?: { page: number; pageSize: number },
    sort?: { column: string; direction: 'asc' | 'desc' }
  ): Promise<PaginatedResponse<Phrase>> {
    try {
      let query = supabase
        .from('phrases')
        .select(`
          *,
          categories:category_id(id, name),
          subcategories:subcategory_id(id, name),
          phrase_tags!inner(
            tags(id, tag)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters) {
        // Apply each filter conditionally
        // ...implementation...
      }

      // Apply sorting
      if (sort && sort.column) {
        query = query.order(sort.column, {
          ascending: sort.direction === 'asc',
          nullsFirst: false,
        });
      } else {
        // Default sort
        query = query.order('id', { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data
      const transformedData = data?.map(item => ({
        ...item,
        category: item.categories?.name || '',
        subcategory: item.subcategories?.name || '',
        tags: item.phrase_tags
          ?.map((pt: any) => pt.tags.tag)
          .filter(Boolean)
          .join(',') || '',
      })) || [];

      return {
        data: transformedData,
        total: count || 0,
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || transformedData.length,
        totalPages: count ? Math.ceil(count / (pagination?.pageSize || 10)) : 1,
      };
    } catch (error) {
      console.error('Error fetching phrases:', error);
      throw error;
    }
  },

  /**
   * Get a single phrase by ID
   */
  async getPhrase(id: number): Promise<Phrase> {
    return handleResponse(
      supabase
        .from('phrases')
        .select(`
          *,
          categories:category_id(id, name),
          subcategories:subcategory_id(id, name),
          phrase_tags!inner(
            tags(id, tag)
          )
        `)
        .eq('id', id)
        .single()
    ).then(data => ({
      ...data,
      category: data.categories?.name || '',
      subcategory: data.subcategories?.name || '',
      tags: data.phrase_tags
        ?.map((pt: any) => pt.tags.tag)
        .filter(Boolean)
        .join(',') || '',
    }));
  },

  /**
   * Add a new phrase
   */
  async addPhrase(phrase: NewPhrase): Promise<Phrase> {
    // Implementation...
    return {} as Phrase; // Placeholder
  },

  /**
   * Update a phrase
   */
  async updatePhrase(id: number, updates: Partial<Phrase>): Promise<Phrase> {
    // Implementation...
    return {} as Phrase; // Placeholder
  },

  /**
   * Delete a phrase
   */
  async deletePhrase(id: number): Promise<void> {
    // Implementation...
  }
};

// lib/api/categories.ts
import { supabase } from './client';
import { handleResponse } from './base';
import type { Category } from '@/types';

export const categoriesApi = {
  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    return handleResponse(
      supabase
        .from('categories')
        .select('*')
        .order('name')
    );
  },
  
  /**
   * Get a category by ID
   */
  async getCategory(id: number): Promise<Category> {
    return handleResponse(
      supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()
    );
  },
  
  /**
   * Get a category by name
   */
  async getCategoryByName(name: string): Promise<Category> {
    return handleResponse(
      supabase
        .from('categories')
        .select('*')
        .eq('name', name)
        .single()
    );
  },
  
  /**
   * Add a new category
   */
  async addCategory(name: string): Promise<Category> {
    return handleResponse(
      supabase
        .from('categories')
        .insert({ name })
        .select()
        .single()
    );
  },
  
  /**
   * Update a category
   */
  async updateCategory(id: number, name: string): Promise<Category> {
    return handleResponse(
      supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
    );
  },
  
  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    await handleResponse(
      supabase
        .from('categories')
        .delete()
        .eq('id', id)
    );
  }
};

// lib/api/auth.ts
import { supabase } from './client';
import { handleResponse } from './base';
import type { Reviewer } from '@/types';

export const authApi = {
  /**
   * Fetch all reviewers
   */
  async getReviewers(): Promise<Reviewer[]> {
    return handleResponse(
      supabase
        .from('reviewers')
        .select('*')
        .order('name')
    );
  },
  
  /**
   * Get a reviewer by ID
   */
  async getReviewer(id: string): Promise<Reviewer> {
    return handleResponse(
      supabase
        .from('reviewers')
        .select('*')
        .eq('id', id)
        .single()
    );
  },
  
  /**
   * Authenticate a reviewer with PIN
   */
  async authenticateReviewer(name: string, pin: string): Promise<Reviewer | null> {
    const { data, error } = await supabase
      .from('reviewers')
      .select('*')
      .eq('name', name)
      .eq('pin', pin)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  },
  
  /**
   * Update reviewer stats
   */
  async updateReviewerStats(id: string, stats: {
    total_reviews?: number;
    current_streak?: number;
  }): Promise<void> {
    await handleResponse(
      supabase
        .from('reviewers')
        .update({
          ...stats,
          last_review_at: new Date().toISOString()
        })
        .eq('id', id)
    );
  }
};

// lib/api/index.ts
// Barrel export for all API modules
export * from './client';
export * from './phrases';
export * from './categories';
export * from './auth';

// Example usage in a component:
// import { phrasesApi } from '@/lib/api';
//
// const { data, total } = await phrasesApi.getPhrases(
//   { category: 'Animals' }, 
//   { page: 1, pageSize: 10 }
// );