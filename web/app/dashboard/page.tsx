"use client";

import React, { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getProviderReadonly, getAllTokensByCreator } from "@/service/services";
import { MemeCard } from "@/components/ui/meme-card";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function DashboardPage() {
  const wallet = useAnchorWallet();
  const [myTokens, setMyTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyTokens = async () => {
      if (!wallet) return;
      setLoading(true);
      try {
        const program = getProviderReadonly();
        const tokens = await getAllTokensByCreator(program, wallet.publicKey);
        // Sort by creation or other metric if possible, currently just reverse for "newest" roughly
        setMyTokens(tokens.map(t => t.account).reverse());
      } catch (error) {
        console.error("Error fetching creator tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTokens();
  }, [wallet]);

  return (
    <div className="min-h-screen w-full bg-black font-play pt-24 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
           <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">
             Creator Dashboard
           </h1>
           {!wallet && <WalletMultiButton />}
        </div>

        {!wallet ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/50 rounded-2xl border border-white/5">
             <p className="text-xl text-neutral-400 mb-6">Connect your wallet to view your launched tokens.</p>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="text-center py-20 text-neutral-400 animate-pulse">Loading your tokens...</div>
            ) : myTokens.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/50 rounded-2xl border border-white/5">
                 <p className="text-xl text-neutral-400 mb-6">You haven't launched any tokens yet.</p>
                 <a href="/create" className="px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors">
                    Launch your first token
                 </a>
               </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {myTokens.map((token, idx) => (
                    <MemeCard key={idx} token={token} />
                  ))}
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
