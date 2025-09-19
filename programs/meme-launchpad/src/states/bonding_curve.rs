use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    /// Associated token ID
    pub token_id: u64,
    
    /// Virtual SOL reserves for bonding curve calculation
    pub virtual_sol_reserves: u64,
    
    /// Virtual token reserves for bonding curve calculation
    pub virtual_token_reserves: u64,
    
    /// Real SOL reserves (actual SOL held)
    pub real_sol_reserves: u64,
    
    /// Real token reserves (actual tokens held)
    pub real_token_reserves: u64,
    
    /// Total SOL volume traded
    pub total_sol_volume: u64,
    
    /// Total token volume traded
    pub total_token_volume: u64,
    
    /// Current token price in lamports per token
    pub current_price: u64,
    
    /// Market cap in lamports
    pub market_cap: u64,
    
    /// Whether the curve is active
    pub active: bool,
    
    /// Last update timestamp
    pub last_updated: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl BondingCurve {
    /// Calculate token output for given SOL input using bonding curve formula
    /// Uses the formula: token_out = token_reserves * sol_in / (sol_reserves + sol_in)
    pub fn calculate_token_output(&self, sol_input: u64) -> Result<u64> {
        if sol_input == 0 {
            return Ok(0);
        }

        let numerator = (self.virtual_token_reserves as u128)
            .checked_mul(sol_input as u128)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        let denominator = (self.virtual_sol_reserves as u128)
            .checked_add(sol_input as u128)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        if denominator == 0 {
            return Err(crate::errors::ErrorCode::DivisionByZero.into());
        }
        
        let token_output = numerator
            .checked_div(denominator)
            .ok_or(crate::errors::ErrorCode::DivisionByZero)?;
            
        Ok(token_output as u64)
    }
    
    /// Calculate SOL output for given token input using bonding curve formula
    /// Uses the formula: sol_out = sol_reserves * token_in / (token_reserves + token_in)
    pub fn calculate_sol_output(&self, token_input: u64) -> Result<u64> {
        if token_input == 0 {
            return Ok(0);
        }

        let numerator = (self.virtual_sol_reserves as u128)
            .checked_mul(token_input as u128)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        let denominator = (self.virtual_token_reserves as u128)
            .checked_add(token_input as u128)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        if denominator == 0 {
            return Err(crate::errors::ErrorCode::DivisionByZero.into());
        }
        
        let sol_output = numerator
            .checked_div(denominator)
            .ok_or(crate::errors::ErrorCode::DivisionByZero)?;
            
        Ok(sol_output as u64)
    }
    
    /// Update reserves after a buy transaction
    pub fn update_reserves_buy(&mut self, sol_input: u64, token_output: u64) -> Result<()> {
        self.virtual_sol_reserves = self.virtual_sol_reserves
            .checked_add(sol_input)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        self.virtual_token_reserves = self.virtual_token_reserves
            .checked_sub(token_output)
            .ok_or(crate::errors::ErrorCode::ArithmeticUnderflow)?;
            
        self.real_sol_reserves = self.real_sol_reserves
            .checked_add(sol_input)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        self.real_token_reserves = self.real_token_reserves
            .checked_sub(token_output)
            .ok_or(crate::errors::ErrorCode::ArithmeticUnderflow)?;
            
        Ok(())
    }
    
    /// Update reserves after a sell transaction
    pub fn update_reserves_sell(&mut self, token_input: u64, sol_output: u64) -> Result<()> {
        self.virtual_token_reserves = self.virtual_token_reserves
            .checked_add(token_input)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        self.virtual_sol_reserves = self.virtual_sol_reserves
            .checked_sub(sol_output)
            .ok_or(crate::errors::ErrorCode::ArithmeticUnderflow)?;
            
        self.real_token_reserves = self.real_token_reserves
            .checked_add(token_input)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
            
        self.real_sol_reserves = self.real_sol_reserves
            .checked_sub(sol_output)
            .ok_or(crate::errors::ErrorCode::ArithmeticUnderflow)?;
            
        Ok(())
    }
}