"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { mintCToken, getTokens } from "@/lib/token-service"
import { Loader2, AlertCircle, ExternalLink, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TokenCompressionAnimation } from "@/components/token-compression-animation"

const NEON_CHAIN_ID = 245022926

export default function MintPage() {
  const { connected, address, signer, chainId, switchToNeonNetwork } = useWallet()
  const { toast } = useToast()
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")
  const [tokenSupply, setTokenSupply] = useState("4")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenAddress, setTokenAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string | null>(null)
  const [merkleTreeAddress, setMerkleTreeAddress] = useState<string | null>(null)
  const [mintingStep, setMintingStep] = useState<
    "idle" | "compressing" | "initiating" | "confirming" | "processing" | "complete"
  >("idle")
  const [storedTokenCount, setStoredTokenCount] = useState(0)
  const [showCompression, setShowCompression] = useState(false)

  const isWrongNetwork = connected && chainId !== NEON_CHAIN_ID

  // Load token count from Supabase
  useEffect(() => {
    async function fetchTokenCount() {
      if (connected && address) {
        try {
          const tokens = await getTokens(address)
          setStoredTokenCount(tokens.length)
        } catch (error) {
          console.error("Error fetching tokens:", error)
          setStoredTokenCount(0)
        }
      }
    }

    fetchTokenCount()
  }, [connected, address])

  const handleMint = async () => {
    if (!connected || !address || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint tokens",
        variant: "destructive",
      })
      return
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong network",
        description: "Please switch to Neon EVM Devnet to mint tokens",
        variant: "destructive",
      })
      await switchToNeonNetwork()
      return
    }

    if (!tokenName || !tokenSymbol) {
      toast({
        title: "Missing information",
        description: "Please provide a name and symbol for your token",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const supply = Number.parseInt(tokenSupply, 10)

      // Show compression animation
      setMintingStep("compressing")
      setShowCompression(true)

      // Wait for compression animation to complete
      // The animation component will call onCompressionComplete
    } catch (error) {
      console.error("Minting error:", error)
      toast({
        title: "Minting failed",
        description: "There was an error minting your tokens. Please try again.",
        variant: "destructive",
      })
      setMintingStep("idle")
      setShowCompression(false)
      setIsLoading(false)
    }
  }

  const handleCompressionComplete = async () => {
    try {
      const supply = Number.parseInt(tokenSupply, 10)

      // Simulate MetaMask opening and transaction flow
      setMintingStep("initiating")

      // Mint the token - this will trigger MetaMask to open
      const mintResult = await mintCToken({
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        supply,
        signer,
      })

      // Update state with result
      setTokenAddress(mintResult.tokenAddress)
      setTxHash(mintResult.txHash)
      setBlockExplorerUrl(mintResult.blockExplorerUrl || null)

      if (mintResult.merkleTreeAddress) {
        setMerkleTreeAddress(mintResult.merkleTreeAddress)
      }

      setMintingStep("complete")

      // Update token count - fetch from Supabase
      if (address) {
        const tokens = await getTokens(address)
        setStoredTokenCount(tokens.length)
      }

      toast({
        title: "Compressed tokens minted successfully!",
        description: `Created ${supply} compressed ${tokenSymbol} tokens`,
      })
    } catch (error) {
      console.error("Minting error:", error)
      toast({
        title: "Minting failed",
        description: "There was an error minting your tokens. Please try again.",
        variant: "destructive",
      })
      setMintingStep("idle")
    } finally {
      setIsLoading(false)
      setShowCompression(false)
    }
  }

  const resetForm = () => {
    setTokenName("")
    setTokenSymbol("")
    setTokenDescription("")
    setTokenSupply("4")
    setTokenAddress(null)
    setTxHash(null)
    setBlockExplorerUrl(null)
    setMerkleTreeAddress(null)
    setMintingStep("idle")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mint Experience Tokens</h1>
        <p className="text-muted-foreground max-w-2xl text-center">
          Create new cTokens that can be claimed by attendees of your experiences or events. A fee of 2 NEON tokens will
          be charged for minting.
        </p>

        {storedTokenCount > 0 && (
          <Alert className="max-w-md">
            <Check className="h-4 w-4" />
            <AlertTitle>Tokens Available</AlertTitle>
            <AlertDescription>
              You have {storedTokenCount} token{storedTokenCount !== 1 ? "s" : ""} stored. You can generate QR codes for
              them on the Generate QR page.
            </AlertDescription>
          </Alert>
        )}

        {isWrongNetwork && (
          <Alert variant="warning" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>
              Please switch to Neon EVM Devnet (Chain ID: {NEON_CHAIN_ID}) to mint tokens.
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={switchToNeonNetwork}>
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Compressed Tokens</AlertTitle>
          <AlertDescription>
            This platform uses Solana's state compression to create tokens that are more efficient and cost-effective.
            Learn more about{" "}
            <a
              href="https://www.zkcompression.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              zkCompression
            </a>
            .
          </AlertDescription>
        </Alert>

        {mintingStep === "complete" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Token Minted Successfully!</CardTitle>
              <CardDescription>Your compressed token has been created</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-md text-sm break-all">
                <p className="font-medium">Token Address:</p>
                <p className="mt-1 mb-2">{tokenAddress}</p>
                <p className="font-medium">Transaction Hash:</p>
                <p className="mt-1">
                  <a
                    href={blockExplorerUrl || `https://devnet.neonscan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {txHash} <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                {merkleTreeAddress && (
                  <>
                    <p className="font-medium mt-2">Merkle Tree Address:</p>
                    <p className="mt-1">
                      <a
                        href={`https://explorer.solana.com/address/${merkleTreeAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {merkleTreeAddress} <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </>
                )}
              </div>

              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Token Stored</AlertTitle>
                <AlertDescription>
                  Your token has been stored in the database. You can now generate a QR code for it on the Generate QR
                  page.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={resetForm}>
                Mint Another Token
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Token Details</CardTitle>
              <CardDescription>Enter the details for your experience token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Concert Experience Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  disabled={isLoading || mintingStep !== "idle"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Token Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., CET"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  disabled={isLoading || mintingStep !== "idle"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this token represents"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  disabled={isLoading || mintingStep !== "idle"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supply">Token Supply</Label>
                <Input
                  id="supply"
                  type="number"
                  min="1"
                  value={tokenSupply}
                  onChange={(e) => setTokenSupply(e.target.value)}
                  disabled={isLoading || mintingStep !== "idle"}
                />
              </div>

              {showCompression && (
                <TokenCompressionAnimation
                  tokenCount={Number.parseInt(tokenSupply, 10)}
                  isCompressing={mintingStep === "compressing"}
                  onCompressionComplete={handleCompressionComplete}
                />
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Minting Fee</AlertTitle>
                <AlertDescription>A fee of 2 NEON tokens will be charged to mint this token.</AlertDescription>
              </Alert>

              {mintingStep !== "idle" && mintingStep !== "compressing" && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      {mintingStep === "initiating" && "Opening MetaMask..."}
                      {mintingStep === "confirming" && "Waiting for confirmation..."}
                      {mintingStep === "processing" && "Processing transaction..."}
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{
                        width:
                          mintingStep === "initiating"
                            ? "25%"
                            : mintingStep === "confirming"
                              ? "50%"
                              : mintingStep === "processing"
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
                onClick={handleMint}
                disabled={isLoading || !connected || isWrongNetwork || mintingStep !== "idle"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mintingStep === "compressing" ? "Compressing Tokens..." : "Minting Compressed Tokens..."}
                  </>
                ) : (
                  "Mint Compressed Tokens (2 NEON fee)"
                )}
              </Button>

              {!connected && (
                <p className="text-sm text-muted-foreground text-center">Please connect your wallet to mint tokens</p>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
