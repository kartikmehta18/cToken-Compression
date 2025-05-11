"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { createQrCodeTransaction, getTokens } from "@/lib/token-service"
import { Loader2, Download, Copy, AlertCircle, Info, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { TokenRecord } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"

const NEON_CHAIN_ID = 245022926

export default function GenerateQRPage() {
  const router = useRouter()
  const { connected, address, chainId, switchToNeonNetwork } = useWallet()
  const { toast } = useToast()
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenAmount, setTokenAmount] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [qrValue, setQrValue] = useState<string | null>(null)
  const [userTokens, setUserTokens] = useState<TokenRecord[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenRecord | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const isWrongNetwork = connected && chainId !== NEON_CHAIN_ID

  // Load tokens from Supabase
  useEffect(() => {
    async function fetchTokens() {
      if (connected && address) {
        try {
          const storedTokens = await getTokens(address)
          setUserTokens(storedTokens)

          // If no token is selected and we have tokens, select the first one
          if (storedTokens.length > 0 && !tokenAddress) {
            setTokenAddress(storedTokens[0].address)
            setSelectedToken(storedTokens[0])
          }
        } catch (error) {
          console.error("Error fetching tokens:", error)
          setUserTokens([])
        }
      }
    }

    fetchTokens()
  }, [connected, address, tokenAddress])

  // Generate QR code when qrValue changes
  useEffect(() => {
    if (qrValue && canvasRef.current && selectedToken) {
      const canvas = canvasRef.current

      QRCode.toCanvas(
        canvas,
        qrValue,
        {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 200,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("Error generating QR code:", error)
          } else {
            // Add token info to the QR code
            const ctx = canvas.getContext("2d")
            if (ctx) {
              // Save the QR code as data URL
              setQrDataUrl(canvas.toDataURL("image/png"))

              // Add token info at the bottom
              ctx.fillStyle = "#7c3aed" // Primary color
              ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

              // Add token name and symbol
              ctx.fillStyle = "#FFFFFF"
              ctx.font = "bold 10px Arial"
              ctx.textAlign = "center"
              ctx.fillText(`${selectedToken.name} (${selectedToken.symbol})`, canvas.width / 2, canvas.height - 25)

              // Add transaction hash if available
              if (selectedToken.tx_hash) {
                ctx.font = "8px Arial"
                const shortHash = `${selectedToken.tx_hash.substring(0, 6)}...${selectedToken.tx_hash.substring(selectedToken.tx_hash.length - 6)}`
                ctx.fillText(shortHash, canvas.width / 2, canvas.height - 10)
              }

              // Update data URL with the new canvas content
              setQrDataUrl(canvas.toDataURL("image/png"))
            }
          }
        },
      )
    }
  }, [qrValue, selectedToken])

  const handleGenerateQR = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate a QR code",
        variant: "destructive",
      })
      return
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to Neon EVM Devnet to generate QR codes",
        variant: "destructive",
      })
      await switchToNeonNetwork()
      return
    }

    if (!tokenAddress) {
      toast({
        title: "Missing information",
        description: "Please provide a token address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const amount = Number.parseInt(tokenAmount, 10)

      const transactionUrl = await createQrCodeTransaction(tokenAddress, amount, address)

      setQrValue(transactionUrl)

      toast({
        title: "QR code generated!",
        description: "Your QR code is ready to be shared",
      })
    } catch (error) {
      console.error("QR generation error:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return

    try {
      const link = document.createElement("a")
      link.href = qrDataUrl
      link.download = `${selectedToken?.symbol || "ctoken"}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded",
        description: "Your token QR code has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the QR code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyToClipboard = async () => {
    if (!qrValue) return

    try {
      await navigator.clipboard.writeText(qrValue)
      toast({
        title: "Copied to clipboard",
        description: "The QR code URL has been copied to your clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Copy failed",
        description: "There was an error copying to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTokenSelect = (address: string) => {
    setTokenAddress(address)
    const token = userTokens.find((t) => t.address === address)
    if (token) {
      setSelectedToken(token)
    }
  }

  const handleViewTokenDetails = () => {
    if (selectedToken) {
      router.push(`/token/${selectedToken.address}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Generate QR Code</h1>
        <p className="text-muted-foreground max-w-2xl text-center">
          Create a QR code that attendees can scan to claim your experience tokens.
        </p>

        {isWrongNetwork && (
          <Alert variant="warning" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>
              Please switch to Neon EVM Devnet (Chain ID: {NEON_CHAIN_ID}) to generate QR codes.
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={switchToNeonNetwork}>
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {userTokens.length === 0 && (
          <Alert className="max-w-md mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>No Tokens Found</AlertTitle>
            <AlertDescription>
              You don't have any tokens stored. Please mint a token first on the Mint page.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => (window.location.href = "/mint")}
              >
                Go to Mint Page
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Compressed Token QR Codes</AlertTitle>
          <AlertDescription>
            Generate QR codes for your compressed tokens. These QR codes use Solana Pay format for efficient token
            transfers.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Token Details</CardTitle>
              <CardDescription>Select the token and amount for the QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userTokens.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="token">Select Compressed Token</Label>
                  <Select onValueChange={handleTokenSelect} defaultValue={userTokens[0]?.address}>
                    <SelectTrigger id="token">
                      <SelectValue placeholder="Select a compressed token" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTokens.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          {token.name} ({token.symbol}) 🗜️
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedToken && (
                    <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                      <p>
                        <span className="font-medium">Name:</span> {selectedToken.name}
                      </p>
                      <p>
                        <span className="font-medium">Symbol:</span> {selectedToken.symbol}
                      </p>
                      <p>
                        <span className="font-medium">Supply:</span> {selectedToken.supply}
                      </p>
                      {selectedToken.description && (
                        <p>
                          <span className="font-medium">Description:</span> {selectedToken.description}
                        </p>
                      )}
                      {selectedToken.merkle_tree_address && (
                        <p className="truncate">
                          <span className="font-medium">Merkle Tree:</span>{" "}
                          {selectedToken.merkle_tree_address.substring(0, 8)}...
                          {selectedToken.merkle_tree_address.substring(selectedToken.merkle_tree_address.length - 8)}
                        </p>
                      )}
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary" onClick={handleViewTokenDetails}>
                        View Full Details <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Compressed Token Address</Label>
                  <Input
                    id="tokenAddress"
                    placeholder="Enter compressed token address (0x...)"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Token Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleGenerateQR}
                disabled={isLoading || !connected || isWrongNetwork || !tokenAddress}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate QR Code"
                )}
              </Button>

              {selectedToken && (
                <Button variant="outline" className="w-full" onClick={handleViewTokenDetails}>
                  View Advanced QR Options
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan this code to claim tokens</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              {qrValue ? (
                <div className="p-4 bg-white rounded-lg">
                  <canvas ref={canvasRef} width={200} height={240} className="mx-auto" />
                </div>
              ) : (
                <div className="w-[200px] h-[240px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                  QR code will appear here
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleDownload} disabled={!qrDataUrl}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleCopyToClipboard} disabled={!qrValue}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
