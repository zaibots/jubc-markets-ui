import { ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsReservesIncentivesHumanized = <T = ReservesIncentiveDataHumanized[]>(
  marketsData: MarketDataType[],
  opts?: HookOpts<ReservesIncentiveDataHumanized[], T>
) => {
  const { uiIncentivesService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolReservesIncentiveDataHumanized(marketData),
          queryFn: async () => {
            console.log('[usePoolsReservesIncentivesHumanized] Fetching incentives:', {
              market: marketData.market,
              incentivesEnabled: marketData.enabledFeatures?.incentives,
            });
            try {
              const result = await uiIncentivesService.getReservesIncentivesDataHumanized(
                marketData
              );
              console.log('[usePoolsReservesIncentivesHumanized] Query SUCCESS:', {
                market: marketData.market,
                incentivesCount: result.length,
              });
              return result;
            } catch (error) {
              console.error('[usePoolsReservesIncentivesHumanized] Query ERROR:', {
                market: marketData.market,
                error,
              });
              throw error;
            }
          },
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<ReservesIncentiveDataHumanized[], Error>)
    ),
  });
};

export const usePoolReservesIncentivesHumanized = (marketData: MarketDataType) => {
  const result = usePoolsReservesIncentivesHumanized([marketData])[0];

  console.log('[usePoolReservesIncentivesHumanized] Hook state:', {
    market: marketData.market,
    status: result.status,
    isPending: result.isPending,
    isError: result.isError,
    dataExists: !!result.data,
    incentivesCount: result.data?.length ?? 0,
    error: result.error?.message,
  });

  return result;
};
