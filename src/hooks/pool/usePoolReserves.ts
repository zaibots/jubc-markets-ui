import { ReservesDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsReservesHumanized = <T = ReservesDataHumanized>(
  marketsData: MarketDataType[],
  opts?: HookOpts<ReservesDataHumanized, T>
) => {
  const { uiPoolService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolReservesDataHumanized(marketData),
          queryFn: async () => {
            console.log('[usePoolReserves] Fetching reserves for market:', {
              market: marketData.market,
              uiPoolDataProvider: marketData.addresses.UI_POOL_DATA_PROVIDER,
              lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
            });
            try {
              const result = await uiPoolService.getReservesHumanized(marketData);
              console.log('[usePoolReserves] Query SUCCESS:', {
                market: marketData.market,
                reservesCount: result.reservesData?.length ?? 0,
                reserveSymbols: result.reservesData?.map((r) => r.symbol),
                baseCurrencyData: result.baseCurrencyData,
              });
              return result;
            } catch (error) {
              console.error('[usePoolReserves] Query ERROR:', {
                market: marketData.market,
                error,
              });
              throw error;
            }
          },
          refetchInterval: POLLING_INTERVAL,
          meta: {},
          ...opts,
        } as UseQueryOptions<ReservesDataHumanized, Error, T>)
    ),
  });
};

export const usePoolReservesHumanized = (marketData: MarketDataType) => {
  const result = usePoolsReservesHumanized([marketData])[0];

  // Debug: Log the hook result state
  console.log('[usePoolReservesHumanized] Hook state:', {
    market: marketData.market,
    status: result.status,
    isPending: result.isPending,
    isError: result.isError,
    isSuccess: result.isSuccess,
    dataExists: !!result.data,
    reservesCount: result.data?.reservesData?.length ?? 0,
    error: result.error?.message,
  });

  return result;
};
