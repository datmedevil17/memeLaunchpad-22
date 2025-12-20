
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getProvider, getProviderReadonly, getTokenInfo, getBondingCurve, buyToken, sellToken, launchToDex, getUserTokenBalance, getTokenProgress } from "@/service/services";
import { getJsonFromIpfs } from "@/utils/pinata";
import { truncateAddress } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface TokenData {
  name: string;
  symbol: string;
  uri: string;
  mint: string;
  creator: string;
  virtualSolReserves: BN;
  virtualTokenReserves: BN;
  realSolReserves: BN;
  realTokenReserves: BN;
  token_id: BN;
  launchedToDex: boolean;
  marketCap: number; 
  price: number; 
}

interface Metadata {
  description: string;
  image: string;
}

export default function TokenPage() {
  const { tokenId } = useParams();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  
  const [token, setToken] = useState<TokenData | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [txStatus, setTxStatus] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const fetchTokenData = async () => {
    try {
      if (!tokenId) return;
      
      const program = getProviderReadonly();
      const id = new BN(tokenId as string);
      
      const info = await getTokenInfo(program, id);
      const curve = await getBondingCurve(program, id);
      const progressVal = await getTokenProgress(program, id);
      setProgress(progressVal);

      if (wallet && info.mint) {
         const bal = await getUserTokenBalance(connection, info.mint, wallet.publicKey);
         setUserBalance(bal);
      }
      
      const priceVal = curve.currentPrice ? curve.currentPrice.toNumber() : 0; 
      const supply = 1_000_000_000 * 1_000_000; 
      const mcSol = (Number(priceVal) * supply) / 1e9 / 1e6; 
      
      setToken({
          ...info,
          virtualSolReserves: curve.virtualSolReserves,
          virtualTokenReserves: curve.virtualTokenReserves,
          realSolReserves: curve.realSolReserves,
          realTokenReserves: curve.realTokenReserves,
          token_id: info.tokenId,
          creator: info.creator.toString(),
          mint: info.mint.toString(),
          name: info.name,
          symbol: info.symbol,
          uri: info.uri,
          launchedToDex: info.launchedToDex,
          marketCap: mcSol,
          price: priceVal
      });

      if (info.uri) {
          const meta = await getJsonFromIpfs<Metadata>(info.uri);
          setMetadata(meta);
      }

    } catch (error) {
      console.error("Error fetching token:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, [tokenId, wallet]); // Reload if wallet connects

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !token) {
        alert("Please connect wallet");
        return;
    }
    
    setTxStatus("Processing transaction...");
    try {
        const provider = getProvider(wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions);
        if(!provider) throw new Error("No provider");

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            alert("Invalid amount");
            return;
        }

        let tx;
        if (mode === "buy") {
             const amountBN = new BN(val * 1e9);
             tx = await buyToken(provider, wallet.publicKey, token.token_id, amountBN);
        } else {
             const amountBN = new BN(val * 1e6);
             tx = await sellToken(provider, wallet.publicKey, token.token_id, amountBN);
        }

        console.log("Transaction:", tx);
        setTxStatus("Transaction successful!");
        setAmount("");
        fetchTokenData(); // Refresh stats

    } catch(err) {
        console.error(err);
        setTxStatus("Transaction failed.");
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading token...</div>;
  if (!token) return <div className="text-white text-center py-20">Token not found</div>;

  return (
    <div className="min-h-screen bg-black py-20 px-4 md:px-8 font-play text-white">
      <div className="mx-auto max-w-6xl">
         <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* Left Column: Info & Chart */}
            <div className="md:col-span-2 space-y-6">
                 {/* Header */}
                 <div className="flex flex-col md:flex-row gap-6 items-start">
                     {metadata?.image && (
                         <img src={metadata.image} alt={token.name} className="w-32 h-32 rounded-xl object-cover border-2 border-white/10" />
                     )}
                     <div>
                         <h1 className="text-3xl font-bold">{token.name} <span className="text-neutral-400 text-xl">({token.symbol})</span></h1>
                         <p className="text-green-400 mt-1">Market Cap: ${token.marketCap.toFixed(4)} SOL (Approx)</p>
                         <p className="text-neutral-400 text-sm mt-2">Creator: {truncateAddress(token.creator)}</p>
                         <p className="text-neutral-300 mt-4 text-base leading-relaxed bg-neutral-900/50 p-4 rounded-lg border border-white/5">
                             {metadata?.description || "No description."}
                         </p>
                     </div>
                 </div>

                 {/* Chart Placeholder */}
                 <div className="h-96 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center">
                     <p className="text-neutral-500">TradingView Chart Placeholder</p>
                 </div>
                 
                 {/* Bonding Curve Progress */}
                 <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
                     <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold">Bonding Curve Progress</h3>
                        <span className="text-green-400 font-mono">{progress.toFixed(2)}%</span>
                     </div>
                     <div className="w-full bg-neutral-800 rounded-full h-4 overflow-hidden border border-white/5">
                         <div 
                           className="bg-green-500 h-full transition-all duration-500 ease-out" 
                           style={{ width: `${progress}%` }} 
                         />
                     </div>
                     <p className="text-xs text-neutral-400 mt-2">When the market cap reaches ~69 SOL, all liquidity is deposited into Raydium and burned.</p>
                 </div>
            </div>

            {/* Right Column: Trading */}
            <div className="md:col-span-1">
                 <div className="sticky top-24 p-6 rounded-xl bg-neutral-900 border border-white/10 shadow-2xl">
                     <div className="flex w-full mb-6 bg-neutral-800 p-1 rounded-lg">
                         <button 
                             onClick={() => setMode("buy")}
                             className={cn("flex-1 py-2 rounded-md font-bold transition-all", mode === "buy" ? "bg-green-500 text-black" : "text-neutral-400 hover:text-white")}
                         >
                             Buy
                         </button>
                         <button 
                             onClick={() => setMode("sell")}
                             className={cn("flex-1 py-2 rounded-md font-bold transition-all", mode === "sell" ? "bg-red-500 text-black" : "text-neutral-400 hover:text-white")}
                         >
                             Sell
                         </button>
                     </div>

                     <div className="mb-4 text-right text-xs text-neutral-400">
                        Balance: {mode === 'buy' ? 'Unknown SOL' : `${userBalance} ${token.symbol}`}
                     </div>

                     <form onSubmit={handleTrade} className="space-y-4">
                         <div>
                             <label className="text-sm text-neutral-400 mb-1 block">Amount ({mode === 'buy' ? 'SOL' : token.symbol})</label>
                             <div className="relative">
                                 <input 
                                     type="number" 
                                     step="any"
                                     value={amount}
                                     onChange={(e) => setAmount(e.target.value)}
                                     placeholder="0.00"
                                     className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-3 px-4 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                 />
                                 <div className="absolute right-4 top-3 text-sm font-bold text-neutral-500">
                                     {mode === 'buy' ? 'SOL' : token.symbol}
                                 </div>
                             </div>
                         </div>

                         {wallet ? (
                             <button 
                                 type="submit"
                                 disabled={!amount || txStatus.includes("Processing")}
                                 className={cn(
                                     "w-full py-3 rounded-lg font-bold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                     mode === "buy" ? "bg-green-500 text-black hover:bg-green-400" : "bg-red-500 text-black hover:bg-red-400"
                                 )}
                             >
                                 {txStatus === "Processing transaction..." ? "Processing..." : mode === 'buy' ? 'Buy fast' : 'Sell fast'}
                             </button>
                         ) : (
                             <div className="w-full py-3 rounded-lg bg-neutral-700 text-center text-neutral-300 font-bold">
                                 Connect Wallet to Trade
                             </div>
                         )}
                         
                         {txStatus && (
                             <p className={cn("text-center text-sm font-bold", txStatus.includes("success") ? "text-green-400" : "text-yellow-400")}>
                                 {txStatus}
                             </p>
                         )}
                     </form>
                 </div>
            </div>

         </div>
      </div>
    </div>
  );
}
