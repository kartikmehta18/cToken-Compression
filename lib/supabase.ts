import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type UserRecord = Database["public"]["Tables"]["users"]["Row"]
export type TokenRecord = Database["public"]["Tables"]["tokens"]["Row"]
export type ClaimRecord = Database["public"]["Tables"]["claims"]["Row"]
export type QRCodeRecord = Database["public"]["Tables"]["qr_codes"]["Row"]

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error("Supabase error:", error)
  throw new Error(error.message || "An error occurred with the database")
}

// Helper function to check if we're in a browser environment
export function isBrowser() {
  return typeof window !== "undefined"
}

// Helper function to handle wallet login/registration
export async function handleWalletLogin(walletAddress: string): Promise<UserRecord> {
  try {
    const { data, error } = await supabase
      .rpc('handle_wallet_login', { wallet_address: walletAddress })
      .select()
      .single()

    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    handleSupabaseError(error)
    throw error
  }
}

// Helper function to get user by wallet address
export async function getUserByWallet(walletAddress: string): Promise<UserRecord | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    handleSupabaseError(error)
    return null
  }
}

// Helper function to check if wallet is registered
export async function isWalletRegistered(walletAddress: string): Promise<boolean> {
  const user = await getUserByWallet(walletAddress)
  return !!user
}

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}
