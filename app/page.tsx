import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"
import { Coins, QrCode, Users, Wallet } from "lucide-react"

// Import the CompressionInfo component
import { CompressionInfo } from "@/components/compression-info"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      {/* Add the CompressionInfo component after the HeroSection */}
      <CompressionInfo />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and distribute compressed experience tokens on Solana. Mint tokens for your events and let attendees
            claim them by scanning a QR code, all with the efficiency of state compression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
          <FeatureCard
            icon={<Coins className="h-10 w-10 text-primary" />}
            title="Mint Compressed Tokens"
            description="Create compressed cTokens for your experiences with just a few clicks"
            href="/mint"
            buttonText="Create Tokens"
          />

          <FeatureCard
            icon={<QrCode className="h-10 w-10 text-primary" />}
            title="Generate QR"
            description="Create shareable QR codes for your compressed tokens"
            href="/generate-qr"
            buttonText="Create QR Code"
          />

          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Claim Tokens"
            description="Scan a QR code to claim your compressed experience tokens"
            href="/claim"
            buttonText="Claim Tokens"
          />

          <FeatureCard
            icon={<Wallet className="h-10 w-10 text-primary" />}
            title="My Tokens"
            description="View and manage all your compressed experience tokens"
            href="/my-tokens"
            buttonText="View Tokens"
          />
        </div>
      </div>

      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Get Started with Compressed Tokens?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Create your first compressed experience token in minutes and start engaging with your community using
              Solana's efficient state compression.
            </p>
            <Link href="/mint">
              <Button size="lg" className="px-8">
                Create Your First Token
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
