use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Admin {
  pub authority: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
  pub total_sol_deposited: u64,
  pub total_sol_withdrawn: u64,
  pub total_points_supplied: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Label {
  pub mint: Pubkey,
  #[max_len(50)]
  pub name: String, // shinyTrash, shinyTrash*, ..
  pub multiplier: u64, // 1000 = 1x multiplier
}

#[account]
#[derive(InitSpace)]
pub struct UserStats {
  pub user: Pubkey,
  pub recycle_count: u64,
  pub total_sol_received: u64,
  pub total_points_earned: u64,
  pub last_updated: i64,
}

#[account]
#[derive(InitSpace)]
pub struct RecycleProposal {
  pub user: Pubkey,
  pub token_mint: Pubkey,
  pub token_amount: u64,
  pub initial_sol: u64,
  pub created_at: i64,
  pub is_executed: bool,
  pub sol_received: u64,
  pub points_earned: u64,
  pub executed_at: i64,
}
