use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, InitializeMint2, Token2022};

use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::{ProgramState, TokenInfo, BondingCurve};

pub fn create_token(
    ctx: Context<CreateTokenCtx>,
    name: String,
    symbol: String,
    uri: String,
    decimals: u8,
    initial_supply: u64,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let token_info = &mut ctx.accounts.token_info;
    let bonding_curve = &mut ctx.accounts.bonding_curve;
    let creator = &ctx.accounts.creator;

    // Validation
    if name.len() > TOKEN_NAME_MAX_LEN {
        return Err(ErrorCode::TokenNameTooLong.into());
    }
    if symbol.len() > TOKEN_SYMBOL_MAX_LEN {
        return Err(ErrorCode::TokenSymbolTooLong.into());
    }
    if uri.len() > TOKEN_URI_MAX_LEN {
        return Err(ErrorCode::TokenUriTooLong.into());
    }
    if decimals > 9 {
        return Err(ErrorCode::InvalidDecimals.into());
    }
    if initial_supply == 0 || initial_supply > MAX_TOKEN_SUPPLY {
        return Err(ErrorCode::InvalidInitialSupply.into());
    }

    if program_state.is_paused {
        return Err(ErrorCode::TradingNotActive.into());
    }

    program_state.token_count += 1;
    let token_id = program_state.token_count;

    // Initialize mint (Token-2022 CPI)
    let cpi_accounts = InitializeMint2 {
        mint: ctx.accounts.mint.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token_2022::initialize_mint2(
        cpi_ctx,
        decimals,
        &bonding_curve.key(),
        None,
    )?;

    // Populate TokenInfo
    token_info.token_id = token_id;
    token_info.mint = ctx.accounts.mint.key();
    token_info.creator = creator.key();
    token_info.name = name;
    token_info.symbol = symbol;
    token_info.uri = uri;
    token_info.decimals = decimals;
    token_info.total_supply = initial_supply;
    token_info.circulating_supply = 0;
    token_info.launched_to_dex = false;
    token_info.launched_at = None;
    token_info.total_sol_raised = 0;
    token_info.holder_count = 0;
    token_info.transaction_count = 0;
    token_info.created_at = Clock::get()?.unix_timestamp;
    token_info.trading_active = true;
    token_info.creator_fees_collected = 0;
    token_info.bump = ctx.bumps.token_info;

    // Initialize BondingCurve
    bonding_curve.token_id = token_id;
    bonding_curve.virtual_sol_reserves = INITIAL_VIRTUAL_SOL_RESERVES;
    bonding_curve.virtual_token_reserves = INITIAL_VIRTUAL_TOKEN_RESERVES;
    bonding_curve.real_sol_reserves = 0;
    bonding_curve.real_token_reserves = initial_supply;
    bonding_curve.total_sol_volume = 0;
    bonding_curve.total_token_volume = 0;
    bonding_curve.current_price = 0;
    bonding_curve.market_cap = 0;
    bonding_curve.active = true;
    bonding_curve.last_updated = Clock::get()?.unix_timestamp;
    bonding_curve.bump = ctx.bumps.bonding_curve;

    msg!("✅ Token created successfully!");
    msg!("Token ID: {}", token_id);
    msg!("Mint: {}", ctx.accounts.mint.key());

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, symbol: String, uri: String, decimals: u8, initial_supply: u64)]
pub struct CreateTokenCtx<'info> {
    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + TokenInfo::INIT_SPACE,
        seeds = [
            TOKEN_INFO_SEED,
            (program_state.token_count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub token_info: Account<'info, TokenInfo>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + BondingCurve::INIT_SPACE,
        seeds = [
            BONDING_CURVE_SEED,
            (program_state.token_count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    /// The new Mint (SPL Token-2022 compatible)
    /// CHECK: This is a Token-2022 mint account, validated via CPI in the instruction.
    #[account(init,
        payer = creator,
        space = 82, // Mint size for Token-2022
        seeds = [b"mint", bonding_curve.key().as_ref()],
        bump,
        owner = token_program.key()
    )]
    pub mint: AccountInfo<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    /// Token-2022 program
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}