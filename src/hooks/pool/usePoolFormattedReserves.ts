import {
  EmodeDataHumanized,
  ReserveDataHumanized,
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
} from '@aave/contract-helpers';
import { formatReservesAndIncentives } from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { reserveSortFn } from 'src/store/poolSelectors';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { fetchIconSymbolAndName, IconMapInterface } from 'src/ui-config/reservePatches';
import { getNetworkConfig, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { selectBaseCurrencyData, selectReserves } from './selectors';
import { usePoolsEModes } from './usePoolEModes';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type FormattedReservesAndIncentives = ReturnType<
  typeof formatReservesAndIncentives
>[number] &
  IconMapInterface & {
    isWrappedBaseAsset: boolean;
  } & ReserveDataHumanized;

const formatReserves = memoize(
  (
    reservesData: ReservesDataHumanized,
    incentivesData: ReservesIncentiveDataHumanized[],
    poolsEModesData: EmodeDataHumanized[],
    networkConfig: NetworkConfig
  ) => {
    const reserves = selectReserves(reservesData);
    const baseCurrencyData = selectBaseCurrencyData(reservesData);
    return formatReservesAndIncentives({
      reserves,
      currentTimestamp: dayjs().unix(),
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives: incentivesData,
      eModes: poolsEModesData,
    })
      .map((r) => ({
        ...r,
        ...fetchIconSymbolAndName(r),
        isWrappedBaseAsset:
          r.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
      }))
      .sort(reserveSortFn);
  }
);

export const usePoolsFormattedReserves = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<FormattedReservesAndIncentives[]>[] => {
  const poolsReservesQueries = usePoolsReservesHumanized(marketsData);
  const poolsReservesIncentivesQueries = usePoolsReservesIncentivesHumanized(marketsData);
  const poolsEModesQueries = usePoolsEModes(marketsData);

  // Debug: Log query states
  console.log('[usePoolsFormattedReserves] Query states:', {
    markets: marketsData.map((m) => m.market),
    reservesQueries: poolsReservesQueries.map((q, i) => ({
      market: marketsData[i].market,
      status: q.status,
      dataExists: !!q.data,
      reservesCount: q.data?.reservesData?.length ?? 0,
    })),
    incentivesQueries: poolsReservesIncentivesQueries.map((q, i) => ({
      market: marketsData[i].market,
      status: q.status,
      dataExists: !!q.data,
    })),
    eModesQueries: poolsEModesQueries.map((q, i) => ({
      market: marketsData[i].market,
      status: q.status,
      dataExists: !!q.data,
    })),
  });

  return poolsReservesQueries.map((poolReservesQuery, index) => {
    const marketData = marketsData[index];
    const poolReservesIncentivesQuery = poolsReservesIncentivesQueries[index];
    const poolEModesQuery = poolsEModesQueries[index];
    const networkConfig = getNetworkConfig(marketData.chainId);
    const selector = (
      reservesData: ReservesDataHumanized,
      incentivesData: ReservesIncentiveDataHumanized[],
      poolsEModesData: EmodeDataHumanized[]
    ) => {
      const formatted = formatReserves(
        reservesData,
        incentivesData,
        poolsEModesData,
        networkConfig
      );
      console.log('[usePoolsFormattedReserves] Formatted reserves:', {
        market: marketData.market,
        formattedCount: formatted.length,
        reserves: formatted.map((r) => ({
          symbol: r.symbol,
          name: r.name,
          underlyingAsset: r.underlyingAsset,
          isActive: r.isActive,
          isFrozen: r.isFrozen,
          supplyCap: r.supplyCap,
          borrowCap: r.borrowCap,
          totalLiquidity: r.totalLiquidity,
          availableLiquidity: r.availableLiquidity,
        })),
      });
      return formatted;
    };
    return combineQueries(
      [poolReservesQuery, poolReservesIncentivesQuery, poolEModesQuery] as const,
      selector
    );
  });
};

export const usePoolFormattedReserves = (marketData: MarketDataType) => {
  const result = usePoolsFormattedReserves([marketData])[0];

  // Debug: Log the formatted reserves state
  console.log('[usePoolFormattedReserves] Hook state:', {
    market: marketData.market,
    isPending: result.isPending,
    hasError: !!result.error,
    error: result.error,
    dataExists: !!result.data,
    reservesCount: result.data?.length ?? 0,
    reserveSymbols: result.data?.map((r) => r.symbol),
  });

  return result;
};
