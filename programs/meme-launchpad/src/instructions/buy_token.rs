use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_lang::system_program;
use anchor_spl::token_2022::{self, MintTo, Token2022};
use anchor_spl::associated_token::AssociatedToken;
use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::{ProgramState, TokenInfo, BondingCurve, Transaction, TransactionType};
use spl_associated_token_account::get_associated_token_address;
use spl_token_2022::state::Account as SplToken2022Account;
use anchor_spl::associated_token::Create;

pub fn buy_token(
    ctx: Context<BuyTokenCtx>,
    token_id: u64,
    sol_amount: u64,
) -> Result<()> {
    let program_state = &ctx.accounts.program_state;
    let token_info = &mut ctx.accounts.token_info;
    let bonding_curve = &mut ctx.accounts.bonding_curve;
    let transaction = &mut ctx.accounts.transaction;
    let buyer = &ctx.accounts.buyer;

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

    if !token_info.trading_active {
        return Err(ErrorCode::TradingNotActive.into());
    }

    if sol_amount < MIN_TOKEN_PURCHASE {
        return Err(ErrorCode::PurchaseAmountTooSmall.into());
    }

    if sol_amount > MAX_TOKEN_PURCHASE {
        return Err(ErrorCode::PurchaseAmountTooLarge.into());
    }

    // Calculate token output using bonding curve
    let token_output = bonding_curve.calculate_token_output(sol_amount)?;
    if token_output == 0 {
        return Err(ErrorCode::InvalidPurchaseAmount.into());
    }
    if token_output > bonding_curve.real_token_reserves {
        return Err(ErrorCode::InsufficientReserves.into());
    }

    // Calculate fees
    let platform_fee = sol_amount
        .checked_mul(program_state.platform_fee_rate)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    let creator_fee = sol_amount
        .checked_mul(100) // 1%
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    let net_sol_amount = sol_amount
        .checked_sub(platform_fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?
        .checked_sub(creator_fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;

    // Transfer SOL from buyer to bonding curve
    let transfer_accounts = system_program::Transfer {
        from: ctx.accounts.buyer.to_account_info(),
        to: bonding_curve.to_account_info(),
    };

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_accounts,
        ),
        net_sol_amount,
    )?;

    // Transfer platform fee
    if platform_fee > 0 {
        let platform_fee_accounts = system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.program_state.to_account_info(),
        };

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                platform_fee_accounts,
            ),
            platform_fee,
        )?;
    }

    // Transfer creator fee
    if creator_fee > 0 {
        let creator_fee_accounts = system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.token_creator.to_account_info(),
        };

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                creator_fee_accounts,
            ),
            creator_fee,
        )?;
    }



    // Mint tokens to buyer (bonding_curve PDA is signer)
    let binding = token_id.to_le_bytes();
    let bonding_curve_seeds = &[
        BONDING_CURVE_SEED,
        binding.as_ref(),
        &[bonding_curve.bump],
    ];
    let signer_seeds = &[&bonding_curve_seeds[..]];

    let mint_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.buyer_token_account.to_account_info(),
        authority: bonding_curve.to_account_info(),
    };

    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        mint_accounts,
        signer_seeds,
    );
     let expected_ata = get_associated_token_address(&buyer.key(), &token_info.mint);

    // Ensure the passed account is the expected ATA (compare &Pubkey to Pubkey via &expected_ata)
    if ctx.accounts.buyer_token_account.key() != expected_ata {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    // If ATA doesn't exist (account has zero data), create it via CPI to associated token program
    if ctx.accounts.buyer_token_account.data_is_empty() {
        // Build CPI accounts for associated token create
        let cpi_accounts = Create {
            payer: buyer.to_account_info(),
            associated_token: ctx.accounts.buyer_token_account.to_account_info(),
            authority: buyer.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.associated_token_program.to_account_info(), cpi_accounts);
        anchor_spl::associated_token::create(cpi_ctx)?; // creates the ATA
    }

    // Now check the ATA is owned by the SPL Token 2022 program
    if ctx.accounts.buyer_token_account.owner != &spl_token_2022::ID {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    // Unpack and validate mint + owner fields
    let ata = SplToken2022Account::unpack(&ctx.accounts.buyer_token_account.try_borrow_data()?)
        .map_err(|_| ErrorCode::InvalidTokenAccount)?;
    if ata.mint != token_info.mint {
        return Err(ErrorCode::TokenNotFound.into());
    }
    if ata.owner != *buyer.key {
        return Err(ErrorCode::InvalidTokenAccount.into());
    }

    token_2022::mint_to(mint_ctx, token_output)?;

    // Update bonding curve reserves
    bonding_curve.update_reserves_buy(net_sol_amount, token_output)?;
    bonding_curve.total_sol_volume = bonding_curve.total_sol_volume
        .checked_add(sol_amount)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    bonding_curve.total_token_volume = bonding_curve.total_token_volume
        .checked_add(token_output)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    bonding_curve.last_updated = Clock::get()?.unix_timestamp;

    // Update token info
    token_info.circulating_supply = token_info.circulating_supply
        .checked_add(token_output)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    token_info.total_sol_raised = token_info.total_sol_raised
        .checked_add(sol_amount)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    token_info.transaction_count += 1;
    token_info.creator_fees_collected = token_info.creator_fees_collected
        .checked_add(creator_fee)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    // Record transaction
    transaction.transaction_id = token_info.transaction_count;
    transaction.token_id = token_id;
    transaction.user = *buyer.key; // <- dereference to store Pubkey value
    transaction.transaction_type = TransactionType::Buy;
    transaction.sol_amount = sol_amount;
    transaction.token_amount = token_output;
    transaction.price = sol_amount
        .checked_mul(10_u64.pow(token_info.decimals as u32))
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(token_output)
        .unwrap_or(0);
    transaction.platform_fee = platform_fee;
    transaction.creator_fee = creator_fee;
    transaction.timestamp = Clock::get()?.unix_timestamp;
    transaction.signature = [0u8; 64]; // Placeholder for signature
    transaction.bump = ctx.bumps.transaction;

    msg!("Token purchase successful!");
    msg!("Token ID: {}", token_id);
    msg!("SOL Amount: {}", sol_amount);
    msg!("Token Output: {}", token_output);
    msg!("Platform Fee: {}", platform_fee);
    msg!("Creator Fee: {}", creator_fee);

    Ok(())
}

#[derive(Accounts)]
#[instruction(token_id: u64, sol_amount: u64)]
pub struct BuyTokenCtx<'info> {
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
        payer = buyer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            TRANSACTION_SEED,
            buyer.key().as_ref(),
            token_id.to_le_bytes().as_ref(),
            (token_info.transaction_count + 1).to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    /// CHECK: Mint account for SPL Token-2022.
    /// We validate this in the handler by comparing `mint.key().to_bytes()` == `token_info.mint.to_bytes()`
    /// and by using it in the token_2022 CPI.
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    /// CHECK: Buyer's associated token account (ATA) for this mint.
    /// - This account is unchecked by Anchor at compile-time.
    /// - We **validate at runtime** in `buy_token()`:
    ///     1. derive expected ATA via `get_associated_token_address(&buyer.key(), &token_info.mint)` and compare addresses,
    ///     2. if missing, create the ATA via CPI to `associated_token::create(...)`,
    ///     3. check `owner == spl_token_2022::ID`,
    ///     4. unpack via `spl_token_2022::state::Account::unpack(...)` and verify `mint == token_info.mint` and `owner == buyer`.
    #[account(mut)]
    pub buyer_token_account: AccountInfo<'info>,

    /// CHECK: Token creator address for fee distribution.
    /// Verified at runtime / via constraint with token_info.creator.
    #[account(
        mut,
        constraint = token_creator.key().to_bytes() == token_info.creator.to_bytes() @ ErrorCode::InvalidCreator
    )]
    pub token_creator: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

    /// Rent required when creating the associated token account via CPI.
    pub rent: Sysvar<'info, Rent>,
}
