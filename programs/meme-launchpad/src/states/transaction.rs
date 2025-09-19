use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TransactionType {
    Buy,
    Sell,
    Launch,
}

#[account]
#[derive(InitSpace)]
pub struct Transaction {
    /// Transaction ID
    pub transaction_id: u64,
    
    /// Associated token ID
    pub token_id: u64,
    
    /// User who initiated the transaction
    pub user: Pubkey,
    
    /// Transaction type
    pub transaction_type: TransactionType,
    
    /// SOL amount involved
    pub sol_amount: u64,
    
    /// Token amount involved
    pub token_amount: u64,
    
    /// Price at the time of transaction
    pub price: u64,
    
    /// Platform fee charged
    pub platform_fee: u64,
    
    /// Creator fee charged (if applicable)
    pub creator_fee: u64,
    
    /// Transaction timestamp
    pub timestamp: i64,
    
    /// Transaction signature
    pub signature: [u8; 64],
    
    /// Bump seed for PDA
    pub bump: u8,
}