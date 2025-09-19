use anchor_lang::prelude::*;
use crate::constants::PROGRAM_STATE_SEED;
use crate::errors::ErrorCode;
use crate::states::ProgramState;

pub fn withdraw_platform_fees(
    ctx: Context<WithdrawPlatformFeesCtx>,
    amount: u64,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let authority = &ctx.accounts.authority;
    let treasury = &ctx.accounts.treasury;

    // Check authorization
    if program_state.platform_authority != authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // Check available balance
    let available_balance = **program_state.to_account_info().lamports.borrow();
    if amount > available_balance {
        return Err(ErrorCode::InsufficientSolBalance.into());
    }

    // Transfer fees to treasury
    **program_state.to_account_info().try_borrow_mut_lamports()? -= amount;
    **treasury.to_account_info().try_borrow_mut_lamports()? += amount;

    msg!("Platform fees withdrawn: {} lamports", amount);

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawPlatformFeesCtx<'info> {
    #[account(
        mut,
        seeds = [PROGRAM_STATE_SEED],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        constraint = authority.key() == program_state.platform_authority @ ErrorCode::Unauthorized
    )]
    pub authority: Signer<'info>,
    
    /// CHECK: Treasury account to receive fees
    #[account(
        mut,
        address = program_state.platform_treasury
    )]
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}