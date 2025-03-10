// components/reviewer/WordCreator/utils.ts
import { supabase } from '@/lib/services/supabase';

// Safer approach that doesn't try to access localStorage directly
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return false;
    }
  }
};

// Helper to load subcategories for a selected category
export const loadSubcategories = async (categoryName: string): Promise<string[]> => {
  try {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (categoryError || !categoryData) {
      console.error('Error fetching category:', categoryError);
      return [];
    }

    const { data: subcategoryData, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('name')
      .eq('category_id', categoryData.id)
      .order('name');

    if (subcategoryError || !subcategoryData) {
      console.error('Error fetching subcategories:', subcategoryError);
      return [];
    }

    return subcategoryData.map(sub => sub.name);
  } catch (error) {
    console.error('Exception in loadSubcategories:', error);
    return [];
  }
};

// Function to get category ID by name
export const getCategoryId = async (categoryName: string | undefined): Promise<number | null> => {
  if (!categoryName) return null;
  
  try {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
      
    return data?.id || null;
  } catch (error) {
    console.error('Error getting category ID:', error);
    return null;
  }
};

// Function to get subcategory ID by name and category ID
export const getSubcategoryId = async (
  categoryName: string | undefined,
  subcategoryName: string | undefined
): Promise<number | null> => {
  if (!categoryName || !subcategoryName) return null;
  
  try {
    const categoryId = await getCategoryId(categoryName);
    if (!categoryId) return null;

    const { data } = await supabase
      .from('subcategories')
      .select('id')
      .eq('name', subcategoryName)
      .eq('category_id', categoryId)
      .single();
      
    return data?.id || null;
  } catch (error) {
    console.error('Error getting subcategory ID:', error);
    return null;
  }
};
