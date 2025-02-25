export enum RecycleErrorCode {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  INVALID_QUOTE = 'INVALID_QUOTE',
  INVALID_SWAP = 'INVALID_SWAP',
  TOKEN_NOT_TRADABLE = 'TOKEN_NOT_TRADABLE',
  UNKNOWN = 'UNKNOWN'
}

export class RecycleError extends Error {
  constructor(
    public code: RecycleErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'RecycleError';
  }
} 