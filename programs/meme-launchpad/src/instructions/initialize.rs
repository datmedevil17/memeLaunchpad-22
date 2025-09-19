use anchor_lang::prelude::*;
use crate::constants::{ANCHOR_DISCRIMINATOR_SIZE, PLATFORM_FEE_RATE, LAUNCH_THRESHOLD, PROGRAM_STATE_SEED};
use crate::errors::ErrorCode;
use crate::states::ProgramState;

pub fn initialize(ctx: Context<InitializeCtx>) -> Result<()> {
    let state = &mut ctx.accounts.program_state;
    let deployer = &ctx.accounts.deployer;

    // Check if already initialized
    if state.initialized {
        return Err(ErrorCode::AlreadyInitialized.into());
    }

    // Initialize program state
    state.initialized = true;
    state.token_count = 0;
    state.platform_fee_rate = PLATFORM_FEE_RATE;
    state.launch_threshold = LAUNCH_THRESHOLD;
    state.platform_authority = deployer.key();
    state.platform_treasury = deployer.key(); // Initially set to deployer
    state.total_fees_collected = 0;
    state.is_paused = false;
    state.initialized_at = Clock::get()?.unix_timestamp;
    state.bump = ctx.bumps.program_state;

    msg!("Meme Token Launchpad initialized successfully");
    msg!("Platform authority: {}", state.platform_authority);
    msg!("Platform fee rate: {} basis points", state.platform_fee_rate);
    msg!("Launch threshold: {} lamports", state.launch_threshold);

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCtx<'info> {
    #[account(
        init,
        payer = deployer,
        space = ANCHOR_DISCRIMINATOR_SIZE + ProgramState::INIT_SPACE,
        seeds = [PROGRAM_STATE_SEED],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub deployer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}