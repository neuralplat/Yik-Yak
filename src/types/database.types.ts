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
      profiles: {
        Row: {
          id: string
          yakker_id: string
          karma: number
          created_at: string
          is_banned: boolean
        }
        Insert: {
          id: string
          yakker_id: string
          karma?: number
          created_at?: string
          is_banned?: boolean
        }
        Update: {
          id?: string
          yakker_id?: string
          karma?: number
          created_at?: string
          is_banned?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          location: any // PostGIS point typically returned as string or object depending on config
          upvotes: number
          downvotes: number
          score: number
          created_at: string
          expires_at: string | null
          is_ghost: boolean
          community_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          location: any
          upvotes?: number
          downvotes?: number
          score?: number
          created_at?: string
          expires_at?: string | null
          is_ghost?: boolean
          community_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          location?: any
          upvotes?: number
          downvotes?: number
          score?: number
          created_at?: string
          expires_at?: string | null
          is_ghost?: boolean
          community_id?: string | null
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          value?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          business_owner_id: string
          content: string
          target_location: any
          target_radius_meters: number
          budget_remaining: number
          status: 'draft' | 'active' | 'paused' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          business_owner_id: string
          content: string
          target_location: any
          target_radius_meters?: number
          budget_remaining?: number
          status?: 'draft' | 'active' | 'paused' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          business_owner_id?: string
          content?: string
          target_location?: any
          target_radius_meters?: number
          budget_remaining?: number
          status?: 'draft' | 'active' | 'paused' | 'completed'
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          location: any
          radius_meters: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: any
          radius_meters?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: any
          radius_meters?: number
          created_at?: string
        }
      }
    }
  }
}
