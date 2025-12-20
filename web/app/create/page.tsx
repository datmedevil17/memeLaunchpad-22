
"use client";

import React, { useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { BN } from "@coral-xyz/anchor";
import { uploadToIpfs, uploadToIpfsJson } from "@/utils/pinata";
import { createToken, getProvider } from "@/service/services";
import { NavbarButton } from "@/components/ui/resizable-navbar";

export default function CreatePage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) {
      alert("Please connect your wallet");
      return;
    }
    if (!name || !symbol || !description || !file) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setStatus("Uploading image to IPFS...");

    try {
      // 1. Upload Image
      const imageUrl = await uploadToIpfs(file);

      // 2. Upload Metadata
      setStatus("Uploading metadata to IPFS...");
      const metadata = {
        name,
        symbol,
        description,
        image: imageUrl,
      };
      const metadataUrl = await uploadToIpfsJson(metadata);

      // 3. Create Token
      setStatus("Creating token on Solana...");
      const provider = getProvider(wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions);
      if (!provider) throw new Error("Provider not initialized");

      const tx = await createToken(
        provider,
        wallet.publicKey,
        name,
        symbol,
        metadataUrl,
        6, // decimals
        new BN(1000000000).mul(new BN(1000000)) // 1B supply * 10^6 decimals
      );

      console.log("Token Created:", tx);
      setStatus("Success! Redirecting...");
      
      // Redirect to explore or dashboard (or potentially the new token page if we can get the ID)
      // For now, let's go to explore to see it appear
      router.push("/explore");

    } catch (error) {
      console.error("Creation failed:", error);
      alert("Failed to create token. See console for details.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4 md:px-8 font-play text-white">
      <div className="mx-auto max-w-2xl rounded-xl bg-neutral-900/50 p-8 border border-white/10 backdrop-blur-sm">
        <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          Launch Your Meme Token
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400">Token Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white"
              placeholder="e.g. Doge Coin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white"
              placeholder="e.g. DOGE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white h-32"
              placeholder="Tell us about your meme..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700"
            />
          </div>

          <div className="pt-4">
             <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full bg-white py-3 text-lg font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? status || "Creating..." : "Launch Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
