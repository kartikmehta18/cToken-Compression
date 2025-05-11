import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function CompressionInfo() {
  return (
    <Alert className="max-w-3xl mx-auto mb-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>About Compressed Tokens</AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          This platform uses Solana's state compression technology to create more efficient and cost-effective tokens.
          Compressed tokens (cNFTs) use Merkle trees to store token data off-chain while maintaining the security and
          verifiability of on-chain assets.
        </p>
        <p className="mt-2">Benefits of compressed tokens:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Lower minting costs (up to 100x cheaper)</li>
          <li>Reduced storage requirements</li>
          <li>Faster transaction processing</li>
          <li>Environmentally friendly</li>
        </ul>
        <p className="mt-2">
          Learn more about{" "}
          <Link
            href="https://www.zkcompression.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            zkCompression
          </Link>{" "}
          and{" "}
          <Link
            href="https://solana.com/developers/guides/compressed-nfts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Solana's Compressed NFTs
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  )
}
