"use client";

import React, { useEffect, useState } from "react";
import { MemeCard } from "@/components/ui/meme-card";
import { getProviderReadonly, getAllTokens } from "@/service/services";

export default function ExplorePage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const program = getProviderReadonly();
        const allTokens = await getAllTokens(program);
        // Sort by creation time (newest first) assuming token_id roughly correlates or add created_at
        // For now, reverse the list to show newest
        setTokens(allTokens.map((t) => t.account).reverse());
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div className="min-h-screen bg-black py-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-4xl font-bold text-white md:text-5xl font-play">
          Explore Meme Tokens
        </h1>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-base text-neutral-400">
            No tokens launched yet. Be the first!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tokens.map((token, index) => (
              <MemeCard key={index} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
