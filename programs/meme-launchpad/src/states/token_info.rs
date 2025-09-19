use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TokenInfo {
    /// Unique token ID
    pub token_id: u64,
    
    /// Token mint address
    pub mint: Pubkey,
    
    /// Token creator address
    pub creator: Pubkey,
    
    /// Token name
    #[max_len(32)]
    pub name: String,
    
    /// Token symbol
    #[max_len(8)]
    pub symbol: String,
    
    /// Token metadata URI
    #[max_len(256)]
    pub uri: String,
    
    /// Token decimals
    pub decimals: u8,
    
    /// Total supply of the token
    pub total_supply: u64,
    
    /// Current circulating supply
    pub circulating_supply: u64,
    
    /// Whether token has been launched to DEX
    pub launched_to_dex: bool,
    
    /// Launch timestamp
    pub launched_at: Option<i64>,
    
    /// Total SOL raised
    pub total_sol_raised: u64,
    
    /// Number of unique holders
    pub holder_count: u64,
    
    /// Number of transactions
    pub transaction_count: u64,
    
    /// Token creation timestamp
    pub created_at: i64,
    
    /// Whether trading is active
    pub trading_active: bool,
    
    /// Creator fees collected
    pub creator_fees_collected: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}