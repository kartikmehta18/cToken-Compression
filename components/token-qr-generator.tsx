"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Copy, Share } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import type { TokenRecord } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

interface TokenQrGeneratorProps {
  token: TokenRecord | any // Accept both Supabase and localStorage formats
  amount?: number
  receiverAddress?: string
  txHash?: string
}

export function TokenQrGenerator({ token, amount = 1, receiverAddress, txHash }: TokenQrGeneratorProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string>("")

  // Generate QR code when component mounts or token changes
  useEffect(() => {
    if (!token) return

    // Handle both Supabase and localStorage data structures
    const tokenAddress = token.address
    const tokenSymbol = token.symbol
    const tokenName = token.name
    const isCompressed = token.is_compressed !== undefined ? token.is_compressed : token.isCompressed
    const merkleTreeAddress = token.merkle_tree_address || token.merkleTreeAddress
    const tokenTxHash = token.tx_hash || token.txHash || txHash

    // Create Solana Pay URL
    const solanaPayUrl = `solana:${tokenAddress}?amount=${amount}&spl-token=1&reference=${
      receiverAddress || ""
    }&label=${tokenSymbol}&message=Claim your ${tokenName} token&memo=${tokenTxHash || ""}`

    setQrUrl(solanaPayUrl)

    // Generate QR code
    if (canvasRef.current) {
      const canvas = canvasRef.current

      QRCode.toCanvas(
        canvas,
        solanaPayUrl,
        {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 300,
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
              ctx.fillRect(0, canvas.height - 60, canvas.width, 60)

              // Add token name and symbol
              ctx.fillStyle = "#FFFFFF"
              ctx.font = "bold 14px Arial"
              ctx.textAlign = "center"
              ctx.fillText(`${tokenName} (${tokenSymbol})`, canvas.width / 2, canvas.height - 40)

              // Add transaction hash if available
              if (tokenTxHash) {
                ctx.font = "10px Arial"
                const shortHash = `${tokenTxHash.substring(0, 8)}...${tokenTxHash.substring(tokenTxHash.length - 8)}`
                ctx.fillText(shortHash, canvas.width / 2, canvas.height - 20)
              }

              // Update data URL with the new canvas content
              setQrDataUrl(canvas.toDataURL("image/png"))
            }
          }
        },
      )
    }
  }, [token, amount, receiverAddress, txHash])

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `${token.symbol}-token-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "Your token QR code has been downloaded successfully.",
    })
  }

  const handleCopyToClipboard = async () => {
    if (!qrUrl) return

    try {
      await navigator.clipboard.writeText(qrUrl)
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

  const handleShare = async () => {
    if (!qrDataUrl || !navigator.share) return

    try {
      const blob = await fetch(qrDataUrl).then((r) => r.blob())
      const file = new File([blob], `${token.symbol}-token-qr.png`, { type: "image/png" })

      await navigator.share({
        title: `${token.name} Token QR Code`,
        text: `Scan this QR code to claim ${amount} ${token.name} (${token.symbol}) token${amount !== 1 ? "s" : ""}`,
        url: qrUrl,
        files: [file],
      })

      toast({
        title: "QR Code Shared",
        description: "Your token QR code has been shared successfully.",
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Share failed",
          description: "There was an error sharing the QR code. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Handle both Supabase and localStorage data structures
  const isCompressed = token.is_compressed !== undefined ? token.is_compressed : token.isCompressed
  const merkleTreeAddress = token.merkle_tree_address || token.merkleTreeAddress

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Token QR Code</span>
          <Badge variant="outline" className="ml-2">
            {isCompressed ? "Compressed" : "Standard"}
          </Badge>
        </CardTitle>
        <CardDescription>Scan this code to claim {token.name} tokens</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <canvas ref={canvasRef} width={300} height={360} className="mx-auto" />
        </div>

        <div className="w-full space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Name:</span>
            <span>{token.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Symbol:</span>
            <span>{token.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Supply:</span>
            <span>{token.supply}</span>
          </div>
          {token.description && (
            <div className="flex justify-between">
              <span className="font-medium">Description:</span>
              <span className="text-right">{token.description}</span>
            </div>
          )}
          {merkleTreeAddress && (
            <div className="flex justify-between">
              <span className="font-medium">Merkle Tree:</span>
              <span className="text-right truncate max-w-[200px]" title={merkleTreeAddress}>
                {merkleTreeAddress.substring(0, 8)}...
                {merkleTreeAddress.substring(merkleTreeAddress.length - 8)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCopyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </Button>
        <Button variant="outline" onClick={handleShare} disabled={!navigator.share}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button onClick={handleDownload} disabled={!qrDataUrl}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
