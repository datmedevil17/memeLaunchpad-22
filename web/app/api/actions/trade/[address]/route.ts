import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getProviderReadonly, RPC_URL } from "@/service/services";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

// Standard headers for CORS
const headers = createActionHeaders({ headers: ACTIONS_CORS_HEADERS });

export const OPTIONS = async () => new Response(null, { status: 200, headers });

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) => {
  try {
    const { address } = await params;
    
    // Validate ID
    let tokenId: BN;
    try {
      tokenId = new BN(address);
    } catch {
       return Response.json({ error: "Invalid ID" }, { status: 400, headers });
    }

    const program = getProviderReadonly();
    
    // Fetch Token Info
    const [tokenInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
        program.programId
    );
    
    let tokenInfo;
    try {
        tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);
    } catch (e) {
        return Response.json({ error: "Token not found" }, { status: 404, headers });
    }

    // Try to get image from metadata
    let icon = tokenInfo.uri;
    try {
        const metadataRes = await fetch(tokenInfo.uri);
        const metadata = await metadataRes.json();
        if (metadata.image) {
            icon = metadata.image;
        }
    } catch (e) {
        console.log("Failed to fetch metadata json, using uri as image");
    }

    const title = `Buy ${tokenInfo.name} (${tokenInfo.symbol})`;
    const description = `Buy ${tokenInfo.name} instantly. Launched on Meme Launchpad.`;
    const label = `Buy ${tokenInfo.symbol}`;

    const baseUrl = new URL(req.url).origin;

    const payload: ActionGetResponse = {
      title,
      icon,
      description,
      label,
      links: {
          actions: [
              {
                  type: "transaction",
                  label: "Buy 0.1 SOL",
                  href: `${baseUrl}/api/actions/trade/${address}?amount=0.1`
              },
              {
                  type: "transaction",
                  label: "Buy 0.5 SOL",
                  href: `${baseUrl}/api/actions/trade/${address}?amount=0.5`
              },
              {
                  type: "transaction",
                  label: "Buy X SOL",
                  href: `${baseUrl}/api/actions/trade/${address}?amount={amount}`,
                  parameters: [
                      {
                          name: "amount",
                          label: "Enter SOL amount",
                          required: true
                      }
                  ]
              }
          ]
      }
    };
    
    return Response.json(payload, { headers });

  } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      return Response.json({ error: "Internal error", details: msg }, { status: 500, headers });
  }
}

export const POST = async (
    req: Request,
    { params }: { params: Promise<{ address: string }> }
) => {
    try {
        const { address } = await params;
        const url = new URL(req.url);
        const amountStr = url.searchParams.get("amount");
        
        if (!amountStr) {
            return Response.json({ error: "Amount required" }, { status: 400, headers });
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            return Response.json({ error: "Invalid amount" }, { status: 400, headers });
        }

        const body: ActionPostRequest = await req.json();
        const account = new PublicKey(body.account);

        const connection = new Connection(RPC_URL, "confirmed");
        const program = getProviderReadonly();
        const tokenId = new BN(address);
        
        const [tokenInfoPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);
        
        const [bondingCurvePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const [programStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_state")],
            program.programId
        );
        
        // Transaction PDA derived with [transaction, buyer, tokenId, nextTxId]
        const nextTxId = tokenInfo.transactionCount.add(new BN(1));
        const [transactionPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("transaction"),
                account.toBuffer(),
                tokenId.toArrayLike(Buffer, "le", 8),
                nextTxId.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );
        
        const buyerTokenAccount = getAssociatedTokenAddressSync(
            tokenInfo.mint,
            account,
            false,
            TOKEN_2022_PROGRAM_ID
        );
        
        const solAmount = new BN(amount * LAMPORTS_PER_SOL);
        
        const ix = await program.methods
            .buyToken(tokenId, solAmount)
            .accountsPartial({
                programState: programStatePda,
                tokenInfo: tokenInfoPda,
                bondingCurve: bondingCurvePda,
                transaction: transactionPda,
                mint: tokenInfo.mint,
                buyerTokenAccount: buyerTokenAccount,
                tokenCreator: tokenInfo.creator,
                buyer: account,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();
            
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: account
        }).add(ix);
        
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                type: "transaction",
                transaction,
                message: `Bought ${amount} SOL of ${tokenInfo.symbol}`,
            },
        });
        
        return Response.json(payload, { headers });
        
    } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: "Tx Failed", details: msg }, { status: 500, headers });
    }
}
