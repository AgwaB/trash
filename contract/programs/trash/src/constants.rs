use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";
pub const ADMIN_SEED: &[u8] = b"ADMIN";
pub const VAULT_SEED: &[u8] = b"VAULT";
pub const LABEL_SEED: &[u8] = b"LABEL";
pub const USER_STATS_SEED: &[u8] = b"USER_STATS";
pub const AUTHORITY_SEED: &[u8] = b"AUTHORITY";
pub const RECYCLE_PROPOSAL_SEED: &[u8] = b"RECYCLE_PROPOSAL";
pub const USER_WSOL_SEED: &[u8] = b"USER_WSOL";
pub const ANCHOR_DISCRIMINATOR: usize = 8;
pub const SOL_DECIMALS: f64 = 1_000_000_000.0;