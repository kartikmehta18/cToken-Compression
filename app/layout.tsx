import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/hooks/use-wallet"
import { Navbar } from "@/components/navbar"
import { SolanaWalletProvider } from "@/hooks/use-solana-wallet"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "cToken Compression Platform",
  description: "Create and distribute compressed experience tokens on Solana",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <SolanaWalletProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <footer className="py-6 border-t">
                  <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} cToken Compression Platform. Built on Solana.
                  </div>
                </footer>
              </div>
            </SolanaWalletProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
