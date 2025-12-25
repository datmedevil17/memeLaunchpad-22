import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { MemeTokenLaunchpad } from "@/programs/meme_token_launchpad";
import idl from "../programs/meme_token_launchpad.json";
import { getClusterURL } from "@/utils/helpers";

const CLUSTER: string = process.env.NEXT_PUBLIC_CLUSTER || "devnet";
export const RPC_URL: string = getClusterURL(CLUSTER);

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: unknown,
  sendTransaction: unknown
): Program<MemeTokenLaunchpad> | null => {
  if (!publicKey || !signTransaction) {
    console.log("Wallet not connected or missing signTransaction");
    return null;
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<MemeTokenLaunchpad>(idl as MemeTokenLaunchpad, provider);
};

export const getProviderReadonly = (): Program<MemeTokenLaunchpad> => {
  const connection = new Connection(RPC_URL, "confirmed");

  const walllet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
    signAllTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
  };

  const provider = new AnchorProvider(
    connection,
    walllet as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<MemeTokenLaunchpad>(idl as MemeTokenLaunchpad, provider);
};

export const getProgramState = async (program: Program<MemeTokenLaunchpad>) => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  return await program.account.programState.fetch(programStatePda);
};

export const getTokenInfo = async (
  program: Program<MemeTokenLaunchpad>,
  tokenId: BN
) => {
  const [tokenInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  return await program.account.tokenInfo.fetch(tokenInfoPda);
};

export const getBondingCurve = async (
  program: Program<MemeTokenLaunchpad>,
  tokenId: BN
) => {
  const [bondingCurvePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  return await program.account.bondingCurve.fetch(bondingCurvePda);
};

export const initialize = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const tx = await program.methods
    .initialize()
    .accountsPartial({
      programState: programStatePda,
      deployer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const createToken = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey,
  name: string,
  symbol: string,
  uri: string,
  decimals: number,
  initialSupply: BN
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  const programState = await program.account.programState.fetch(programStatePda);
  const tokenId = programState.tokenCount.add(new BN(1));

  const [tokenInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [bondingCurvePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [mintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), bondingCurvePda.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .createToken(name, symbol, uri, decimals, initialSupply)
    .accountsPartial({
      programState: programStatePda,
      tokenInfo: tokenInfoPda,
      bondingCurve: bondingCurvePda,
      mint: mintPda,
      creator: publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  return tx;
};

export const buyToken = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey,
  tokenId: BN,
  solAmount: BN
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const [tokenInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);

  const [bondingCurvePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [mintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), bondingCurvePda.toBuffer()],
    program.programId
  );

  const buyerTokenAccount = getAssociatedTokenAddressSync(
    mintPda,
    publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const nextTxId = tokenInfo.transactionCount.add(new BN(1));
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      publicKey.toBuffer(),
      tokenId.toArrayLike(Buffer, "le", 8),
      nextTxId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const tx = await program.methods
    .buyToken(tokenId, solAmount)
    .accountsPartial({
      programState: programStatePda,
      tokenInfo: tokenInfoPda,
      bondingCurve: bondingCurvePda,
      transaction: transactionPda,
      mint: mintPda,
      buyerTokenAccount: buyerTokenAccount,
      tokenCreator: tokenInfo.creator,
      buyer: publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  return tx;
};

export const sellToken = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey,
  tokenId: BN,
  tokenAmount: BN
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const [tokenInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);

  const [bondingCurvePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [mintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), bondingCurvePda.toBuffer()],
    program.programId
  );

  const sellerTokenAccount = getAssociatedTokenAddressSync(
    mintPda,
    publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  const nextTxId = tokenInfo.transactionCount.add(new BN(1));
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      publicKey.toBuffer(),
      tokenId.toArrayLike(Buffer, "le", 8),
      nextTxId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const tx = await program.methods
    .sellToken(tokenId, tokenAmount)
    .accountsPartial({
      programState: programStatePda,
      tokenInfo: tokenInfoPda,
      bondingCurve: bondingCurvePda,
      transaction: transactionPda,
      mint: mintPda,
      sellerTokenAccount: sellerTokenAccount,
      tokenCreator: tokenInfo.creator,
      seller: publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const launchToDex = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey,
  tokenId: BN,
  liquidityAmount: BN
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const [tokenInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_info"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);

  const [bondingCurvePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), tokenId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [mintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), bondingCurvePda.toBuffer()],
    program.programId
  );

  const nextTxId = tokenInfo.transactionCount.add(new BN(1));
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      publicKey.toBuffer(),
      tokenId.toArrayLike(Buffer, "le", 8),
      nextTxId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const tx = await program.methods
    .launchToDex(tokenId, liquidityAmount)
    .accountsPartial({
      programState: programStatePda,
      tokenInfo: tokenInfoPda,
      bondingCurve: bondingCurvePda,
      transaction: transactionPda,
      mint: mintPda,
      tokenCreator: tokenInfo.creator,
      launcher: publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const updatePlatformSettings = async (
  program: Program<MemeTokenLaunchpad>,
  publicKey: PublicKey,
  newFeeRate: BN,
  newLaunchThreshold: BN
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const tx = await program.methods
    .updatePlatformSettings(newFeeRate, newLaunchThreshold)
    .accountsPartial({
      programState: programStatePda,
      authority: publicKey,
    })
    .rpc();

  return tx;
};

export const getAllTokens = async (program: Program<MemeTokenLaunchpad>) => {
  return await program.account.tokenInfo.all();
};

export const getAllTokensByCreator = async (
  program: Program<MemeTokenLaunchpad>,
  creator: PublicKey
) => {
  return await program.account.tokenInfo.all([
    {
      memcmp: {
        offset: 8,
        bytes: creator.toBase58(),
      },
    },
  ]);
};

export const getUserTokenBalance = async (
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
) => {
  try {
    const ata = getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const balance = await connection.getTokenAccountBalance(ata);
    return balance.value.uiAmount || 0;
  } catch (error) {
    return 0;
  }
};

export const getTokenProgress = async (
  program: Program<MemeTokenLaunchpad>,
  tokenId: BN
) : Promise<number> => {
   const curve = await getBondingCurve(program, tokenId);
   const LIMIT_SOL = 85; 
   
   if (curve.realSolReserves && curve.realSolReserves.toNumber() > 0) {
       const solAmount = curve.realSolReserves.toNumber() / 1e9;
       const progress = (solAmount / LIMIT_SOL) * 100;
       return Math.min(progress, 100);
   }
   return 0;
};



