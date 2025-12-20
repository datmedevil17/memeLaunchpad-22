
import { NextResponse } from "next/server";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getProviderReadonly, getTokenInfo } from "@/service/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const program = getProviderReadonly();
    let tokenId: BN;

    // Try to parse as a number (Token ID)
    try {
      tokenId = new BN(address);
    } catch {
       return NextResponse.json(
        { error: "Invalid token ID format" },
        { status: 400 }
      );
    }
    
    // We reuse the getTokenInfo service which derives the PDA from the BN ID
    const tokenInfo = await getTokenInfo(program, tokenId);
    return NextResponse.json(tokenInfo);
  } catch (error) {
    console.error("Error fetching token info:", error);
    return NextResponse.json(
      { error: "Failed to fetch token info" },
      { status: 500 }
    );
  }
}
