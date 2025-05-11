'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { Menu, X, Coins } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/mint', label: 'Mint Token' },
    { href: '/buy', label: 'Buy Tokens' },
    { href: '/my-tokens', label: 'My Tokens' },
    { href: '/claim', label: 'Claim Token' },
    { href: '/generate-qr', label: 'Generate QR' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">cToken Compression</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <WalletConnectButton />
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden">
          <div className="container space-y-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
