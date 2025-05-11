"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"

interface WalletContextType {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  chainId: number | null
  switchToNeonNetwork: () => Promise<void>
  walletAvailable: boolean
}

const NEON_CHAIN_ID = 245022926
const NEON_RPC_URL = "https://devnet.neonevm.org"

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [walletAvailable, setWalletAvailable] = useState(false)

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (typeof window === "undefined") return

      // Check if MetaMask or other Ethereum wallet is available
      const isEthereumAvailable = !!window.ethereum
      setWalletAvailable(isEthereumAvailable)

      if (isEthereumAvailable) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(ethProvider)

        // Check if already connected
        try {
          const accounts = await ethProvider.listAccounts()
          if (accounts.length > 0) {
            const ethSigner = await ethProvider.getSigner()
            setAddress(await ethSigner.getAddress())
            setSigner(ethSigner)
            setConnected(true)

            // Get current chain ID
            const network = await ethProvider.getNetwork()
            setChainId(Number(network.chainId))
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }

        // Set up event listeners
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected
            setAddress(null)
            setSigner(null)
            setConnected(false)
          } else {
            // Account changed
            setAddress(accounts[0])
            ethProvider.getSigner().then(setSigner)
            setConnected(true)
          }
        })

        window.ethereum.on("chainChanged", (_chainId: string) => {
          // Chain changed, reload the page
          window.location.reload()
        })
      }
    }

    checkWalletAvailability()

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners?.()
      }
    }
  }, [])

  const connect = async () => {
    if (!provider) {
      throw new Error("Wallet not available. Please install MetaMask or another Ethereum wallet.")
    }

    if (!connected) {
      try {
        setConnecting(true)

        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" })

        // Get signer and address
        const ethSigner = await provider.getSigner()
        const userAddress = await ethSigner.getAddress()

        setAddress(userAddress)
        setSigner(ethSigner)
        setConnected(true)

        // Get current chain ID
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        throw error
      } finally {
        setConnecting(false)
      }
    }
  }

  const disconnect = async () => {
    // For MetaMask, there's no direct disconnect method
    // We just reset our state
    setAddress(null)
    setSigner(null)
    setConnected(false)
  }

  const switchToNeonNetwork = async () => {
    if (!window.ethereum) return

    try {
      // Try to switch to the Neon EVM network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NEON_CHAIN_ID.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${NEON_CHAIN_ID.toString(16)}`,
                chainName: "Neon EVM Devnet",
                nativeCurrency: {
                  name: "NEON",
                  symbol: "NEON",
                  decimals: 18,
                },
                rpcUrls: [NEON_RPC_URL],
                blockExplorerUrls: ["https://devnet.neonscan.org/"],
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding Neon network:", addError)
        }
      } else {
        console.error("Error switching to Neon network:", switchError)
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        connecting,
        connect,
        disconnect,
        provider,
        signer,
        chainId,
        switchToNeonNetwork,
        walletAvailable,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Add these type definitions to make TypeScript happy
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: any) => void
      removeAllListeners?: () => void
    }
  }
}
