use anchor_lang::prelude::*;

use crate::{UserStats, ANCHOR_DISCRIMINATOR, USER_STATS_SEED};

#[derive(Accounts)]
pub struct InitUserStats<'info> {
  #[account(mut)]
  pub user: Signer<'info>,

  #[account(
    init,
    payer = user,
    space = ANCHOR_DISCRIMINATOR + UserStats::INIT_SPACE,
    seeds = [USER_STATS_SEED, user.key().as_ref()],
    bump,
  )]
  pub user_stats: Account<'info, UserStats>,

  pub system_program: Program<'info, System>,
}

pub fn process_init_user_stats(
  ctx: Context<InitUserStats>,
) -> Result<()> {
  let user_stats = &mut ctx.accounts.user_stats;

  user_stats.user = ctx.accounts.user.key();
  user_stats.recycle_count = 0;
  user_stats.total_sol_received = 0;
  user_stats.total_points_earned = 0;
  user_stats.last_updated = Clock::get()?.unix_timestamp;

  msg!("User stats summary: user={}", ctx.accounts.user.key());

  Ok(())
}