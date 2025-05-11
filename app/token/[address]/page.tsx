"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TokenQrGenerator } from "@/components/token-qr-generator"
import { getTokenByAddress } from "@/lib/token-service"
import { AlertCircle, ArrowLeft, ExternalLink } from "lucide-react"
import type { TokenRecord } from "@/lib/supabase"

export default function TokenDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [token, setToken] = useState<TokenRecord | null>(null)
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchToken() {
      if (params.address) {
        const tokenAddress = Array.isArray(params.address) ? params.address[0] : params.address
        try {
          const foundToken = await getTokenByAddress(tokenAddress)
          setToken(foundToken)
        } catch (error) {
          console.error("Error fetching token:", error)
          setToken(null)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchToken()
  }, [params.address])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-md h-12 bg-muted animate-pulse rounded-md"></div>
          <div className="w-full max-w-md h-64 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Token Not Found</AlertTitle>
            <AlertDescription>The token you are looking for does not exist or has been removed.</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/generate-qr")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to QR Generator
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-3xl">
          <Button variant="outline" onClick={() => router.push("/generate-qr")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to QR Generator
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{token.name}</CardTitle>
                  <CardDescription>Token Details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Symbol:</span>
                      <span>{token.symbol}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Supply:</span>
                      <span>{token.supply}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{token.is_compressed ? "Compressed Token" : "Standard Token"}</span>
                    </div>
                    <Separator />
                    {token.description && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Description:</span>
                          <span className="text-right">{token.description}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="text-right truncate max-w-[200px]" title={token.address}>
                        {token.address}
                      </span>
                    </div>
                    <Separator />
                    {token.merkle_tree_address && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Merkle Tree:</span>
                          <span className="text-right truncate max-w-[200px]" title={token.merkle_tree_address}>
                            {token.merkle_tree_address}
                          </span>
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Transaction:</span>
                      <a
                        href={`https://devnet.neonscan.org/tx/${token.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(token.created_at || "").toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>QR Code Settings</CardTitle>
                  <CardDescription>Customize your token QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Token Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(Number.parseInt(e.target.value) || 1)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Number of tokens that will be claimed when scanning this QR code
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              <TokenQrGenerator token={token} amount={amount} txHash={token.tx_hash} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
