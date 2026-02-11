/**
 * Contract constants and helpers. Category matches SocialLedger.Category enum.
 */
export const Category = {
  TIMELINE: 0,
  NEWS: 1,
  DECISION: 2,
};

/** Post entry fee in wei (default from StakingGame) */
export const POST_ENTRY_FEE_WEI = BigInt("1000000000000000"); // 0.001 ether

/** Min stake per vote in wei */
export const MIN_STAKE_WEI = BigInt("100000000000000"); // 0.0001 ether
