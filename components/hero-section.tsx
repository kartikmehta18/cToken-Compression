import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-24 md:pt-32 md:pb-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[10%] w-[200%] aspect-square bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Compressed Experience Tokens for the Digital Age
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl">
            Create, distribute, and collect compressed digital experience tokens powered by Solana's state compression
            technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/mint">
              <Button size="lg" className="px-8">
                Create Token
              </Button>
            </Link>
            <Link href="/claim">
              <Button size="lg" variant="outline" className="px-8">
                Claim Token
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
