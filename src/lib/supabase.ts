import { createClient } from '@supabase/supabase-js';

// Use default values for development to prevent crashes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      arrangements: {
        Row: {
          id: string
          user_id: string
          name: string
          genre: string
          bpm: number
          xml_data: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          genre: string
          bpm: number
          xml_data: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          genre?: string
          bpm?: number
          xml_data?: string
          created_at?: string
          updated_at?: string
        }
      }
      block_data: {
        Row: {
          id: string
          arrangement_id: string
          block_index: number
          chords: string[]
          template_category: string | null
          template_subgenre: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          arrangement_id: string
          block_index: number
          chords: string[]
          template_category?: string | null
          template_subgenre?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          arrangement_id?: string
          block_index?: number
          chords?: string[]
          template_category?: string | null
          template_subgenre?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}