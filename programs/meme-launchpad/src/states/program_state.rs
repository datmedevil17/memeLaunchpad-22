use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    /// Whether the program has been initialized
    pub initialized: bool,
    
    /// Total number of tokens created
    pub token_count: u64,
    
    /// Platform fee rate in basis points (250 = 2.5%)
    pub platform_fee_rate: u64,
    
    /// Threshold amount to launch token to DEX (in lamports)
    pub launch_threshold: u64,
    
    /// Platform authority address
    pub platform_authority: Pubkey,
    
    /// Platform treasury address for collecting fees
    pub platform_treasury: Pubkey,
    
    /// Total platform fees collected
    pub total_fees_collected: u64,
    
    /// Emergency pause flag
    pub is_paused: bool,
    
    /// Timestamp when the program was initialized
    pub initialized_at: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}