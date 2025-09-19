use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::{ProgramState, TokenInfo, BondingCurve};

pub fn delete_token(ctx: Context<DeleteTokenCtx>, token_id: u64) -> Result<()> {
    let token_info = &ctx.accounts.token_info;
    let bonding_curve = &ctx.accounts.bonding_curve;
    let creator = &ctx.accounts.creator;

    // Only creator can delete token
    if token_info.creator != creator.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // Can only delete if not launched and no trading activity
    if token_info.launched_to_dex {
        return Err(ErrorCode::TokenAlreadyLaunched.into());
    }

    if token_info.circulating_supply > 0 {
        return Err(ErrorCode::TradingNotActive.into());
    }

    // Return any SOL in bonding curve to creator
    if bonding_curve.real_sol_reserves > 0 {
        **ctx.accounts.bonding_curve.to_account_info().try_borrow_mut_lamports()? -= bonding_curve.real_sol_reserves;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += bonding_curve.real_sol_reserves;
    }

    msg!("Token {} deleted successfully", token_id);

    Ok(())
}

#[derive(Accounts)]
#[instruction(token_id: u64)]
pub struct DeleteTokenCtx<'info> {
    #[account(
        mut,
        close = creator,
        seeds = [TOKEN_INFO_SEED, token_id.to_le_bytes().as_ref()],
        bump = token_info.bump
    )]
    pub token_info: Account<'info, TokenInfo>,
    
    #[account(
        mut,
        close = creator,
        seeds = [BONDING_CURVE_SEED, token_id.to_le_bytes().as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        mut,
        constraint = creator.key() == token_info.creator @ ErrorCode::Unauthorized
    )]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}