use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Burn, Token2022};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::system_program;
use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::{ProgramState, TokenInfo, BondingCurve, Transaction, TransactionType};

pub fn sell_token(
    ctx: Context<SellTokenCtx>,
    token_id: u64,
    token_amount: u64,
) -> Result<()> {
    let program_state = &ctx.accounts.program_state;
    let token_info = &mut ctx.accounts.token_info;
    let bonding_curve = &mut ctx.accounts.bonding_curve;
    let transaction = &mut ctx.accounts.transaction;
    let seller = &ctx.accounts.seller;

    // === VALIDATIONS (same as yours) ===
    if program_state.is_paused {
        return Err(ErrorCode::TradingNotActive.into());
    }
    if token_info.token_id != token_id {
        return Err(ErrorCode::TokenNotFound.into());
    }
    if token_info.launched_to_dex {
        return Err(ErrorCode::TokenAlreadyLaunched.into());
    }
    if !token_info.trading_active {
        return Err(ErrorCode::TradingNotActive.into());
    }
    if token_amount == 0 {
        return Err(ErrorCode::InvalidPurchaseAmount.into());
    }

    // Calculate SOL output using bonding curve
    let sol_output = bonding_curve.calculate_sol_output(token_amount)?;
    if sol_output == 0 {
        return Err(ErrorCode::InvalidPurchaseAmount.into());
    }
    if sol_output > bonding_curve.real_sol_reserves {
        return Err(ErrorCode::InsufficientReserves.into());
    }

   

    // Calculate fees (same as you had)
    let platform_fee = sol_output
        .checked_mul(program_state.platform_fee_rate)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    let creator_fee = sol_output
        .checked_mul(100) // 1%
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    let net_sol_output = sol_output
        .checked_sub(platform_fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?
        .checked_sub(creator_fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;

    // Burn tokens from seller (CPI expects AccountInfo for token_2022 — OK)
    let burn_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.seller_token_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };

    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        burn_accounts,
    );

    token_2022::burn(burn_ctx, token_amount)?;

    // --- rest of your SOL transfers and updates (unchanged) ---
    let binding = token_id.to_le_bytes();
    let bonding_curve_seeds = &[
        BONDING_CURVE_SEED,
        binding.as_ref(),
        &[bonding_curve.bump],
    ];
    let signer_seeds = &[&bonding_curve_seeds[..]];

    let transfer_accounts = system_program::Transfer {
        from: bonding_curve.to_account_info(),
        to: ctx.accounts.seller.to_account_info(),
    };

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        ),
        net_sol_output,
    )?;

    if platform_fee > 0 {
        let platform_fee_accounts = system_program::Transfer {
            from: bonding_curve.to_account_info(),
            to: ctx.accounts.program_state.to_account_info(),
        };
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                platform_fee_accounts,
                signer_seeds,
            ),
            platform_fee,
        )?;
    }

    if creator_fee > 0 {
        let creator_fee_accounts = system_program::Transfer {
            from: bonding_curve.to_account_info(),
            to: ctx.accounts.token_creator.to_account_info(),
        };
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                creator_fee_accounts,
                signer_seeds,
            ),
            creator_fee,
        )?;
    }

    // Update bonding curve reserves and token_info (unchanged)
    bonding_curve.update_reserves_sell(token_amount, sol_output)?;
    bonding_curve.total_sol_volume = bonding_curve.total_sol_volume
        .checked_add(sol_output)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    bonding_curve.total_token_volume = bonding_curve.total_token_volume
        .checked_add(token_amount)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    bonding_curve.last_updated = Clock::get()?.unix_timestamp;

    token_info.circulating_supply = token_info.circulating_supply
        .checked_sub(token_amount)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    token_info.transaction_count += 1;
    token_info.creator_fees_collected = token_info.creator_fees_collected
        .checked_add(creator_fee)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    // Record transaction (unchanged)
    transaction.transaction_id = token_info.transaction_count;
    transaction.token_id = token_id;
    transaction.user = *seller.key;
    transaction.transaction_type = TransactionType::Sell;
    transaction.sol_amount = sol_output;
    transaction.token_amount = token_amount;
    transaction.price = sol_output
        .checked_mul(10_u64.pow(token_info.decimals as u32))
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(token_amount)
        .unwrap_or(0);
    transaction.platform_fee = platform_fee;
    transaction.creator_fee = creator_fee;
    transaction.timestamp = Clock::get()?.unix_timestamp;
    transaction.signature = [0u8; 64]; // Placeholder for signature
    transaction.bump = ctx.bumps.transaction;

    msg!("Token sale successful!");
    msg!("Token ID: {}", token_id);
    msg!("Token Amount: {}", token_amount);
    msg!("SOL Output: {}", sol_output);
    msg!("Platform Fee: {}", platform_fee);
    msg!("Creator Fee: {}", creator_fee);

    Ok(())
}

#[derive(Accounts)]
#[instruction(token_id: u64, token_amount: u64)]
pub struct SellTokenCtx<'info> {
    #[account(
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
        payer = seller,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            TRANSACTION_SEED,
            seller.key().as_ref(),
            token_id.to_le_bytes().as_ref(),
            (token_info.transaction_count + 1).to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    /// CHECK: This is the Token-2022 mint account. We validate it manually in the handler.
    #[account(
        mut,
        constraint = mint.key().to_bytes() == token_info.mint.to_bytes() @ ErrorCode::TokenNotFound
    )]
    pub mint: AccountInfo<'info>,

    /// CHECK: Token-2022 token account (associated) — validated manually in handler via unpack().
    #[account(mut)]
    pub seller_token_account: AccountInfo<'info>,

    /// CHECK: Token creator account for fee distribution, validated through constraint
    #[account(
        mut,
        constraint = token_creator.key().to_bytes() == token_info.creator.to_bytes() @ ErrorCode::InvalidCreator
    )]
    pub token_creator: AccountInfo<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
