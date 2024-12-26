use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid Jupiter program")]
    InvalidJupiterProgram,
    #[msg("Swap failed")]
    SwapFailed,
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    #[msg("Incorrect owner")]
    IncorrectOwner,
    #[msg("Invalid token amount")]
    InvalidTokenAmount,
    #[msg("Already executed")]
    AlreadyExecuted
}