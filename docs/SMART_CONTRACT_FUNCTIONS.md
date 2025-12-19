# Smart Contract Functions Documentation

This document provides a detailed explanation of every instruction in the Meme Launchpad smart contract.

---

## 🏗 Administrative Functions

These functions manage the global state of the platform and can only be executed by the **Platform Authority** (Admin).

### `initialize`
*   **Purpose**: Sets up the global `ProgramState` PDA. This must be called once after deployment.
*   **Parameters**: None.
*   **Logic**:
    1.  Checks if `ProgramState` is already initialized.
    2.  Sets default values:
        *   `platform_fee_rate`: 1% (100 basis points).
        *   `launch_threshold`: 20 SOL (in lamports).
        *   `platform_authority`: The deployer's public key.
        *   `platform_treasury`: The deployer's public key.
        *   `is_paused`: `false`.
*   **Security check**: Can only be called once.

### `update_platform_settings`
*   **Purpose**: Updates dynamic platform configuration.
*   **Parameters**:
    *   `new_fee_rate` (u64): Fee in basis points (e.g., 100 = 1%).
    *   `new_launch_threshold` (u64): Lamports required to trigger a DEX launch.
*   **Logic**:
    1.  Updates `platform_fee_rate` and `launch_threshold` in `ProgramState`.
*   **Security check**:
    *   Caller must be `platform_authority`.
    *   `new_fee_rate` cannot exceed 10% (1000 bps).
    *   `new_launch_threshold` must be at least 100 SOL.

### `withdraw_platform_fees`
*   **Purpose**: Withdraws accumulated platform fees to the treasury.
*   **Parameters**:
    *   `amount` (u64): Amount of lamports to withdraw.
*   **Logic**:
    1.  Decrements lamports from `ProgramState` account.
    2.  Increments lamports in the `treasury` account.
*   **Security check**:
    *   Caller must be `platform_authority`.
    *   `amount` must not exceed available balance.

### `toggle_emergency_pause`
*   **Purpose**: Pauses or unpauses all trading and creation activities.
*   **Parameters**: None.
*   **Logic**:
    1.  Flips the boolean value of `is_paused` in `ProgramState`.
*   **Security check**: Caller must be `platform_authority`.

---

## 🪙 Token Lifecycle Functions

Functions related to creating, managing, and deleting meme tokens.

### `create_token`
*   **Purpose**: Deploys a new meme token with a bonding curve.
*   **Parameters**:
    *   `name` (String): Token name.
    *   `symbol` (String): Token symbol.
    *   `uri` (String): Metadata URI.
    *   `decimals` (u8): Token decimals (usually 6 or 9).
    *   `initial_supply` (u64): Total supply to mint.
*   **Logic**:
    1.  **Validation**: Checks string lengths and constraints.
    2.  **State Update**: Increments `token_count` in `ProgramState`.
    3.  **Minting**: Uses CPI to `token_2022` to initialize the mint.
    4.  **Bonding Curve**: Initializes `BondingCurve` PDA with virtual reserves.
    5.  **Token Info**: Initializes `TokenInfo` PDA with metadata and creator details.
*   **Security check**:
    *   Fails if `program_state.is_paused` is true.
    *   Validates limits for name (32 chars), symbol (10 chars), and URI (200 chars).

### `delete_token`
*   **Purpose**: Allows a creator to delete a token if it has no activity.
*   **Parameters**:
    *   `token_id` (u64): The unique ID of the token.
*   **Logic**:
    1.  Closes `TokenInfo` and `BondingCurve` accounts.
    2.  Refunds rent to the creator.
    3.  If there are any SOL reserves (unlikely if inactive), returns them to creator.
*   **Security check**:
    *   Caller must be the **Token Creator**.
    *   Token must **not** be launched to DEX.
    *   `circulating_supply` must be 0 (no one has bought it yet).

---

## 📈 Trading Functions

The core bonding curve mechanics.

### `buy_token`
*   **Purpose**: Buy tokens from the bonding curve using SOL.
*   **Parameters**:
    *   `token_id` (u64): The token to buy.
    *   `sol_amount` (u64): Amount of SOL to spend.
*   **Logic**:
    1.  **Price Calculation**: Uses Constant Product Formula (`x * y = k`) to calculate `token_output` based on `sol_amount` input.
    2.  **Fee Calculation**: Calculates Platform Fee (1%) and Creator Fee (1%).
    3.  **SOL Transfer**:
        *   Net SOL -> Bonding Curve PDA.
        *   Fees -> Program State & Creator Account.
    4.  **Token Transfer**: Mints `token_output` tokens from the Mint to the Buyer.
    5.  **Update State**: Updates reserves, volumes, and creates a `Transaction` log.
*   **Security check**:
    *   Fails if `trading_active` is false (launched to DEX).
    *   Fails if `program_state.is_paused` is true.
    *   Slippage protection (implied by atomic simulation, explicit slippage param can be added).

### `sell_token`
*   **Purpose**: Sell tokens back to the bonding curve for SOL.
*   **Parameters**:
    *   `token_id` (u64): The token to sell.
    *   `token_amount` (u64): Amount of tokens to sell.
*   **Logic**:
    1.  **Price Calculation**: Uses Constant Product Formula to calculate `sol_output` based on `token_amount`.
    2.  **Fee Calculation**: Calculates fees on the *output* SOL.
    3.  **Token Transfer**: Burns `token_amount` from Seller's account.
    4.  **SOL Transfer**:
        *   Net SOL -> Seller.
        *   Fees -> Program State & Creator.
    5.  **Update State**: Decrements reserves and updates volumes.
*   **Security check**: Same pause/active checks as `buy_token`.

---

## 🚀 Launch Functions

### `launch_to_dex`
*   **Purpose**: Migrates the token from the bonding curve to an external DEX (e.g., Raydium) once the market cap threshold is hit.
*   **Parameters**:
    *   `token_id` (u64): The token to launch.
    *   `next_tx_id` (u64): Expected next transaction ID for optimistic concurrency control.
*   **Logic**:
    1.  **Revoke Authority**: Transfers Mint Authority of the token from the `BondingCurve` to the Creator (or Burn it, depending on implementation preference).
    2.  **Liquidity seeding**:
        *   Calculates 80% of `real_sol_reserves` for liquidity.
        *   Calculates 20% remaining as a final "Launch Fee" to the platform.
    3.  **Transfers**:
        *   Sends Liquidity SOL -> Creator (for them to create the pool).
        *   Sends Fee SOL -> Program Treasury.
    4.  **State Update**:
        *   Sets `launched_to_dex = true`.
        *   Sets `trading_active = false`.
        *   Sets `bonding_curve.active = false`.
*   **Security check**:
    *   `real_sol_reserves` must be >= `launch_threshold`.
    *   `MIN_TRADING_TIME` (checks if enough time has passed likely prevents flash-loan attacks).
