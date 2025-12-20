"use client";

import React, { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { getProvider, getProviderReadonly, getProgramState, initialize, updatePlatformSettings } from "@/service/services";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function AdminPage() {
  const wallet = useAnchorWallet();
  const [programState, setProgramState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feeRate, setFeeRate] = useState("");
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const program = getProviderReadonly();
      const state = await getProgramState(program);
      if (state) {
          setProgramState(state);
          setIsInitialized(true);
          setFeeRate(state.platformFeeRate.toString());
          setThreshold((state.launchThreshold.toNumber() / LAMPORTS_PER_SOL).toString());
      }
    } catch (error) {
      console.log("Program state not found (likely not initialized).");
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [wallet]);

  const handleInitialize = async () => {
    if (!wallet) return;
    setStatus("Initializing...");
    try {
        const provider = getProvider(wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions);
        if (!provider) return;
        
        await initialize(provider, wallet.publicKey);
        setStatus("Initialized successfully!");
        fetchData();
    } catch (err) {
        console.error(err);
        setStatus("Failed to initialize.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setStatus("Updating settings...");
    
    try {
        const provider = getProvider(wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions);
        if (!provider) return;

        const newFee = new BN(feeRate);
        const newThresh = new BN(parseFloat(threshold) * LAMPORTS_PER_SOL);
        
        await updatePlatformSettings(provider, wallet.publicKey, newFee, newThresh);
        setStatus("Settings updated successfully!");
        fetchData();
    } catch (err) {
        console.error(err);
        setStatus("Failed to update settings.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black font-play pt-24 px-4 md:px-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-12">
           <h1 className="text-4xl font-bold">Admin Dashboard</h1>
           <WalletMultiButton />
        </div>

        {!wallet ? (
            <div className="text-center py-20 text-neutral-400">Connect wallet to access admin functions.</div>
        ) : loading ? (
            <div className="text-center py-20 animate-pulse">Loading state...</div>
        ) : (
            <div className="space-y-8">
                {/* Program Status Card */}
                <div className="p-6 rounded-xl bg-neutral-900 border border-white/10">
                    <h2 className="text-2xl font-bold mb-4">Program Status</h2>
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-lg">{isInitialized ? "Initialized" : "Not Initialized"}</span>
                    </div>
                    
                    {!isInitialized && (
                        <button 
                            onClick={handleInitialize}
                            className="mt-6 px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition-colors"
                        >
                            Initialize Program
                        </button>
                    )}
                </div>

                {/* Settings Form */}
                {isInitialized && (
                    <div className="p-6 rounded-xl bg-neutral-900 border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
                        
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Fee Rate (Basis Points)</label>
                                <input 
                                    type="number"
                                    value={feeRate}
                                    onChange={(e) => setFeeRate(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Example: 100 = 1%</p>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Launch Threshold (SOL)</label>
                                <input 
                                    type="number"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500 transition-colors"
                            >
                                Update Settings
                            </button>
                        </form>
                    </div>
                )}

                {status && (
                    <div className="p-4 rounded-lg bg-neutral-800 text-center font-bold">
                        {status}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}