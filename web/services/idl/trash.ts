/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trash.json`.
 */
export type Trash = {
  "address": "8PGdyZc62MvKfWF8gQETB8cUQhFBL9BLMGuoS4sFZLJp",
  "metadata": {
    "name": "trash",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createRecycleProposal",
      "discriminator": [
        7,
        218,
        24,
        95,
        33,
        44,
        135,
        203
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "recycleProposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  82,
                  69,
                  67,
                  89,
                  67,
                  76,
                  69,
                  95,
                  80,
                  82,
                  79,
                  80,
                  79,
                  83,
                  65,
                  76
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "executeRecycleProposal",
      "discriminator": [
        153,
        9,
        201,
        75,
        194,
        228,
        18,
        36
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  84,
                  65,
                  84,
                  83
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "recycleProposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  82,
                  69,
                  67,
                  89,
                  67,
                  76,
                  69,
                  95,
                  80,
                  82,
                  79,
                  80,
                  79,
                  83,
                  65,
                  76
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "label",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  65,
                  66,
                  69,
                  76
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initUserStats",
      "discriminator": [
        177,
        113,
        20,
        232,
        181,
        87,
        120,
        62
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  84,
                  65,
                  84,
                  83
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  65,
                  68,
                  77,
                  73,
                  78
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateAdmin",
      "discriminator": [
        161,
        176,
        40,
        213,
        60,
        184,
        179,
        228
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  65,
                  68,
                  77,
                  73,
                  78
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateLabel",
      "discriminator": [
        168,
        82,
        56,
        179,
        161,
        246,
        98,
        2
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "admin",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  65,
                  68,
                  77,
                  73,
                  78
                ]
              }
            ]
          }
        },
        {
          "name": "label",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  65,
                  66,
                  69,
                  76
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "multiplier",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSolFromVault",
      "discriminator": [
        125,
        47,
        97,
        57,
        61,
        245,
        60,
        158
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  65,
                  68,
                  77,
                  73,
                  78
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "admin",
      "discriminator": [
        244,
        158,
        220,
        65,
        8,
        73,
        4,
        65
      ]
    },
    {
      "name": "label",
      "discriminator": [
        81,
        55,
        13,
        178,
        66,
        159,
        10,
        78
      ]
    },
    {
      "name": "recycleProposal",
      "discriminator": [
        121,
        236,
        45,
        55,
        17,
        60,
        41,
        58
      ]
    },
    {
      "name": "userStats",
      "discriminator": [
        176,
        223,
        136,
        27,
        122,
        79,
        32,
        227
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6001,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6002,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6004,
      "name": "invalidJupiterProgram",
      "msg": "Invalid Jupiter program"
    },
    {
      "code": 6005,
      "name": "swapFailed",
      "msg": "Swap failed"
    },
    {
      "code": 6006,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6007,
      "name": "incorrectOwner",
      "msg": "Incorrect owner"
    },
    {
      "code": 6008,
      "name": "invalidTokenAmount",
      "msg": "Invalid token amount"
    },
    {
      "code": 6009,
      "name": "alreadyExecuted",
      "msg": "Already executed"
    }
  ],
  "types": [
    {
      "name": "admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "label",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "recycleProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "initialSol",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "isExecuted",
            "type": "bool"
          },
          {
            "name": "solReceived",
            "type": "u64"
          },
          {
            "name": "pointsEarned",
            "type": "u64"
          },
          {
            "name": "executedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "recycleCount",
            "type": "u64"
          },
          {
            "name": "totalSolReceived",
            "type": "u64"
          },
          {
            "name": "totalPointsEarned",
            "type": "u64"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalSolDeposited",
            "type": "u64"
          },
          {
            "name": "totalSolWithdrawn",
            "type": "u64"
          },
          {
            "name": "totalPointsSupplied",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
