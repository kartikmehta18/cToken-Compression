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
      users: {
        Row: {
          id: string
          wallet_address: string
          created_at: string
          last_login_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          created_at?: string
          last_login_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          created_at?: string
          last_login_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          address: string
          name: string
          symbol: string
          description: string | null
          supply: number
          is_compressed: boolean
          merkle_tree_address: string | null
          tx_hash: string
          owner_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          name: string
          symbol: string
          description?: string | null
          supply: number
          is_compressed?: boolean
          merkle_tree_address?: string | null
          tx_hash: string
          owner_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          name?: string
          symbol?: string
          description?: string | null
          supply?: number
          is_compressed?: boolean
          merkle_tree_address?: string | null
          tx_hash?: string
          owner_address?: string
          created_at?: string
          updated_at?: string
        }
      }
      claims: {
        Row: {
          id: string
          token_address: string
          claimer_address: string
          amount: number
          tx_hash: string
          claimed_at: string
          status: "pending" | "completed" | "failed"
        }
        Insert: {
          id?: string
          token_address: string
          claimer_address: string
          amount: number
          tx_hash: string
          claimed_at?: string
          status?: "pending" | "completed" | "failed"
        }
        Update: {
          id?: string
          token_address?: string
          claimer_address?: string
          amount?: number
          tx_hash?: string
          claimed_at?: string
          status?: "pending" | "completed" | "failed"
        }
      }
      qr_codes: {
        Row: {
          id: string
          token_address: string
          amount: number
          receiver_address: string | null
          created_at: string
          expires_at: string | null
          is_used: boolean
        }
        Insert: {
          id?: string
          token_address: string
          amount: number
          receiver_address?: string | null
          created_at?: string
          expires_at?: string | null
          is_used?: boolean
        }
        Update: {
          id?: string
          token_address?: string
          amount?: number
          receiver_address?: string | null
          created_at?: string
          expires_at?: string | null
          is_used?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_wallet_login: {
        Args: {
          wallet_address: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 