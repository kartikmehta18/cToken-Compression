"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { PublicKey } from "@/lib/solana-compression"

interface SolanaWalletContextType {
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  walletAvailable: boolean
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined)

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [walletAvailable, setWalletAvailable] = useState(false)

  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (typeof window === "undefined") return

      // Check if Solana wallet is available
      const isSolanaAvailable = !!window.solana
      setWalletAvailable(isSolanaAvailable)

      if (isSolanaAvailable) {
        // Check if already connected
        try {
          if (window.solana.isPhantom) {
            window.solana.on("connect", (publicKey: any) => {
              setPublicKey(new PublicKey(publicKey.toString()))
              setConnected(true)
            })

            window.solana.on("disconnect", () => {
              setPublicKey(null)
              setConnected(false)
            })

            // Check if already connected
            if (window.solana.isConnected) {
              setPublicKey(new PublicKey(window.solana.publicKey.toString()))
              setConnected(true)
            }
          }
        } catch (error) {
          console.error("Error checking Solana wallet connection:", error)
        }
      }
    }

    checkWalletAvailability()

    return () => {
      if (window.solana) {
        window.solana.disconnect()
      }
    }
  }, [])

  const connect = async () => {
    if (!walletAvailable) {
      throw new Error("Solana wallet not available. Please install Phantom or another Solana wallet.")
    }

    if (!connected) {
      try {
        setConnecting(true)

        // Request connection
        await window.solana.connect()

        setPublicKey(new PublicKey(window.solana.publicKey.toString()))
        setConnected(true)
      } catch (error) {
        console.error("Failed to connect Solana wallet:", error)
        throw error
      } finally {
        setConnecting(false)
      }
    }
  }

  const disconnect = async () => {
    if (window.solana) {
      await window.solana.disconnect()
      setPublicKey(null)
      setConnected(false)
    }
  }

  return (
    <SolanaWalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        connect,
        disconnect,
        walletAvailable,
      }}
    >
      {children}
    </SolanaWalletContext.Provider>
  )
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext)
  if (context === undefined) {
    throw new Error("useSolanaWallet must be used within a SolanaWalletProvider")
  }
  return context
}

// Add these type definitions to make TypeScript happy
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: any }>
      disconnect: () => Promise<void>
      on: (event: string, callback: any) => void
      isConnected: boolean
      publicKey: any
    }
  }
}
