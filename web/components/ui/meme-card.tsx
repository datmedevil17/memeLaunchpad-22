
"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getJsonFromIpfs } from "@/utils/pinata";
import { truncateAddress } from "@/utils/helpers";
import Link from "next/link";

interface MemeCardProps {
  token: any; // We'll type this better if possible or use 'any' for speed as requested
}

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export function MemeCard({ token }: MemeCardProps) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        if (token.uri) {
          const data = await getJsonFromIpfs<TokenMetadata>(token.uri);
          setMetadata(data);
        }
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [token.uri]);

  return (
    <Link href={`/token/${token.tokenId.toString()}`} className="max-w-xs w-full group/card block">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4",
          "bg-cover bg-center transition-all duration-300"
        )}
        style={{
             backgroundImage: `url(${metadata?.image || "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80"})`
        }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60 bg-black/40"></div>
      <div className="flex flex-row items-center space-x-4 z-10">
          {metadata?.image ? (
               <img
                height="100"
                width="100"
                alt={token.name}
                src={metadata.image}
                className="h-10 w-10 rounded-full border-2 object-cover border-white/50"
              />
          ) : (
              <div className="h-10 w-10 rounded-full border-2 border-white/50 bg-neutral-800" />
          )}
         
          <div className="flex flex-col">
            <p className="font-normal text-base text-gray-50 relative z-10 transition-colors group-hover/card:text-white">
              {truncateAddress(token.creator.toString())}
            </p>
            <p className="text-sm text-gray-400">Creator</p>
          </div>
        </div>
        <div className="text content z-10 flex flex-col items-start gap-4">
            <div>
              <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10 transition-transform duration-300 group-hover/card:-translate-y-1">
                {token.name} <span className="text-sm font-normal text-gray-300">({token.symbol})</span>
              </h1>
              <p className="font-normal text-sm text-gray-50 relative z-10 my-4 line-clamp-3">
                 {metadata?.description || "No description available."}
              </p>
            </div>
            
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `https://dial.to/?action=solana-action:${window.location.origin}/api/actions/trade/${token.tokenId.toString()}`;
                    navigator.clipboard.writeText(url);
                    alert("Blink URL copied to clipboard!");
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-bold z-20 transition-colors"
             >
                Share Blink ⭐
             </button>
        </div>
      </div>
    </Link>
  );
}
