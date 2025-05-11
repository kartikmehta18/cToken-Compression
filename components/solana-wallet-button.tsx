"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { useToast } from "@/hooks/use-toast"

export function SolanaWalletButton() {
  const { connected, publicKey, connect, disconnect, walletAvailable } = useSolanaWallet()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleConnect = async () => {
    if (!walletAvailable) {
      toast({
        title: "Wallet not available",
        description: "Please install Phantom or another Solana wallet",
        variant: "destructive",
      })
      // Open Phantom website in a new tab
      window.open("https://phantom.app/download", "_blank")
      return
    }

    try {
      await connect()
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to Solana wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (connected && publicKey) {
    return (
      <Button variant="outline" onClick={disconnect} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Solana Wallet
    </Button>
  )
}
