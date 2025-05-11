import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  buttonText: string
  external?: boolean
}

export function FeatureCard({ icon, title, description, href, buttonText, external }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center text-center h-full">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">{/* Additional content can go here */}</CardContent>
      <CardFooter className="w-full">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">
              {buttonText} <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        ) : (
          <Link href={href} className="w-full">
            <Button variant="outline" className="w-full">
              {buttonText}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
