import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// Import the SolanaWalletButton
import { SolanaWalletButton } from "@/components/solana-wallet-button"

export function Navbar() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">cToken Compression</span>
        </Link>

        {/* Update the nav links in the navbar */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link href="/mint" className="text-sm font-medium hover:text-primary">
            Mint Compressed Tokens
          </Link>
          <Link href="/generate-qr" className="text-sm font-medium hover:text-primary">
            Generate QR
          </Link>
          <Link href="/claim" className="text-sm font-medium hover:text-primary">
            Claim Tokens
          </Link>
          <Link href="/my-tokens" className="text-sm font-medium hover:text-primary">
            My Tokens
          </Link>
        </nav>

        {/* Update the div containing the wallet buttons */}
        <div className="flex items-center gap-4">
          <WalletConnectButton />
          <SolanaWalletButton />

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                {/* Also update the mobile menu */}
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/mint" className="text-lg font-medium hover:text-primary">
                    Mint Compressed Tokens
                  </Link>
                  <Link href="/generate-qr" className="text-lg font-medium hover:text-primary">
                    Generate QR
                  </Link>
                  <Link href="/claim" className="text-lg font-medium hover:text-primary">
                    Claim Tokens
                  </Link>
                  <Link href="/my-tokens" className="text-lg font-medium hover:text-primary">
                    My Tokens
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
