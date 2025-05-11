'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { getTokens, purchaseToken } from '@/lib/token-service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function BuyTokensPage() {
  const { address, connected } = useWallet();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [amount, setAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const data = await getTokens();
      setTokens(data);
      // Set default amount of 2 for all tokens
      const defaultAmounts = data?.reduce((acc, token) => ({
        ...acc,
        [token.id]: '2'
      }), {}) || {};
      setAmount(defaultAmounts);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (tokenId: string) => {
    if (!address) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to purchase tokens',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(tokenId);
    try {
      const result = await purchaseToken(tokenId, Number(amount[tokenId] || '2'), address);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Token purchased successfully!',
        });
        fetchTokens();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to purchase token',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error purchasing token:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to purchase token',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Buy Tokens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <Card key={token.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{token.name}</CardTitle>
              <CardDescription>{token.symbol}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Price: {token.price} ETH
                </p>
                <p className="text-sm text-muted-foreground">
                  Supply: {token.supply}
                </p>
                {token.description && (
                  <p className="text-sm text-muted-foreground">
                    {token.description}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 w-full">
                <Input
                  type="number"
                  min="1"
                  value={amount[token.id] || '2'}
                  onChange={(e) => setAmount(prev => ({
                    ...prev,
                    [token.id]: e.target.value
                  }))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">tokens</span>
              </div>
              <Button
                onClick={() => handleBuy(token.id)}
                disabled={!connected || purchasing === token.id}
                className="w-full"
              >
                {purchasing === token.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  'Buy Tokens'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tokens available for purchase</p>
        </div>
      )}
    </div>
  );
} 