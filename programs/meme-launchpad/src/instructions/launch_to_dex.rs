use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::{BondingCurve, ProgramState, TokenInfo, Transaction, TransactionType};
use anchor_lang::prelude::*;
// use anchor_lang::solana_program::{program::invoke_signed, system_instruction};
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;
use anchor_spl::token_2022::{self, SetAuthority, Token2022};

pub fn launch_to_dex(ctx: Context<LaunchToDexCtx>, token_id: u64, next_tx_id: u64) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let token_info = &mut ctx.accounts.token_info;
    let bonding_curve = &mut ctx.accounts.bonding_curve;
    let transaction = &mut ctx.accounts.transaction;

    // Validation checks
    if program_state.is_paused {
        return Err(ErrorCode::TradingNotActive.into());
    }

    if token_info.token_id != token_id {
        return Err(ErrorCode::TokenNotFound.into());
    }

    if token_info.launched_to_dex {
        return Err(ErrorCode::TokenAlreadyLaunched.into());
    }

    // Check if launch threshold is met
    if bonding_curve.real_sol_reserves < program_state.launch_threshold {
        return Err(ErrorCode::LaunchThresholdNotMet.into());
    }

    // Check minimum trading time has passed
    let current_time = Clock::get()?.unix_timestamp;
    if current_time - token_info.created_at < MIN_TRADING_TIME {
        return Err(ErrorCode::LaunchCooldownActive.into());
    }

    // Ensure next_tx_id is correct and then advance the counter
    if next_tx_id
        != token_info
            .transaction_count
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?
    {
        return Err(ErrorCode::ArithmeticOverflow.into());
    }

    // PDA seeds for bonding curve (used to sign CPIs / invokes)
    let bonding_curve_seeds: &[&[u8]] = &[
        BONDING_CURVE_SEED,
        &token_id.to_le_bytes(),
        &[bonding_curve.bump],
    ];
    let signer_seeds: &[&[&[u8]]] = &[&bonding_curve_seeds[..]];

    // Transfer mint authority from bonding curve (PDA) to creator
    let set_authority_accounts = SetAuthority {
        current_authority: bonding_curve.to_account_info(),
        account_or_mint: ctx.accounts.mint.to_account_info(),
    };

    let set_authority_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        set_authority_accounts,
        signer_seeds,
    );

    // Use AuthorityType from spl_token_2022
    token_2022::set_authority(
        set_authority_ctx,
        AuthorityType::MintTokens,
        Some(token_info.creator),
    )?;

    // Calculate amounts
    let total_reserves = bonding_curve.real_sol_reserves;

    let sol_for_liquidity = total_reserves
        .checked_mul(8000) // 80% for liquidity
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    let platform_launch_fee = total_reserves
        .checked_sub(sol_for_liquidity)
        .ok_or(ErrorCode::ArithmeticOverflow)?; // remaining 20%

    // Perform lamport transfers using system_instruction + invoke_signed
    // Transfer liquidity SOL to creator (from bonding_curve PDA)
    **bonding_curve.to_account_info().try_borrow_mut_lamports()? = bonding_curve
        .to_account_info()
        .lamports()
        .checked_sub(sol_for_liquidity)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    **ctx
        .accounts
        .token_creator
        .to_account_info()
        .try_borrow_mut_lamports()? = ctx
        .accounts
        .token_creator
        .to_account_info()
        .lamports()
        .checked_add(sol_for_liquidity)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    // Transfer platform fee to program_state (from bonding_curve PDA)
    **bonding_curve.to_account_info().try_borrow_mut_lamports()? = bonding_curve
        .to_account_info()
        .lamports()
        .checked_sub(platform_launch_fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    **program_state.to_account_info().try_borrow_mut_lamports()? = program_state
        .to_account_info()
        .lamports()
        .checked_add(platform_launch_fee)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    // Update token info
    token_info.launched_to_dex = true;
    token_info.launched_at = Some(current_time);
    token_info.trading_active = false; // Disable bonding curve trading
    token_info.transaction_count = next_tx_id;

    // Deactivate bonding curve
    bonding_curve.active = false;
    bonding_curve.last_updated = current_time;

    // Update program state fees
    program_state.total_fees_collected = program_state
        .total_fees_collected
        .checked_add(platform_launch_fee)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    // Record launch transaction
    transaction.transaction_id = next_tx_id;
    transaction.token_id = token_id;
    transaction.user = ctx.accounts.launcher.key();
    transaction.transaction_type = TransactionType::Launch;
    transaction.sol_amount = total_reserves;
    transaction.token_amount = 0; // No tokens involved in launch
    transaction.price = 0;
    transaction.platform_fee = platform_launch_fee;
    transaction.creator_fee = 0;
    transaction.timestamp = current_time;
    transaction.signature = [0u8; 64]; // Placeholder for signature
    transaction.bump = ctx.bumps.transaction;

    msg!("Token successfully launched to DEX!");
    msg!("Token ID: {}", token_id);
    msg!("SOL for liquidity: {}", sol_for_liquidity);
    msg!("Platform launch fee: {}", platform_launch_fee);
    msg!(
        "Mint authority transferred to creator: {}",
        token_info.creator
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(token_id: u64, next_tx_id: u64)]
pub struct LaunchToDexCtx<'info> {
    #[account(
        mut,
        seeds = [PROGRAM_STATE_SEED],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        mut,
        seeds = [TOKEN_INFO_SEED, token_id.to_le_bytes().as_ref()],
        bump = token_info.bump
    )]
    pub token_info: Account<'info, TokenInfo>,

    #[account(
        mut,
        seeds = [BONDING_CURVE_SEED, token_id.to_le_bytes().as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        init,
        payer = launcher,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            TRANSACTION_SEED,
            launcher.key().as_ref(),
            token_id.to_le_bytes().as_ref(),
            next_tx_id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    /// CHECK: Mint account that will be verified through CPI calls
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    /// CHECK: Token creator address for receiving liquidity SOL
    #[account(
        mut,
        address = token_info.creator
    )]
    pub token_creator: AccountInfo<'info>,

    #[account(mut)]
    pub launcher: Signer<'info>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
