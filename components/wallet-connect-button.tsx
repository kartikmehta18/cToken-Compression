"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, AlertTriangle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const NEON_CHAIN_ID = 245022926

export function WalletConnectButton() {
  const { connected, address, connect, disconnect, walletAvailable, chainId, switchToNeonNetwork } = useWallet()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [showNetworkDialog, setShowNetworkDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if we need to show the network switch dialog
    if (connected && chainId && chainId !== NEON_CHAIN_ID) {
      setShowNetworkDialog(true)
    } else {
      setShowNetworkDialog(false)
    }
  }, [connected, chainId])

  if (!mounted) return null

  const handleConnect = async () => {
    if (!walletAvailable) {
      toast({
        title: "Wallet not available",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive",
      })
      // Open MetaMask website in a new tab
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    try {
      await connect()
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToNeonNetwork()
      setShowNetworkDialog(false)
    } catch (error) {
      console.error("Network switch error:", error)
      toast({
        title: "Network switch failed",
        description: "Failed to switch to Neon EVM network. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (connected && address) {
    return (
      <>
        <Button variant="outline" onClick={disconnect} className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {address.slice(0, 6)}...{address.slice(-4)}
        </Button>

        <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Wrong Network
              </DialogTitle>
              <DialogDescription>Please switch to the Neon EVM Devnet to use this application.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                Current network: <span className="font-medium">{chainId ? `Chain ID: ${chainId}` : "Unknown"}</span>
              </p>
              <p className="text-sm mt-2">
                Required network: <span className="font-medium">Neon EVM Devnet (Chain ID: {NEON_CHAIN_ID})</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleSwitchNetwork}>Switch Network</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
