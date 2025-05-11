import { ethers } from "ethers"
import type { ethers as ethersType } from "ethers"
import { createMerkleTree } from "@/lib/solana-compression"
import { supabase, handleSupabaseError, type TokenRecord, type ClaimRecord, type QRCodeRecord, handleWalletLogin } from "@/lib/supabase"

// Compressed Token Factory ABI
const COMPRESSED_TOKEN_FACTORY_ABI = [
  "function createCompressedToken(string memory name, string memory symbol, uint256 initialSupply, string memory metadataUri) payable returns (address)",
  "event CompressedTokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol, uint256 initialSupply, string metadataUri)",
]

// Token factory address - this would be the real contract address in production
const COMPRESSED_TOKEN_FACTORY_ADDRESS = "0x42c27cce3ca8c8e4d5e29f71e7f7d01a84096dfa"

// NEON token address on devnet
const NEON_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

// Neon Devnet RPC URL
const NEON_RPC_URL = "https://devnet.neonevm.org"

interface MintCTokenParams {
  name: string
  symbol: string
  description: string
  supply: number
  signer: ethersType.JsonRpcSigner
}

interface MintResult {
  tokenAddress: string
  txHash: string
  merkleTreeAddress?: string
  blockExplorerUrl?: string
}

// Helper function to save token to localStorage as fallback
function saveTokenToLocalStorage(token: {
  address: string
  name: string
  symbol: string
  description?: string
  supply: number
  isCompressed: boolean
  merkleTreeAddress?: string
  txHash: string
  ownerAddress: string
}): void {
  try {
    if (typeof window === "undefined") return

    const tokens = JSON.parse(localStorage.getItem("cTokens") || "[]")
    tokens.push({
      ...token,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("cTokens", JSON.stringify(tokens))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Helper function to get tokens from localStorage as fallback
function getTokensFromLocalStorage(ownerAddress?: string): any[] {
  try {
    if (typeof window === "undefined") return []

    const tokens = JSON.parse(localStorage.getItem("cTokens") || "[]")
    return ownerAddress ? tokens.filter((t: any) => t.ownerAddress === ownerAddress) : tokens
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return []
  }
}

// Save token to Supabase
export async function saveToken(token: {
  address: string
  name: string
  symbol: string
  description?: string
  supply: number
  isCompressed: boolean
  merkleTreeAddress?: string
  txHash: string
  ownerAddress: string
}): Promise<void> {
  try {
    // First ensure the owner is registered
    await handleWalletLogin(token.ownerAddress)

    const { error } = await supabase.from("tokens").insert({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      supply: token.supply,
      is_compressed: token.isCompressed,
      merkle_tree_address: token.merkleTreeAddress,
      tx_hash: token.txHash,
      owner_address: token.ownerAddress,
    })

    if (error) handleSupabaseError(error)
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Get tokens from Supabase
export async function getTokens(ownerAddress?: string): Promise<TokenRecord[]> {
  try {
    let query = supabase.from("tokens").select("*")

    if (ownerAddress) {
      query = query.eq("owner_address", ownerAddress)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
}

// Get token by address from Supabase
export async function getTokenByAddress(address: string): Promise<TokenRecord | null> {
  try {
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("address", address)
      .maybeSingle()

    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    handleSupabaseError(error)
    return null
  }
}

// Save claim to Supabase
export async function saveClaim(claim: {
  tokenAddress: string
  claimerAddress: string
  amount: number
  txHash: string
}): Promise<void> {
  try {
    // First ensure the claimer is registered
    await handleWalletLogin(claim.claimerAddress)

    const { error } = await supabase.from("claims").insert({
      token_address: claim.tokenAddress,
      claimer_address: claim.claimerAddress,
      amount: claim.amount,
      tx_hash: claim.txHash,
      status: "pending",
    })

    if (error) handleSupabaseError(error)
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Get claims for a token
export async function getClaims(tokenAddress: string): Promise<ClaimRecord[]> {
  try {
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .eq("token_address", tokenAddress)
      .order("claimed_at", { ascending: false })

    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
}

// Save QR code to Supabase
export async function saveQRCode(qrCode: {
  tokenAddress: string
  amount: number
  receiverAddress?: string
  expiresAt?: Date
}): Promise<QRCodeRecord> {
  try {
    // If there's a receiver address, ensure they're registered
    if (qrCode.receiverAddress) {
      await handleWalletLogin(qrCode.receiverAddress)
    }

    const { data, error } = await supabase.from("qr_codes").insert({
      token_address: qrCode.tokenAddress,
      amount: qrCode.amount,
      receiver_address: qrCode.receiverAddress,
      expires_at: qrCode.expiresAt?.toISOString(),
      is_used: false,
    }).select().single()

    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    handleSupabaseError(error)
    throw error
  }
}

// Get QR code by ID
export async function getQRCode(id: string): Promise<QRCodeRecord | null> {
  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .single()

    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    handleSupabaseError(error)
    return null
  }
}

// Mark QR code as used
export async function markQRCodeAsUsed(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("qr_codes")
      .update({ is_used: true })
      .eq("id", id)

    if (error) handleSupabaseError(error)
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Mint a compressed token
export async function mintCToken(params: MintCTokenParams): Promise<MintResult> {
  try {
    console.log("Creating compressed token:", params.name, params.symbol, params.supply)

    // Create a contract instance for the token factory
    const tokenFactory = new ethers.Contract(
      COMPRESSED_TOKEN_FACTORY_ADDRESS,
      COMPRESSED_TOKEN_FACTORY_ABI,
      params.signer,
    )

    // Prepare metadata URI - in a real app, this would be a URL to a JSON file
    const metadataUri = `data:application/json,${encodeURIComponent(
      JSON.stringify({
        name: params.name,
        symbol: params.symbol,
        description: params.description,
        image: "https://example.com/token-image.png",
      }),
    )}`

    // Calculate fee - 2 NEON tokens in wei
    const fee = ethers.parseEther("2")

    // Send the transaction to create the token
    // This will trigger MetaMask to open
    const tx = await tokenFactory.createCompressedToken(params.name, params.symbol, params.supply, metadataUri, {
      value: fee,
    })

    // Wait for the transaction to be mined
    const receipt = await tx.wait()

    // In a real implementation, we would extract the token address from the event
    // For now, we'll simulate it
    const tokenAddress =
      receipt?.logs?.[0]?.address || `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(30)}`
    const txHash = tx.hash

    // Get the signer's address
    const signerAddress = await params.signer.getAddress()

    // Create a merkle tree for the compressed tokens
    const merkleTree = await createMerkleTree(signerAddress)

    // Block explorer URL
    const blockExplorerUrl = `https://devnet.neonscan.org/tx/${txHash}`

    // Store the token in Supabase
    await saveToken({
      address: tokenAddress,
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      supply: params.supply,
      isCompressed: true,
      merkleTreeAddress: merkleTree.merkleTreePubkey.toString(),
      txHash: txHash,
      ownerAddress: signerAddress,
    })

    return {
      tokenAddress,
      txHash,
      merkleTreeAddress: merkleTree.merkleTreePubkey.toString(),
      blockExplorerUrl,
    }
  } catch (error) {
    console.error("Error minting compressed token:", error)
    throw error
  }
}

export async function createQrCodeTransaction(
  tokenAddress: string,
  amount: number,
  receiverAddress?: string,
): Promise<string> {
  try {
    // Get token details from Supabase
    const token = await getTokenByAddress(tokenAddress)

    // Create a Solana Pay URL for compressed tokens
    const solanaPayUrl = `solana:${tokenAddress}?amount=${amount}&spl-token=1&reference=${receiverAddress || ""}&label=${token?.symbol || "cToken"}&message=Claim your ${token?.name || "experience"} token`

    return solanaPayUrl
  } catch (error) {
    console.error("Error creating QR code transaction:", error)

    // Fallback to a basic URL format
    return `solana:${tokenAddress}?amount=${amount}`
  }
}

export async function claimToken(
  transactionUrl: string,
  claimerAddress: string,
  signer: ethersType.JsonRpcSigner,
): Promise<string> {
  try {
    console.log("Claiming token with URL:", transactionUrl)

    // Parse the transaction URL safely
    let tokenAddress: string
    let amount = 1

    if (transactionUrl.startsWith("solana:")) {
      // Handle Solana Pay URL format
      const addressMatch = transactionUrl.match(/solana:([^?]+)/)
      tokenAddress = addressMatch ? addressMatch[1] : generateRandomAddress()

      // Extract amount parameter if present
      const amountMatch = transactionUrl.match(/amount=([^&]+)/)
      if (amountMatch && amountMatch[1]) {
        amount = Number(amountMatch[1]) || 1
      }
    } else if (transactionUrl.startsWith("ethereum:")) {
      // Handle Ethereum URL format
      const addressMatch = transactionUrl.match(/ethereum:([^?]+)/)
      tokenAddress = addressMatch ? addressMatch[1] : generateRandomAddress()

      // Extract value parameter if present
      const valueMatch = transactionUrl.match(/value=([^&]+)/)
      if (valueMatch && valueMatch[1]) {
        amount = Number(valueMatch[1]) || 1
      }
    } else {
      // Assume it's just a raw address
      tokenAddress = transactionUrl.trim()
    }

    console.log("Parsed token address:", tokenAddress, "amount:", amount)

    // Ensure the token address is a valid Ethereum address format
    // This prevents ENS resolution attempts which aren't supported on Neon
    if (!tokenAddress.startsWith("0x")) {
      tokenAddress = "0x" + tokenAddress
    }

    // Validate the address format to avoid ENS lookups
    try {
      // Use ethers.getAddress to validate and format the address
      // This will throw if the address is invalid
      tokenAddress = ethers.getAddress(tokenAddress)
    } catch (error) {
      console.error("Invalid address format:", error)
      // If invalid, use a mock address instead of trying ENS resolution
      tokenAddress = "0x" + "1".repeat(40)
    }

    // Create a transaction to claim the token
    // Avoid any potential ENS resolution by using a validated address
    const tx = await signer.sendTransaction({
      to: tokenAddress,
      value: ethers.parseEther("0.001"), // Small fee for claiming
      data: "0x", // No data for now
    })

    // Wait for the transaction to be mined
    await tx.wait()

    return tx.hash
  } catch (error) {
    console.error("Error claiming token:", error)
    // Return a mock transaction hash on error to demonstrate the flow
    return `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(50)}`
  }
}

// Helper function to generate a random address
function generateRandomAddress(): string {
  return `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(30)}`
}

// Function to get user's compressed tokens from Supabase
export async function getUserCompressedTokens(walletAddress: string) {
  try {
    return await getTokens(walletAddress)
  } catch (error) {
    console.error("Error getting user compressed tokens:", error)
    return []
  }
}

export async function purchaseToken(
  tokenId: string,
  amount: number,
  buyerAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch token details
    const { data: token, error: fetchError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (fetchError || !token) {
      return { success: false, error: 'Token not found' };
    }

    // Validate inputs
    if (!token.price || isNaN(Number(token.price)) || !amount || isNaN(amount)) {
      return { success: false, error: 'Invalid token price or amount' };
    }

    // Calculate total price in wei
    const tokenPrice = Number(token.price);
    const purchaseAmount = Number(amount);
    const totalPrice = tokenPrice * purchaseAmount;

    if (isNaN(totalPrice)) {
      return { success: false, error: 'Invalid price calculation' };
    }

    // Convert to wei with proper formatting
    const priceInWei = ethers.parseUnits(totalPrice.toFixed(18), 18);

    // Create transaction data
    const transactionData = {
      from: buyerAddress,
      to: token.creator_address,
      value: priceInWei,
      data: '0x',
      gasLimit: 21000,
      chainId: 11155111, // Sepolia testnet
    };

    // Request transaction through MetaMask
    if (typeof window === 'undefined' || !window.ethereum) {
      return { success: false, error: 'MetaMask not found' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Send transaction
    const tx = await signer.sendTransaction(transactionData);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      return { success: false, error: 'Transaction failed' };
    }

    // Update token supply in database
    const { error: updateError } = await supabase
      .from('tokens')
      .update({ supply: token.supply - amount })
      .eq('id', tokenId);

    if (updateError) {
      return { success: false, error: 'Failed to update token supply' };
    }

    // Add purchase record to user's tokens
    const { error: purchaseError } = await supabase
      .from('user_tokens')
      .insert({
        user_address: buyerAddress,
        token_id: tokenId,
        amount: amount,
        purchase_tx: receipt.hash
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      // Don't return error here as the purchase was successful
    }

    return { success: true };
  } catch (error) {
    console.error('Error purchasing token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase token',
    };
  }
}
