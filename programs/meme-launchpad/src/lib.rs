#![allow(unexpected_cfgs)]
#![allow(deprecated)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("5kFcUdsEqDFEnSoLK9JxLhdEuGfNmyu517FkrpBwDMen");

#[program]
pub mod meme_token_launchpad {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCtx>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_token(
        ctx: Context<CreateTokenCtx>,
        name: String,
        symbol: String,
        uri: String,
        decimals: u8,
        initial_supply: u64,
    ) -> Result<()> {
        instructions::create_token(ctx, name, symbol, uri, decimals, initial_supply)
    }

    pub fn buy_token(
        ctx: Context<BuyTokenCtx>,
        token_id: u64,
        sol_amount: u64,
    ) -> Result<()> {
        instructions::buy_token(ctx, token_id, sol_amount)
    }

    pub fn sell_token(
        ctx: Context<SellTokenCtx>,
        token_id: u64,
        token_amount: u64,
    ) -> Result<()> {
        instructions::sell_token(ctx, token_id, token_amount)
    }

    pub fn launch_to_dex(
        ctx: Context<LaunchToDexCtx>,
        token_id: u64,
        liquidity_amount: u64,
    ) -> Result<()> {
        instructions::launch_to_dex(ctx, token_id, liquidity_amount)
    }

    pub fn update_platform_settings(
        ctx: Context<UpdatePlatformSettingsCtx>,
        new_fee_rate: u64,
        new_launch_threshold: u64,
    ) -> Result<()> {
        instructions::update_platform_settings(ctx, new_fee_rate, new_launch_threshold)
    }
}