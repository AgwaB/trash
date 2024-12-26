import { AddressLookupTableAccount, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { JUPITER_BASE_URL } from "../config";
import { URLSearchParams } from "url";
import { web3 } from "@coral-xyz/anchor";

export const getQuote = async (
  user: PublicKey,
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: number
) => {
  const response = await fetch(
    `${JUPITER_BASE_URL}/quote?` +
    new URLSearchParams({
      inputMint: inputMint.toBase58(),
      outputMint: outputMint.toBase58(),
      amount: amount.toString(),
      slippageBps: "100",
      // onlyDirectRoutes: "true",     // 직접적인 route만 사용
      asLegacyTransaction: "true",  // 더 간단한 legacy transaction format 사용
      maxAccounts: "64",
    })
  )
  return await response.json();
};

export const getSwapIx = async (
  user: PublicKey,
  quote: any
) => {
  const data = {
    quoteResponse: quote,
    userPublicKey: user.toBase58(),
    wrapAndUnwrapSol: true,
    computeUnitPriceMicroLamports: "auto",
    asLegacyTransaction: true,
    dynamicComputeUnitLimit: false,
    computeUnitLimit: 1400000,  // 명시적 CU 제한
    computeUnitPrice: 1000,     // 고정 CU 가격
    // prioritizationFeeLamports: {
    //   priorityLevelWithMaxLamports: {
    //     maxLamports: 2000000,
    //     global: true,
    //     priorityLevel: "veryHigh"
    //   }
    // },
  };
  return fetch(`${JUPITER_BASE_URL}/swap-instructions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
};

export const getAdressLookupTableAccounts = async (
  connection: web3.Connection,
  keys: string[]
): Promise<AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(
      keys.map((key) => new PublicKey(key))
    );

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array<AddressLookupTableAccount>());
};

export const instructionDataToTransactionInstruction = (
  instructionPayload: any
) => {
  if (instructionPayload === null) {
    return null;
  }

  return new TransactionInstruction({
    programId: new PublicKey(instructionPayload.programId),
    keys: instructionPayload.accounts.map((key: any) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instructionPayload.data, "base64"),
  });
};