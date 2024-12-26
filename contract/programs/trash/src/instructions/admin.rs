use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{error::ErrorCode, Admin, Label, Vault, ADMIN_SEED, ANCHOR_DISCRIMINATOR, LABEL_SEED, SOL_DECIMALS, VAULT_SEED};

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    seeds = [ADMIN_SEED],
    bump,
    has_one = authority,
  )]
  pub admin: Account<'info, Admin>,
}

#[derive(Accounts)]
pub struct WithdrawSolFromVault<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  /// CHECK: receiver is just receiving SOL
  #[account(mut)]
  pub receiver: UncheckedAccount<'info>,

  #[account(
    mut,
    seeds = [ADMIN_SEED],
    bump,
    has_one = authority,
  )]
  pub admin: Account<'info, Admin>,

  #[account(
    mut,
    seeds = [VAULT_SEED],
    bump,
  )]
  pub vault: Account<'info, Vault>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateLabel<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  pub mint: InterfaceAccount<'info, Mint>,

  #[account(
    seeds = [ADMIN_SEED],
    bump,
    has_one = authority,
  )]
  pub admin: Account<'info, Admin>,

  #[account(
    init_if_needed,
    payer = authority,
    space = ANCHOR_DISCRIMINATOR + Label::INIT_SPACE,
    seeds = [LABEL_SEED, mint.key().as_ref()],
    bump,
  )]
  pub label: Account<'info, Label>,

  pub system_program: Program<'info, System>,
}

pub fn process_update_admin(
  ctx: Context<UpdateAdmin>,
  new_authority: Pubkey
) -> Result<()> {
  let admin = &mut ctx.accounts.admin;
  admin.authority = new_authority;

  msg!(
    "Admin update summary: from={}, to={}",
    ctx.accounts.authority.key(),
    new_authority
  );

  Ok(())
}

pub fn process_withdraw_sol_from_vault(
  ctx: Context<WithdrawSolFromVault>,
  amount: u64,
) -> Result<()> {
  require!(amount > 0, ErrorCode::InvalidAmount);

  let vault = &ctx.accounts.vault;
  let vault_lamports = vault.to_account_info().lamports();
  let minimum_balance = Rent::get()?.minimum_balance(vault.to_account_info().data_len());

  let remaining_balance = vault_lamports
    .checked_sub(amount)
    .ok_or(ErrorCode::Overflow)?;

  require!(
    remaining_balance >= minimum_balance,
    ErrorCode::InsufficientBalance
  );

  **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = vault_lamports
    .checked_sub(amount)
    .ok_or(ErrorCode::Overflow)?;
  
  **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.receiver
    .to_account_info()
    .lamports()
    .checked_add(amount)
    .ok_or(ErrorCode::Overflow)?;

  let vault = &mut ctx.accounts.vault;
  vault.total_sol_withdrawn = vault.total_sol_withdrawn
    .checked_add(amount)
    .ok_or(ErrorCode::Overflow)?;

  msg!(
    "Withraw from vault summary: amount={} SOL, receiver={}, remaining={}",
    amount as f64 / SOL_DECIMALS,
    ctx.accounts.receiver.key(),
    remaining_balance as f64 / SOL_DECIMALS
  );

  msg!(
    "Vault status: total_sol_deposited={}, total_sol_withdrawn={}, total_points_supplied={}",
    vault.total_sol_deposited as f64 / SOL_DECIMALS,
    vault.total_sol_withdrawn as f64 / SOL_DECIMALS,
    vault.total_points_supplied as f64 / SOL_DECIMALS
  );

  Ok(())
}

pub fn process_update_label(
  ctx: Context<UpdateLabel>,
  name: String,
  multiplier: u64, // 1000 = 1x multiplier, 1500 = 1.5x multiplier
) -> Result<()> {
  let label = &mut ctx.accounts.label;
  label.mint = ctx.accounts.mint.key();
  label.name = name;
  label.multiplier = multiplier;

  msg!(
    "Label update summary: token={}, name='{}', multiplier={}x",
    ctx.accounts.mint.key(),
    label.name,
    label.multiplier as f64 / 1000.0
  );

  Ok(())
}