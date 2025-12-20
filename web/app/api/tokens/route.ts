
import { NextResponse } from "next/server";
import { getProviderReadonly } from "@/service/services";

export async function GET() {
  try {
    const program = getProviderReadonly();
    const tokens = await program.account.tokenInfo.all();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
