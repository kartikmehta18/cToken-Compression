"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Html5Qrcode } from "html5-qrcode"
import { X } from "lucide-react"

interface QrScannerProps {
  onResult: (result: string) => void
  onCancel: () => void
}

export function QrScanner({ onResult, onCancel }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        const qrCodeId = "qr-reader"

        // Make sure the element exists
        const element = document.getElementById(qrCodeId)
        if (!element) {
          setError("QR scanner element not found")
          return
        }

        html5QrCode = new Html5Qrcode(qrCodeId)

        setIsScanning(true)

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            if (html5QrCode) {
              html5QrCode
                .stop()
                .then(() => {
                  onResult(decodedText)
                })
                .catch((err) => {
                  console.error("Failed to stop scanner:", err)
                })
            }
          },
          (errorMessage) => {
            // Error callback - we don't need to show this to the user
            console.log(errorMessage)
          },
        )
      } catch (err) {
        setError("Failed to start camera. Please make sure you've granted camera permissions.")
        console.error("QR Scanner error:", err)
      }
    }

    startScanner()

    return () => {
      if (html5QrCode && isScanning) {
        html5QrCode.stop().catch((err) => {
          console.error("Failed to stop scanner on cleanup:", err)
        })
      }
    }
  }, [onResult])

  return (
    <Card className="relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-background/80 rounded-full"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="relative aspect-square w-full max-w-[300px] mx-auto">
        <div id="qr-reader" className="w-full h-full"></div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/50 animate-scan"></div>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-sm text-muted-foreground">Position the QR code within the frame to scan</div>
    </Card>
  )
}
