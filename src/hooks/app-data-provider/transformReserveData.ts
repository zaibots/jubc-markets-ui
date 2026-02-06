import type { Reserve } from '@aave/graphql';
import { normalize } from '@aave/math-utils';
import { NetworkConfig } from 'src/ui-config/networksConfig';

import { FormattedReservesAndIncentives } from '../pool/usePoolFormattedReserves';

const RAY_DECIMALS = 27;

/**
 * Fallback Reserve type that matches what the UI components actually consume.
 * This is a subset of the full SDK Reserve type, containing only the fields
 * used by the Markets page and Dashboard components.
 */
export interface FallbackReserve {
  __typename: 'Reserve';
  underlyingToken: {
    __typename: 'Currency';
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  aToken: {
    __typename: 'Currency';
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  vToken: {
    __typename: 'Currency';
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  size: {
    __typename: 'TokenAmount';
    amount: {
      __typename: 'DecimalValue';
      value: string;
    };
    usd: string;
  };
  supplyInfo: {
    __typename: 'ReserveSupplyInfo';
    apy: {
      __typename: 'PercentValue';
      value: string;
    };
    total?: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
    supplyCap: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
    maxLTV: {
      __typename: 'PercentValue';
      value: string;
    };
    liquidationThreshold: {
      __typename: 'PercentValue';
      value: string;
    };
    liquidationBonus: {
      __typename: 'PercentValue';
      value: string;
    };
  };
  borrowInfo?: {
    __typename: 'ReserveBorrowInfo';
    apy: {
      __typename: 'PercentValue';
      value: string;
    };
    total: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
    borrowCap: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
    borrowingState: 'ENABLED' | 'DISABLED' | 'PAUSED';
    utilizationRate: {
      __typename: 'PercentValue';
      value: string;
    };
    reserveFactor: {
      __typename: 'PercentValue';
      value: string;
    };
    baseVariableBorrowRate: {
      __typename: 'DecimalValue';
      value: string;
      raw: string;
    };
    optimalUsageRate: {
      __typename: 'PercentValue';
      value: string;
      raw: string;
    };
    variableRateSlope1: {
      __typename: 'DecimalValue';
      value: string;
      raw: string;
    };
    variableRateSlope2: {
      __typename: 'DecimalValue';
      value: string;
      raw: string;
    };
  };
  isolationModeConfig?: {
    __typename: 'ReserveIsolationModeConfig';
    canBeCollateral: boolean;
    debtCeiling: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
    totalBorrows: {
      __typename: 'TokenAmount';
      amount: {
        __typename: 'DecimalValue';
        value: string;
      };
      usd: string;
    };
  };
  isFrozen: boolean;
  isPaused: boolean;
  acceptsNative: boolean;
  incentives: FallbackIncentive[];
  id: string;
}

export interface FallbackIncentive {
  __typename: 'AaveSupplyIncentive' | 'AaveBorrowIncentive';
  apy: {
    __typename: 'PercentValue';
    value: string;
  };
  token: {
    __typename: 'Currency';
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}

/**
 * Transforms contract-based FormattedReservesAndIncentives to SDK-compatible Reserve format.
 * Used as a fallback when the Zaibots SDK doesn't have data for custom/non-indexed markets.
 */
export function transformToReserve(
  reserve: FormattedReservesAndIncentives,
  networkConfig: NetworkConfig,
  poolAddress: string
): Reserve {
  // Debug log raw contract reserve data
  console.log('[transformToReserve] Raw contract reserve:', {
    symbol: reserve.symbol,
    name: reserve.name,
    underlyingAsset: reserve.underlyingAsset,
    decimals: reserve.decimals,
    totalLiquidity: reserve.totalLiquidity,
    totalLiquidityUSD: reserve.totalLiquidityUSD,
    totalDebt: reserve.totalDebt,
    totalDebtUSD: reserve.totalDebtUSD,
    supplyAPY: reserve.supplyAPY,
    variableBorrowAPY: reserve.variableBorrowAPY,
    borrowingEnabled: reserve.borrowingEnabled,
    isFrozen: reserve.isFrozen,
    isPaused: reserve.isPaused,
    supplyCap: reserve.supplyCap,
    borrowCap: reserve.borrowCap,
    aTokenAddress: reserve.aTokenAddress,
    variableDebtTokenAddress: reserve.variableDebtTokenAddress,
  });

  const isWrappedBaseAsset =
    reserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase();

  // Normalize BPS fields (baseLTVasCollateral, liquidationThreshold, liquidationBonus)
  // These are raw BPS on the formatted reserve object; the formatted* versions are normalized
  const normalizedLTV = reserve.formattedBaseLTVasCollateral;
  const normalizedLiqThreshold = reserve.formattedReserveLiquidationThreshold;
  const normalizedLiqBonus = reserve.formattedReserveLiquidationBonus;

  // Normalize RAY fields for rate model (1e27 precision)
  const normalizedBaseVariableBorrowRate = normalize(reserve.baseVariableBorrowRate, RAY_DECIMALS);
  const normalizedOptimalUsageRatio = normalize(reserve.optimalUsageRatio, RAY_DECIMALS);
  const normalizedVariableRateSlope1 = normalize(reserve.variableRateSlope1, RAY_DECIMALS);
  const normalizedVariableRateSlope2 = normalize(reserve.variableRateSlope2, RAY_DECIMALS);

  // Map incentives from contract format to SDK format
  const incentives = mapIncentives(reserve);

  const fallbackReserve: FallbackReserve = {
    __typename: 'Reserve',
    underlyingToken: {
      __typename: 'Currency',
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      name: reserve.name,
      decimals: reserve.decimals,
    },
    aToken: {
      __typename: 'Currency',
      address: reserve.aTokenAddress,
      symbol: `a${reserve.symbol}`,
      name: `Zaibots ${reserve.name}`,
      decimals: reserve.decimals,
    },
    vToken: {
      __typename: 'Currency',
      address: reserve.variableDebtTokenAddress,
      symbol: `variableDebt${reserve.symbol}`,
      name: `Variable Debt ${reserve.name}`,
      decimals: reserve.decimals,
    },
    size: {
      __typename: 'TokenAmount',
      amount: {
        __typename: 'DecimalValue',
        value: reserve.totalLiquidity,
      },
      usd: reserve.totalLiquidityUSD,
    },
    supplyInfo: {
      __typename: 'ReserveSupplyInfo',
      apy: {
        __typename: 'PercentValue',
        value: reserve.supplyAPY,
      },
      total: {
        __typename: 'TokenAmount',
        amount: {
          __typename: 'DecimalValue',
          value: reserve.totalLiquidity,
        },
        usd: reserve.totalLiquidityUSD,
      },
      supplyCap: {
        __typename: 'TokenAmount',
        amount: {
          __typename: 'DecimalValue',
          value: reserve.supplyCap,
        },
        usd: '0',
      },
      maxLTV: {
        __typename: 'PercentValue',
        value: normalizedLTV,
      },
      liquidationThreshold: {
        __typename: 'PercentValue',
        value: normalizedLiqThreshold,
      },
      liquidationBonus: {
        __typename: 'PercentValue',
        value: normalizedLiqBonus,
      },
    },
    borrowInfo: reserve.borrowingEnabled
      ? {
          __typename: 'ReserveBorrowInfo',
          apy: {
            __typename: 'PercentValue',
            value: reserve.variableBorrowAPY,
          },
          total: {
            __typename: 'TokenAmount',
            amount: {
              __typename: 'DecimalValue',
              value: reserve.totalDebt,
            },
            usd: reserve.totalDebtUSD,
          },
          borrowCap: {
            __typename: 'TokenAmount',
            amount: {
              __typename: 'DecimalValue',
              value: reserve.borrowCap,
            },
            usd: '0',
          },
          borrowingState: reserve.isFrozen ? 'DISABLED' : reserve.isPaused ? 'PAUSED' : 'ENABLED',
          utilizationRate: {
            __typename: 'PercentValue',
            value: reserve.borrowUsageRatio,
          },
          reserveFactor: {
            __typename: 'PercentValue',
            value: reserve.reserveFactor,
          },
          baseVariableBorrowRate: {
            __typename: 'DecimalValue',
            value: normalizedBaseVariableBorrowRate,
            raw: normalizedBaseVariableBorrowRate,
          },
          optimalUsageRate: {
            __typename: 'PercentValue',
            value: normalizedOptimalUsageRatio,
            raw: normalizedOptimalUsageRatio,
          },
          variableRateSlope1: {
            __typename: 'DecimalValue',
            value: normalizedVariableRateSlope1,
            raw: normalizedVariableRateSlope1,
          },
          variableRateSlope2: {
            __typename: 'DecimalValue',
            value: normalizedVariableRateSlope2,
            raw: normalizedVariableRateSlope2,
          },
        }
      : undefined,
    isolationModeConfig: reserve.isIsolated
      ? {
          __typename: 'ReserveIsolationModeConfig',
          canBeCollateral: reserve.usageAsCollateralEnabled,
          debtCeiling: {
            __typename: 'TokenAmount',
            amount: {
              __typename: 'DecimalValue',
              value: reserve.debtCeiling,
            },
            usd: reserve.debtCeilingUSD || '0',
          },
          totalBorrows: {
            __typename: 'TokenAmount',
            amount: {
              __typename: 'DecimalValue',
              value: reserve.isolationModeTotalDebt || '0',
            },
            usd: reserve.isolationModeTotalDebtUSD || '0',
          },
        }
      : undefined,
    isFrozen: reserve.isFrozen,
    isPaused: reserve.isPaused,
    acceptsNative: isWrappedBaseAsset,
    incentives,
    id: `${poolAddress}-${reserve.underlyingAsset}`.toLowerCase(),
  };

  // Cast to Reserve - the UI only uses the fields we've populated
  return fallbackReserve as unknown as Reserve;
}

/**
 * Maps contract incentives data to SDK incentives format
 */
function mapIncentives(reserve: FormattedReservesAndIncentives): FallbackIncentive[] {
  const incentives: FallbackIncentive[] = [];

  // Map supply (aToken) incentives
  if (reserve.aIncentivesData && reserve.aIncentivesData.length > 0) {
    reserve.aIncentivesData.forEach((incentive) => {
      incentives.push({
        __typename: 'AaveSupplyIncentive',
        apy: {
          __typename: 'PercentValue',
          value: incentive.incentiveAPR,
        },
        token: {
          __typename: 'Currency',
          address: incentive.rewardTokenAddress,
          symbol: incentive.rewardTokenSymbol,
          name: incentive.rewardTokenSymbol,
          decimals: 18, // Default to 18 decimals for reward tokens
        },
      });
    });
  }

  // Map borrow (vToken) incentives
  if (reserve.vIncentivesData && reserve.vIncentivesData.length > 0) {
    reserve.vIncentivesData.forEach((incentive) => {
      incentives.push({
        __typename: 'AaveBorrowIncentive',
        apy: {
          __typename: 'PercentValue',
          value: incentive.incentiveAPR,
        },
        token: {
          __typename: 'Currency',
          address: incentive.rewardTokenAddress,
          symbol: incentive.rewardTokenSymbol,
          name: incentive.rewardTokenSymbol,
          decimals: 18, // Default to 18 decimals for reward tokens
        },
      });
    });
  }

  return incentives;
}

/**
 * Computes aggregate market metrics from reserve data
 */
export function computeAggregateMetrics(reserves: FormattedReservesAndIncentives[]): {
  totalMarketSize: number;
  totalAvailableLiquidity: number;
  totalBorrows: number;
} {
  console.log('[computeAggregateMetrics] Processing', reserves.length, 'reserves');

  let totalMarketSize = 0;
  let totalBorrows = 0;

  reserves.forEach((reserve) => {
    const liquidity = parseFloat(reserve.totalLiquidityUSD) || 0;
    const debt = parseFloat(reserve.totalDebtUSD) || 0;

    console.log(
      `[computeAggregateMetrics] ${reserve.symbol}: liquidity=$${liquidity}, debt=$${debt}`
    );

    totalMarketSize += liquidity;
    totalBorrows += debt;
  });

  const result = {
    totalMarketSize,
    totalAvailableLiquidity: totalMarketSize - totalBorrows,
    totalBorrows,
  };

  console.log('[computeAggregateMetrics] Final metrics:', result);

  return result;
}

/**
 * Creates a fallback Market object when SDK data is unavailable
 */
export function createFallbackMarket(
  reserves: FormattedReservesAndIncentives[],
  poolAddress: string,
  networkConfig: NetworkConfig
): {
  address: string;
  totalMarketSize: number;
  totalAvailableLiquidity: number;
  supplyReserves: Reserve[];
  borrowReserves: Reserve[];
} {
  const metrics = computeAggregateMetrics(reserves);

  const transformedReserves = reserves.map((r) =>
    transformToReserve(r, networkConfig, poolAddress)
  );

  // Supply reserves = all reserves
  const supplyReserves = transformedReserves;

  // Borrow reserves = reserves where borrowing is enabled and not frozen
  const borrowReserves = transformedReserves.filter(
    (r) => r.borrowInfo && r.borrowInfo.borrowingState === 'ENABLED'
  );

  return {
    address: poolAddress,
    totalMarketSize: metrics.totalMarketSize,
    totalAvailableLiquidity: metrics.totalAvailableLiquidity,
    supplyReserves,
    borrowReserves,
  };
}
