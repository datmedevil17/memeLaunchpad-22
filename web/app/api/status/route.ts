
import { NextResponse } from "next/server";
import { getProviderReadonly, getProgramState } from "@/service/services";

export async function GET() {
  try {
    const program = getProviderReadonly();
    const state = await getProgramState(program);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Error fetching program state:", error);
    return NextResponse.json(
      { error: "Failed to fetch program state" },
      { status: 500 }
    );
  }
}
