use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Program already initialized")]
    AlreadyInitialized,

    #[msg("Token name too long")]
    TokenNameTooLong,

    #[msg("Token symbol too long")]
    TokenSymbolTooLong,

    #[msg("Token URI too long")]
    TokenUriTooLong,

    #[msg("Invalid decimals value")]
    InvalidDecimals,

    #[msg("Invalid initial supply")]
    InvalidInitialSupply,

    #[msg("Token not found")]
    TokenNotFound,

    #[msg("Token already launched to DEX")]
    TokenAlreadyLaunched,

    #[msg("Invalid purchase amount")]
    InvalidPurchaseAmount,

    #[msg("Purchase amount too small")]
    PurchaseAmountTooSmall,

    #[msg("Purchase amount too large")]
    PurchaseAmountTooLarge,

    #[msg("Insufficient SOL balance")]
    InsufficientSolBalance,

    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,

    #[msg("Bonding curve calculation error")]
    BondingCurveError,

    #[msg("Launch threshold not met")]
    LaunchThresholdNotMet,

    #[msg("Launch cooldown period not elapsed")]
    LaunchCooldownActive,

    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Invalid fee rate")]
    InvalidFeeRate,

    #[msg("Invalid launch threshold")]
    InvalidLaunchThreshold,

    #[msg("Trading not active")]
    TradingNotActive,

    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Token creation failed")]
    TokenCreationFailed,

    #[msg("Mint authority transfer failed")]
    MintAuthorityTransferFailed,

    #[msg("Token account creation failed")]
    TokenAccountCreationFailed,

    #[msg("Invalid token program")]
    InvalidTokenProgram,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid account")]
    InvalidAccount,

    #[msg("Account not mutable")]
    AccountNotMutable,

    #[msg("Invalid signer")]
    InvalidSigner,

    #[msg("Token metadata update failed")]
    TokenMetadataUpdateFailed,

    #[msg("Insufficient reserves")]
    InsufficientReserves,

    #[msg("Bonding curve inactive")]
    BondingCurveInactive,

    #[msg("Invalid transaction ID")]
    InvalidTransactionId,

     #[msg("Invalid creator")]
    InvalidCreator,

     #[msg("Invalid token account")]
    InvalidTokenAccount
}