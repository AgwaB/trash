use anchor_lang::prelude::*;

use crate::{states::Admin, Vault, ADMIN_SEED, ANCHOR_DISCRIMINATOR, VAULT_SEED};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + Admin::INIT_SPACE,
        seeds = [ADMIN_SEED],
        bump,
    )]
    pub admin: Account<'info, Admin>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + Vault::INIT_SPACE,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program <'info, System>,
}

pub fn process_initialize(ctx: Context<Initialize>) -> Result<()> {
    let admin = &mut ctx.accounts.admin;
    let vault = &mut ctx.accounts.vault;

    admin.authority = ctx.accounts.signer.key();
    vault.total_sol_deposited = 0;
    vault.total_sol_withdrawn = 0;
    vault.total_points_supplied = 0;

    msg!(
        "Initialize summary: admin={}, vault={}",
        ctx.accounts.admin.key(),
        ctx.accounts.vault.key()
    );

    Ok(())
}