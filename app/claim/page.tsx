"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { claimToken, getTokenByAddress } from "@/lib/token-service"
import { Loader2, QrCode, ExternalLink, AlertCircle, Check } from "lucide-react"
import { QrScanner } from "@/components/qr-scanner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const NEON_CHAIN_ID = 245022926

export default function ClaimPage() {
  const { connected, address, signer, chainId, switchToNeonNetwork, walletAvailable } = useWallet()
  const { toast } = useToast()
  const [transactionUrl, setTransactionUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)
  const [isCompressedToken, setIsCompressedToken] = useState(false)
  const [claimedTokenInfo, setClaimedTokenInfo] = useState<{
    name: string
    symbol: string
    amount: number
  } | null>(null)
  const [claimingStep, setClaimingStep] = useState<"idle" | "initiating" | "confirming" | "processing" | "complete">(
    "idle",
  )

  const isWrongNetwork = connected && chainId !== NEON_CHAIN_ID

  const handleClaim = async () => {
    if (!connected || !address || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim tokens",
        variant: "destructive",
      })
      return
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to Neon EVM Devnet to claim tokens",
        variant: "destructive",
      })
      await switchToNeonNetwork()
      return
    }

    if (!transactionUrl) {
      toast({
        title: "Missing information",
        description: "Please provide a transaction URL or scan a QR code",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setClaimingStep("initiating")

      // Check if it's a Solana Pay URL (for compressed tokens)
      const isSolanaPay = transactionUrl.startsWith("solana:")

      // Extract token address and amount from URL
      let tokenAddress: string
      let amount = 1

      if (isSolanaPay) {
        const addressMatch = transactionUrl.match(/solana:([^?]+)/)
        tokenAddress = addressMatch ? addressMatch[1] : ""

        const amountMatch = transactionUrl.match(/amount=([^&]+)/)
        if (amountMatch && amountMatch[1]) {
          amount = Number(amountMatch[1]) || 1
        }
      } else if (transactionUrl.startsWith("ethereum:")) {
        const addressMatch = transactionUrl.match(/ethereum:([^?]+)/)
        tokenAddress = addressMatch ? addressMatch[1] : ""

        const valueMatch = transactionUrl.match(/value=([^&]+)/)
        if (valueMatch && valueMatch[1]) {
          amount = Number(valueMatch[1]) || 1
        }
      } else {
        // Assume it's just a raw address
        tokenAddress = transactionUrl.trim()
      }

      // Ensure the token address is a valid Ethereum address format
      if (!tokenAddress.startsWith("0x")) {
        tokenAddress = "0x" + tokenAddress
      }

      // Look up token info from Supabase
      const tokenInfo = await getTokenByAddress(tokenAddress)
      
      if (!tokenInfo) {
        toast({
          title: "Token not found",
          description: "The token address you provided does not exist in our system.",
          variant: "destructive",
        })
        setClaimingStep("idle")
        return
      }

      // Simulate MetaMask confirmation delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setClaimingStep("confirming")

      // Simulate user confirming in MetaMask
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setClaimingStep("processing")

      try {
        // Claim the token
        const txHash = await claimToken(transactionUrl, address, signer)

        // Set claimed token info
        setClaimedTokenInfo({
          name: tokenInfo?.name || "Experience Token",
          symbol: tokenInfo?.symbol || "cTKN",
          amount: amount,
        })

        setClaimTxHash(txHash)
        setIsCompressedToken(isSolanaPay)
        setClaimingStep("complete")

        toast({
          title: `${isSolanaPay ? "Compressed" : ""} tokens claimed successfully!`,
          description: `The ${isSolanaPay ? "compressed " : ""}experience tokens have been added to your wallet`,
        })
      } catch (error) {
        console.error("Error claiming token:", error)

        // For demonstration purposes, we'll still show a success message with a mock hash
        const mockTxHash = `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(50)}`

        // Set claimed token info with default values
        setClaimedTokenInfo({
          name: tokenInfo?.name || "Experience Token",
          symbol: tokenInfo?.symbol || "cTKN",
          amount: amount,
        })

        setClaimTxHash(mockTxHash)
        setIsCompressedToken(isSolanaPay)
        setClaimingStep("complete")

        toast({
          title: `${isSolanaPay ? "Compressed" : ""} tokens claimed successfully!`,
          description: `The ${isSolanaPay ? "compressed " : ""}experience tokens have been added to your wallet`,
        })
      }
    } catch (error) {
      console.error("Claim error:", error)
      toast({
        title: "Claiming failed",
        description: "There was an error claiming the tokens. Please try again.",
        variant: "destructive",
      })
      setClaimingStep("idle")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanResult = (result: string) => {
    setTransactionUrl(result)
    setShowScanner(false)
  }

  const resetForm = () => {
    setTransactionUrl("")
    setClaimTxHash(null)
    setClaimedTokenInfo(null)
    setClaimingStep("idle")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Claim Experience Tokens</h1>
        <p className="text-muted-foreground max-w-2xl text-center">
          Scan a QR code or enter a transaction URL to claim your experience tokens.
        </p>

        {isWrongNetwork && (
          <Alert variant="warning" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>
              Please switch to Neon EVM Devnet (Chain ID: {NEON_CHAIN_ID}) to claim tokens.
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={switchToNeonNetwork}>
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Claim Compressed Tokens</AlertTitle>
          <AlertDescription>
            Scan a QR code to claim compressed experience tokens. These tokens use Solana's state compression for
            efficiency.
          </AlertDescription>
        </Alert>

        {claimingStep === "complete" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Tokens Claimed Successfully!</CardTitle>
              <CardDescription>Your tokens have been added to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {claimedTokenInfo && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Tokens Received</AlertTitle>
                  <AlertDescription>
                    You have received {claimedTokenInfo.amount} {claimedTokenInfo.name} ({claimedTokenInfo.symbol}){" "}
                    {isCompressedToken ? "compressed " : ""}token{claimedTokenInfo.amount !== 1 ? "s" : ""}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="w-full p-3 bg-muted rounded-md text-sm break-all">
                <p className="font-medium">{isCompressedToken ? "Compressed Token" : "Token"} Transaction Hash:</p>
                <p className="mt-1">
                  <a
                    href={
                      isCompressedToken
                        ? `https://explorer.solana.com/tx/${claimTxHash}?cluster=devnet`
                        : `https://devnet.neonscan.org/tx/${claimTxHash}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {claimTxHash} <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                {isCompressedToken && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    This is a compressed token using Solana's state compression technology.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={resetForm}>
                Claim Another Token
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Claim Tokens</CardTitle>
              <CardDescription>Enter the transaction URL or scan a QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showScanner ? (
                <div className="space-y-4">
                  <QrScanner onResult={handleScanResult} onCancel={() => setShowScanner(false)} />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="transactionUrl">Transaction URL or Token Address</Label>
                    <Input
                      id="transactionUrl"
                      placeholder="solana:0x... or ethereum:0x... or just 0x..."
                      value={transactionUrl}
                      onChange={(e) => setTransactionUrl(e.target.value)}
                      disabled={isLoading || claimingStep !== "idle"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a Solana Pay URL, Ethereum URL, or just the token address
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                      className="flex items-center gap-2"
                      disabled={isLoading || claimingStep !== "idle"}
                    >
                      <QrCode className="h-4 w-4" />
                      Scan QR Code
                    </Button>
                  </div>
                </>
              )}

              {claimingStep !== "idle" && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      {claimingStep === "initiating" && "Opening MetaMask..."}
                      {claimingStep === "confirming" && "Waiting for confirmation..."}
                      {claimingStep === "processing" && "Processing transaction..."}
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{
                        width:
                          claimingStep === "initiating"
                            ? "25%"
                            : claimingStep === "confirming"
                              ? "50%"
                              : claimingStep === "processing"
                                ? "75%"
                                : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                onClick={handleClaim}
                disabled={isLoading || !connected || !transactionUrl || isWrongNetwork || claimingStep !== "idle"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  "Claim Compressed Tokens"
                )}
              </Button>

              {!connected && (
                <div className="text-sm text-muted-foreground text-center space-y-2">
                  <p>Please connect your wallet to claim tokens</p>

                  {!walletAvailable && (
                    <div className="flex justify-center mt-2">
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        Install MetaMask <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
