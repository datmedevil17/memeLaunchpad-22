pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

// Platform constants
pub const PLATFORM_FEE_RATE: u64 = 250; // 2.5% in basis points
pub const LAUNCH_THRESHOLD: u64 = 1000_000_000_000; // 1000 SOL in lamports
pub const MIN_TOKEN_PURCHASE: u64 = 100_000_000; // 0.1 SOL minimum purchase
pub const MAX_TOKEN_PURCHASE: u64 = 10_000_000_000; // 10 SOL maximum purchase per transaction

// Token constants
pub const TOKEN_NAME_MAX_LEN: usize = 32;
pub const TOKEN_SYMBOL_MAX_LEN: usize = 8;
pub const TOKEN_URI_MAX_LEN: usize = 256;
pub const TOKEN_DESCRIPTION_MAX_LEN: usize = 512;

// Bonding curve constants
pub const INITIAL_VIRTUAL_SOL_RESERVES: u64 = 30_000_000_000; // 30 SOL
pub const INITIAL_VIRTUAL_TOKEN_RESERVES: u64 = 1_073_000_000_000_000; // ~73% of max supply
pub const MAX_TOKEN_SUPPLY: u64 = 1_000_000_000_000_000; // 1 billion tokens (with 6 decimals)

// Seeds
pub const PROGRAM_STATE_SEED: &[u8] = b"program_state";
pub const TOKEN_INFO_SEED: &[u8] = b"token_info";
pub const BONDING_CURVE_SEED: &[u8] = b"bonding_curve";
pub const TRANSACTION_SEED: &[u8] = b"transaction";
pub const USER_TOKEN_ACCOUNT_SEED: &[u8] = b"user_token_account";

// Timing constants (in seconds)
pub const LAUNCH_COOLDOWN: i64 = 86400; // 24 hours
pub const MIN_TRADING_TIME: i64 = 3600; // 1 hour minimum before launch