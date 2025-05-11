"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/use-wallet"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { getTokens } from "@/lib/token-service"
import type { TokenRecord } from "@/lib/supabase"
import { AlertCircle, Wallet, QrCode, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MyTokensPage() {
  const router = useRouter()
  const { connected: evmConnected, address: evmAddress } = useWallet()
  const { connected: solanaConnected, publicKey } = useSolanaWallet()
  const [tokens, setTokens] = useState<TokenRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Determine if any wallet is connected
  const isConnected = evmConnected || solanaConnected
  const walletAddress = evmConnected ? evmAddress : solanaConnected && publicKey ? publicKey.toString() : null

  useEffect(() => {
    async function fetchTokens() {
      if (walletAddress) {
        setLoading(true)
        try {
          const userTokens = await getTokens(walletAddress)
          setTokens(userTokens)
        } catch (error) {
          console.error("Error fetching tokens:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setTokens([])
        setLoading(false)
      }
    }

    fetchTokens()
  }, [walletAddress])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">My Tokens</h1>
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Tokens</h1>
        <p className="text-muted-foreground max-w-2xl text-center">
          View and manage your compressed experience tokens.
        </p>

        {!isConnected && (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to view your tokens.
              <div className="flex gap-4 mt-4">
                <Button className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && tokens.length === 0 && (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Tokens Found</AlertTitle>
            <AlertDescription>
              You don't have any tokens yet. Mint your first token to get started.
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => router.push("/mint")}>
                Mint Your First Token
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <Card key={token.address} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{token.name}</CardTitle>
                    <CardDescription>{token.symbol}</CardDescription>
                  </div>
                  <Badge variant={token.is_compressed ? "default" : "outline"}>
                    {token.is_compressed ? "Compressed" : "Standard"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Supply:</span>
                    <span>{token.supply}</span>
                  </div>
                  <Separator />
                  {token.description && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Description:</span>
                        <span className="text-right max-w-[200px] truncate" title={token.description}>
                          {token.description}
                        </span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(token.created_at || "").toLocaleDateString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span className="text-right truncate max-w-[150px]" title={token.address}>
                      {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/token/${token.address}`}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/token/${token.address}`}>
                    Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {isConnected && tokens.length > 0 && (
          <Button onClick={() => router.push("/mint")} className="mt-6">
            Mint Another Token
          </Button>
        )}
      </div>
    </div>
  )
}
