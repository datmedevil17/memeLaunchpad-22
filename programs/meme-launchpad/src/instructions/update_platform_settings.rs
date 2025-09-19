use anchor_lang::prelude::*;
use crate::constants::{PROGRAM_STATE_SEED};
use crate::errors::ErrorCode;
use crate::states::ProgramState;

pub fn update_platform_settings(
    ctx: Context<UpdatePlatformSettingsCtx>,
    new_fee_rate: u64,
    new_launch_threshold: u64,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let authority = &ctx.accounts.authority;

    // Check if caller is platform authority
    if program_state.platform_authority != authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // Validate new fee rate (max 10% = 1000 basis points)
    if new_fee_rate > 1000 {
        return Err(ErrorCode::InvalidFeeRate.into());
    }

    // Validate new launch threshold (minimum 100 SOL)
    if new_launch_threshold < 100_000_000_000 { // 100 SOL in lamports
        return Err(ErrorCode::InvalidLaunchThreshold.into());
    }

    // Store old values for logging
    let old_fee_rate = program_state.platform_fee_rate;
    let old_launch_threshold = program_state.launch_threshold;

    // Update settings
    program_state.platform_fee_rate = new_fee_rate;
    program_state.launch_threshold = new_launch_threshold;

    msg!("Platform settings updated successfully!");
    msg!("Fee rate: {} -> {} basis points", old_fee_rate, new_fee_rate);
    msg!("Launch threshold: {} -> {} lamports", old_launch_threshold, new_launch_threshold);

    Ok(())
}

pub fn update_platform_authority(
    ctx: Context<UpdatePlatformAuthorityCtx>,
    new_authority: Pubkey,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let current_authority = &ctx.accounts.current_authority;

    // Check if caller is current platform authority
    if program_state.platform_authority != current_authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    let old_authority = program_state.platform_authority;
    program_state.platform_authority = new_authority;

    msg!("Platform authority updated!");
    msg!("Old authority: {}", old_authority);
    msg!("New authority: {}", new_authority);

    Ok(())
}

pub fn update_platform_treasury(
    ctx: Context<UpdatePlatformTreasuryCtx>,
    new_treasury: Pubkey,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let authority = &ctx.accounts.authority;

    // Check if caller is platform authority
    if program_state.platform_authority != authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    let old_treasury = program_state.platform_treasury;
    program_state.platform_treasury = new_treasury;

    msg!("Platform treasury updated!");
    msg!("Old treasury: {}", old_treasury);
    msg!("New treasury: {}", new_treasury);

    Ok(())
}

pub fn toggle_emergency_pause(
    ctx: Context<ToggleEmergencyPauseCtx>,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let authority = &ctx.accounts.authority;

    // Check if caller is platform authority
    if program_state.platform_authority != authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    program_state.is_paused = !program_state.is_paused;

    msg!("Emergency pause toggled: {}", program_state.is_paused);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePlatformSettingsCtx<'info> {
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
}

#[derive(Accounts)]
pub struct UpdatePlatformAuthorityCtx<'info> {
    #[account(
        mut,
        seeds = [PROGRAM_STATE_SEED],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        constraint = current_authority.key() == program_state.platform_authority @ ErrorCode::Unauthorized
    )]
    pub current_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePlatformTreasuryCtx<'info> {
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
}

#[derive(Accounts)]
pub struct ToggleEmergencyPauseCtx<'info> {
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
}