use anchor_lang::{
  prelude::*, system_program,
};
use anchor_spl::token::Mint;

use crate::{error::ErrorCode, Label, RecycleProposal, UserStats, Vault, ANCHOR_DISCRIMINATOR, LABEL_SEED, RECYCLE_PROPOSAL_SEED, SOL_DECIMALS, USER_STATS_SEED, VAULT_SEED};

#[derive(Accounts)]
#[instruction(token_amount: u64, timestamp: i64)]
pub struct CreateRecycleProposal<'info> {
  #[account(mut)]
  pub user: Signer<'info>,

  pub token_mint: Account<'info, Mint>,

  #[account(
    init,
    payer = user,
    space = ANCHOR_DISCRIMINATOR + RecycleProposal::INIT_SPACE,
    seeds = [
      RECYCLE_PROPOSAL_SEED,
      user.key().as_ref(),
      token_mint.key().as_ref(),
      &timestamp.to_le_bytes()
    ],
    bump,
  )]
  pub recycle_proposal: Account<'info, RecycleProposal>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct ExecuteRecycleProposal<'info> {
  #[account(mut)]
  pub user: Signer<'info>,

  #[account(
    mut,
    seeds = [USER_STATS_SEED, user.key().as_ref()],
    bump,
  )]
  pub user_stats: Box<Account<'info, UserStats>>,

  pub token_mint: Account<'info, Mint>,

  #[account(
    mut,
    seeds = [
      RECYCLE_PROPOSAL_SEED,
      user.key().as_ref(),
      token_mint.key().as_ref(),
      &timestamp.to_le_bytes()
    ],
    bump,
  )]
  pub recycle_proposal: Box<Account<'info, RecycleProposal>>,

  #[account(
    mut,
    seeds = [VAULT_SEED],
    bump,
  )]
  pub vault: Box<Account<'info, Vault>>,

  #[account(
    seeds = [LABEL_SEED, token_mint.key().as_ref()],
    bump,
  )]
  pub label: Option<Box<Account<'info, Label>>>,

  pub system_program: Program<'info, System>,
}

pub fn process_create_recycle_proposal(
  ctx: Context<CreateRecycleProposal>,
  token_amount: u64,
  timestamp: i64,
) -> Result<()> {
  require!(
    token_amount > 0,
    ErrorCode::InvalidTokenAmount
  );

  let current_time = Clock::get()?.unix_timestamp;
  
  require!(
    timestamp <= current_time + 180 &&
    timestamp >= current_time - 180,
    ErrorCode::InvalidTimestamp
  );
  
  let recycle_proposal = &mut ctx.accounts.recycle_proposal;
  recycle_proposal.user = ctx.accounts.user.key();
  recycle_proposal.token_mint = ctx.accounts.token_mint.key();
  recycle_proposal.token_amount = token_amount;
  recycle_proposal.initial_sol = ctx.accounts.user.lamports();
  recycle_proposal.created_at = timestamp;
  recycle_proposal.is_executed = false;
  recycle_proposal.sol_received = 0;
  recycle_proposal.points_earned = 0;
  recycle_proposal.executed_at = 0;

  msg!(
    "Create recycle proposal summary: token={}, amount={}, initial_sol={}, createdAt={}",
    recycle_proposal.token_mint,
    recycle_proposal.token_amount,
    recycle_proposal.initial_sol as f64 / SOL_DECIMALS,
    recycle_proposal.created_at
  );

  Ok(())
}

pub fn process_create_execute_proposal(
  ctx: Context<ExecuteRecycleProposal>,
  _timestamp: i64,
) -> Result<()> {
  let current_time = Clock::get()?.unix_timestamp;

  let initial_sol = ctx.accounts.recycle_proposal.initial_sol;
  let after_swap_sol = ctx.accounts.user.lamports();

  let diff_sol = if after_swap_sol >= initial_sol {
    after_swap_sol - initial_sol
  } else {
    0
  };

  if diff_sol > 0 {
    system_program::transfer(
      CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
      ),
      diff_sol
    )?;

    update_vault_and_user_stats(
      ctx.accounts.token_mint.key(),
      &mut ctx.accounts.user_stats,
      &mut ctx.accounts.recycle_proposal,
      &mut ctx.accounts.vault,
      ctx.accounts.label.as_deref(),
      diff_sol,
      current_time,
    )?;
  } else {
    let recycle_proposal = &mut ctx.accounts.recycle_proposal;
    recycle_proposal.is_executed = true;
    recycle_proposal.executed_at = current_time;

    msg!("Recycle proposal executed but no SOL profit generated");
  }

  Ok(())
}

fn update_vault_and_user_stats(
  token_mint: Pubkey,
  user_stats: &mut Account<UserStats>,
  recycle_proposal: &mut Account<RecycleProposal>,
  vault: &mut Account<Vault>,
  label: Option<&Account<Label>>,
  diff_sol: u64,
  current_time: i64,
) -> Result<()> {
  // Calculate points with label multiplier
  let multiplier = label
    .filter(|label| !label.name.is_empty())
    .map(|label| label.multiplier)
    .unwrap_or(1000); // 1000 = 1x multiplier

  let base_points = diff_sol // 1 SOL = 100 points
    .checked_mul(100)
    .ok_or(ErrorCode::Overflow)?;

  let points_earned = base_points
    .checked_mul(multiplier)
    .ok_or(ErrorCode::Overflow)?
    .checked_div(1000)
    .ok_or(ErrorCode::Overflow)?;

  // Update vault
  vault.total_sol_deposited = vault
    .total_sol_deposited
    .checked_add(diff_sol)
    .ok_or(ErrorCode::Overflow)?;

  vault.total_points_supplied = vault
    .total_points_supplied
    .checked_add(points_earned)
    .ok_or(ErrorCode::Overflow)?;

  // Update recycle proposal
  recycle_proposal.is_executed = true;
  recycle_proposal.sol_received = diff_sol;
  recycle_proposal.points_earned = points_earned;
  recycle_proposal.executed_at = current_time;

  // Update user stats
  user_stats.recycle_count = user_stats
    .recycle_count
    .checked_add(1)
    .ok_or(ErrorCode::Overflow)?;
  user_stats.total_sol_received = user_stats
    .total_sol_received
    .checked_add(diff_sol)
    .ok_or(ErrorCode::Overflow)?;
  user_stats.total_points_earned = user_stats
    .total_points_earned
    .checked_add(points_earned)
    .ok_or(ErrorCode::Overflow)?;
  user_stats.last_updated = current_time;

  msg!(
    "Execute recycle proposal summary: token={}, amount={}, earned={} points ({}x multiplier) for {} SOL",
    token_mint,
    recycle_proposal.token_amount,
    points_earned as f64 / SOL_DECIMALS,
    multiplier as f64 / 1000.0,
    diff_sol as f64 / SOL_DECIMALS
  );

  msg!(
    "Vault status: total_sol_deposited={}, total_sol_withdrawn={}, total_points_supplied={}",
    vault.total_sol_deposited as f64 / SOL_DECIMALS,
    vault.total_sol_withdrawn as f64 / SOL_DECIMALS,
    vault.total_points_supplied as f64 / SOL_DECIMALS
  );

  Ok(())
}