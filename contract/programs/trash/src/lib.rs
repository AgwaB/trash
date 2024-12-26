pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BgFw4NEPdqsQkjDqtH2Qbb1aSxK41f95HoRTKJXfMW3x");

#[program]
pub mod trash {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>
    ) -> Result<()> {
        instructions::initialize::process_initialize(ctx)
    }

    pub fn update_admin(
        ctx: Context<UpdateAdmin>,
        new_authority: Pubkey
    ) -> Result<()> {
        instructions::admin::process_update_admin(ctx, new_authority)
    }

    pub fn withdraw_sol_from_vault(
        ctx: Context<WithdrawSolFromVault>,
        amount: u64
    ) -> Result<()> {
        instructions::admin::process_withdraw_sol_from_vault(ctx, amount)
    }

    pub fn update_label(
        ctx: Context<UpdateLabel>,
        name: String,
        multiplier: u64
    ) -> Result<()> {
        instructions::admin::process_update_label(ctx, name, multiplier)
    }

    pub fn init_user_stats(
        ctx: Context<InitUserStats>
    ) -> Result<()> {
        instructions::user::process_init_user_stats(ctx)
    }

    pub fn create_recycle_proposal(
        ctx: Context<CreateRecycleProposal>,
        token_amount: u64,
        timestamp: i64,
    ) -> Result<()> {
        instructions::recycle_v2::process_create_recycle_proposal(ctx, token_amount, timestamp)
    }

    pub fn execute_recycle_proposal(
        ctx: Context<ExecuteRecycleProposal>,
        timestamp: i64,
    ) -> Result<()> {
        let recycle_proposal = &ctx.accounts.recycle_proposal;

        require!(
            recycle_proposal.created_at == timestamp,
            error::ErrorCode::InvalidTimestamp
        );

        require!(
            recycle_proposal.is_executed == false,
            error::ErrorCode::AlreadyExecuted
        );

        instructions::recycle_v2::process_create_execute_proposal(ctx, timestamp)
    }
}
