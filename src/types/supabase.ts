// src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      phrases: {
        Row: {
          id: number
          phrase: string | null
          part_of_speech: string | null
          hint: string | null
          category_id: number | null
          subcategory_id: number | null
          difficulty: number | null
        }
        Insert: {
          id?: number
          phrase?: string | null
          part_of_speech?: string | null
          hint?: string | null
          category_id?: number | null
          subcategory_id?: number | null
          difficulty?: number | null
        }
        Update: {
          id?: number
          phrase?: string | null
          part_of_speech?: string | null
          hint?: string | null
          category_id?: number | null
          subcategory_id?: number | null
          difficulty?: number | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      subcategories: {
        Row: {
          id: number
          name: string
          category_id: number | null
        }
        Insert: {
          id?: number
          name: string
          category_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          category_id?: number | null
        }
      }
      tags: {
        Row: {
          id: number
          tag: string
        }
        Insert: {
          id?: number
          tag: string
        }
        Update: {
          id?: number
          tag?: string
        }
      }
      phrase_tags: {
        Row: {
          phrase_id: number
          tag_id: number
        }
        Insert: {
          phrase_id: number
          tag_id: number
        }
        Update: {
          phrase_id?: number
          tag_id?: number
        }
      }
      votes: {
        Row: {
          id: string // uuid
          reviewer_id: string // uuid
          phrase_id: number
          category: string // USER-DEFINED type
          vote: boolean
          created_at: string // timestamp with time zone
        }
        Insert: {
          id?: string
          reviewer_id: string
          phrase_id: number
          category: string
          vote: boolean
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          phrase_id?: number
          category?: string
          vote?: boolean
          created_at?: string
        }
      }
      reviewers: {
        Row: {
          id: string // uuid
          name: string
          total_reviews: number | null
          created_at: string // timestamp with time zone
          pin: string
          last_review_at: string | null // timestamp with time zone
          current_streak: number | null
        }
        Insert: {
          id?: string
          name: string
          total_reviews?: number | null
          created_at?: string
          pin?: string
          last_review_at?: string | null
          current_streak?: number | null
        }
        Update: {
          id?: string
          name?: string
          total_reviews?: number | null
          created_at?: string
          pin?: string
          last_review_at?: string | null
          current_streak?: number | null
        }
      }
    }
  }
}