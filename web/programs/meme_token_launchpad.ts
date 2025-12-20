/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/meme_token_launchpad.json`.
 */
export type MemeTokenLaunchpad = {
  "address": "5kFcUdsEqDFEnSoLK9JxLhdEuGfNmyu517FkrpBwDMen",
  "metadata": {
    "name": "memeTokenLaunchpad",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyToken",
      "discriminator": [
        138,
        127,
        14,
        91,
        38,
        87,
        115,
        105
      ],
      "accounts": [
        {
          "name": "programState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "We validate this in the handler by comparing `mint.key().to_bytes()` == `token_info.mint.to_bytes()`",
            "and by using it in the token_2022 CPI."
          ],
          "writable": true
        },
        {
          "name": "buyerTokenAccount",
          "docs": [
            "- This account is unchecked by Anchor at compile-time.",
            "- We **validate at runtime** in `buy_token()`:",
            "1. derive expected ATA via `get_associated_token_address(&buyer.key(), &token_info.mint)` and compare addresses,",
            "2. if missing, create the ATA via CPI to `associated_token::create(...)`,",
            "3. check `owner == spl_token_2022::ID`,",
            "4. unpack via `spl_token_2022::state::Account::unpack(...)` and verify `mint == token_info.mint` and `owner == buyer`."
          ],
          "writable": true
        },
        {
          "name": "tokenCreator",
          "docs": [
            "Verified at runtime / via constraint with token_info.creator."
          ],
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Rent required when creating the associated token account via CPI."
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "u64"
        },
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createToken",
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true
        },
        {
          "name": "tokenInfo",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "The new Mint (SPL Token-2022 compatible)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token-2022 program"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        },
        {
          "name": "initialSupply",
          "type": "u64"
        }
      ]
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
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "launchToDex",
      "discriminator": [
        195,
        102,
        177,
        151,
        21,
        235,
        134,
        205
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "transaction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "launcher"
              },
              {
                "kind": "arg",
                "path": "tokenId"
              },
              {
                "kind": "arg",
                "path": "nextTxId"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenCreator",
          "writable": true
        },
        {
          "name": "launcher",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "u64"
        },
        {
          "name": "liquidityAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellToken",
      "discriminator": [
        109,
        61,
        40,
        187,
        230,
        176,
        135,
        174
      ],
      "accounts": [
        {
          "name": "programState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenCreator",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "u64"
        },
        {
          "name": "tokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePlatformSettings",
      "discriminator": [
        213,
        238,
        2,
        39,
        128,
        157,
        3,
        95
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newFeeRate",
          "type": "u64"
        },
        {
          "name": "newLaunchThreshold",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "programState",
      "discriminator": [
        77,
        209,
        137,
        229,
        149,
        67,
        167,
        230
      ]
    },
    {
      "name": "tokenInfo",
      "discriminator": [
        109,
        162,
        52,
        125,
        77,
        166,
        37,
        202
      ]
    },
    {
      "name": "transaction",
      "discriminator": [
        11,
        24,
        174,
        129,
        203,
        117,
        242,
        23
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "Program already initialized"
    },
    {
      "code": 6001,
      "name": "tokenNameTooLong",
      "msg": "Token name too long"
    },
    {
      "code": 6002,
      "name": "tokenSymbolTooLong",
      "msg": "Token symbol too long"
    },
    {
      "code": 6003,
      "name": "tokenUriTooLong",
      "msg": "Token URI too long"
    },
    {
      "code": 6004,
      "name": "invalidDecimals",
      "msg": "Invalid decimals value"
    },
    {
      "code": 6005,
      "name": "invalidInitialSupply",
      "msg": "Invalid initial supply"
    },
    {
      "code": 6006,
      "name": "tokenNotFound",
      "msg": "Token not found"
    },
    {
      "code": 6007,
      "name": "tokenAlreadyLaunched",
      "msg": "Token already launched to DEX"
    },
    {
      "code": 6008,
      "name": "invalidPurchaseAmount",
      "msg": "Invalid purchase amount"
    },
    {
      "code": 6009,
      "name": "purchaseAmountTooSmall",
      "msg": "Purchase amount too small"
    },
    {
      "code": 6010,
      "name": "purchaseAmountTooLarge",
      "msg": "Purchase amount too large"
    },
    {
      "code": 6011,
      "name": "insufficientSolBalance",
      "msg": "Insufficient SOL balance"
    },
    {
      "code": 6012,
      "name": "insufficientTokenBalance",
      "msg": "Insufficient token balance"
    },
    {
      "code": 6013,
      "name": "bondingCurveError",
      "msg": "Bonding curve calculation error"
    },
    {
      "code": 6014,
      "name": "launchThresholdNotMet",
      "msg": "Launch threshold not met"
    },
    {
      "code": 6015,
      "name": "launchCooldownActive",
      "msg": "Launch cooldown period not elapsed"
    },
    {
      "code": 6016,
      "name": "unauthorized",
      "msg": "Unauthorized operation"
    },
    {
      "code": 6017,
      "name": "invalidFeeRate",
      "msg": "Invalid fee rate"
    },
    {
      "code": 6018,
      "name": "invalidLaunchThreshold",
      "msg": "Invalid launch threshold"
    },
    {
      "code": 6019,
      "name": "tradingNotActive",
      "msg": "Trading not active"
    },
    {
      "code": 6020,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded"
    },
    {
      "code": 6021,
      "name": "tokenCreationFailed",
      "msg": "Token creation failed"
    },
    {
      "code": 6022,
      "name": "mintAuthorityTransferFailed",
      "msg": "Mint authority transfer failed"
    },
    {
      "code": 6023,
      "name": "tokenAccountCreationFailed",
      "msg": "Token account creation failed"
    },
    {
      "code": 6024,
      "name": "invalidTokenProgram",
      "msg": "Invalid token program"
    },
    {
      "code": 6025,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6026,
      "name": "arithmeticUnderflow",
      "msg": "Arithmetic underflow"
    },
    {
      "code": 6027,
      "name": "divisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6028,
      "name": "invalidAccount",
      "msg": "Invalid account"
    },
    {
      "code": 6029,
      "name": "accountNotMutable",
      "msg": "Account not mutable"
    },
    {
      "code": 6030,
      "name": "invalidSigner",
      "msg": "Invalid signer"
    },
    {
      "code": 6031,
      "name": "tokenMetadataUpdateFailed",
      "msg": "Token metadata update failed"
    },
    {
      "code": 6032,
      "name": "insufficientReserves",
      "msg": "Insufficient reserves"
    },
    {
      "code": 6033,
      "name": "bondingCurveInactive",
      "msg": "Bonding curve inactive"
    },
    {
      "code": 6034,
      "name": "invalidTransactionId",
      "msg": "Invalid transaction ID"
    },
    {
      "code": 6035,
      "name": "invalidCreator",
      "msg": "Invalid creator"
    },
    {
      "code": 6036,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    }
  ],
  "types": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenId",
            "docs": [
              "Associated token ID"
            ],
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "docs": [
              "Virtual SOL reserves for bonding curve calculation"
            ],
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "docs": [
              "Virtual token reserves for bonding curve calculation"
            ],
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "docs": [
              "Real SOL reserves (actual SOL held)"
            ],
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "docs": [
              "Real token reserves (actual tokens held)"
            ],
            "type": "u64"
          },
          {
            "name": "totalSolVolume",
            "docs": [
              "Total SOL volume traded"
            ],
            "type": "u64"
          },
          {
            "name": "totalTokenVolume",
            "docs": [
              "Total token volume traded"
            ],
            "type": "u64"
          },
          {
            "name": "currentPrice",
            "docs": [
              "Current token price in lamports per token"
            ],
            "type": "u64"
          },
          {
            "name": "marketCap",
            "docs": [
              "Market cap in lamports"
            ],
            "type": "u64"
          },
          {
            "name": "active",
            "docs": [
              "Whether the curve is active"
            ],
            "type": "bool"
          },
          {
            "name": "lastUpdated",
            "docs": [
              "Last update timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "docs": [
              "Whether the program has been initialized"
            ],
            "type": "bool"
          },
          {
            "name": "tokenCount",
            "docs": [
              "Total number of tokens created"
            ],
            "type": "u64"
          },
          {
            "name": "platformFeeRate",
            "docs": [
              "Platform fee rate in basis points (250 = 2.5%)"
            ],
            "type": "u64"
          },
          {
            "name": "launchThreshold",
            "docs": [
              "Threshold amount to launch token to DEX (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "platformAuthority",
            "docs": [
              "Platform authority address"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformTreasury",
            "docs": [
              "Platform treasury address for collecting fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalFeesCollected",
            "docs": [
              "Total platform fees collected"
            ],
            "type": "u64"
          },
          {
            "name": "isPaused",
            "docs": [
              "Emergency pause flag"
            ],
            "type": "bool"
          },
          {
            "name": "initializedAt",
            "docs": [
              "Timestamp when the program was initialized"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenId",
            "docs": [
              "Unique token ID"
            ],
            "type": "u64"
          },
          {
            "name": "mint",
            "docs": [
              "Token mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "creator",
            "docs": [
              "Token creator address"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Token name"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Token symbol"
            ],
            "type": "string"
          },
          {
            "name": "uri",
            "docs": [
              "Token metadata URI"
            ],
            "type": "string"
          },
          {
            "name": "decimals",
            "docs": [
              "Token decimals"
            ],
            "type": "u8"
          },
          {
            "name": "totalSupply",
            "docs": [
              "Total supply of the token"
            ],
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "docs": [
              "Current circulating supply"
            ],
            "type": "u64"
          },
          {
            "name": "launchedToDex",
            "docs": [
              "Whether token has been launched to DEX"
            ],
            "type": "bool"
          },
          {
            "name": "launchedAt",
            "docs": [
              "Launch timestamp"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "totalSolRaised",
            "docs": [
              "Total SOL raised"
            ],
            "type": "u64"
          },
          {
            "name": "holderCount",
            "docs": [
              "Number of unique holders"
            ],
            "type": "u64"
          },
          {
            "name": "transactionCount",
            "docs": [
              "Number of transactions"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Token creation timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "tradingActive",
            "docs": [
              "Whether trading is active"
            ],
            "type": "bool"
          },
          {
            "name": "creatorFeesCollected",
            "docs": [
              "Creator fees collected"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transactionId",
            "docs": [
              "Transaction ID"
            ],
            "type": "u64"
          },
          {
            "name": "tokenId",
            "docs": [
              "Associated token ID"
            ],
            "type": "u64"
          },
          {
            "name": "user",
            "docs": [
              "User who initiated the transaction"
            ],
            "type": "pubkey"
          },
          {
            "name": "transactionType",
            "docs": [
              "Transaction type"
            ],
            "type": {
              "defined": {
                "name": "transactionType"
              }
            }
          },
          {
            "name": "solAmount",
            "docs": [
              "SOL amount involved"
            ],
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "docs": [
              "Token amount involved"
            ],
            "type": "u64"
          },
          {
            "name": "price",
            "docs": [
              "Price at the time of transaction"
            ],
            "type": "u64"
          },
          {
            "name": "platformFee",
            "docs": [
              "Platform fee charged"
            ],
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "docs": [
              "Creator fee charged (if applicable)"
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Transaction timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "signature",
            "docs": [
              "Transaction signature"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "transactionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "buy"
          },
          {
            "name": "sell"
          },
          {
            "name": "launch"
          }
        ]
      }
    }
  ]
};
