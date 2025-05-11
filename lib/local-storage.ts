// Type definitions for stored tokens
export interface StoredToken {
  address: string
  name: string
  symbol: string
  supply: number
  description?: string
  isCompressed: boolean
  merkleTreeAddress?: string
  txHash: string
  createdAt: number
}

// Function to save a token to local storage
export function saveToken(token: StoredToken): void {
  if (typeof window === "undefined") return

  try {
    // Get existing tokens
    const existingTokens = getTokens()

    // Add new token
    existingTokens.push(token)

    // Save back to local storage
    localStorage.setItem("cTokens", JSON.stringify(existingTokens))
  } catch (error) {
    console.error("Error saving token to local storage:", error)
  }
}

// Function to get all tokens from local storage
export function getTokens(): StoredToken[] {
  if (typeof window === "undefined") return []

  try {
    const tokensJson = localStorage.getItem("cTokens")
    if (!tokensJson) return []

    return JSON.parse(tokensJson)
  } catch (error) {
    console.error("Error getting tokens from local storage:", error)
    return []
  }
}

// Function to get a specific token by address
export function getTokenByAddress(address: string): StoredToken | undefined {
  const tokens = getTokens()
  return tokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

// Function to clear all tokens (for testing)
export function clearTokens(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("cTokens")
  } catch (error) {
    console.error("Error clearing tokens from local storage:", error)
  }
}
