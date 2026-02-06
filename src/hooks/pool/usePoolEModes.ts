import { EmodeDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsEModes = <T = EmodeDataHumanized[]>(
  marketsData: MarketDataType[],
  opts?: HookOpts<EmodeDataHumanized[], T>
) => {
  const { uiPoolService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolEModes(marketData),
          queryFn: async () => {
            console.log('[usePoolsEModes] Fetching eModes for market:', marketData.market);
            try {
              const result = await uiPoolService.getEModesHumanized(marketData);
              console.log('[usePoolsEModes] Query SUCCESS:', {
                market: marketData.market,
                eModesCount: result.length,
                eModes: result,
              });
              return result;
            } catch (error) {
              console.error('[usePoolsEModes] Query ERROR:', {
                market: marketData.market,
                error,
              });
              throw error;
            }
          },
          refetchInterval: POLLING_INTERVAL,
          meta: {},
          ...opts,
        } as UseQueryOptions<EmodeDataHumanized[], Error, T>)
    ),
  });
};

export const usePoolEModes = (marketData: MarketDataType) => {
  const result = usePoolsEModes([marketData])[0];

  console.log('[usePoolEModes] Hook state:', {
    market: marketData.market,
    status: result.status,
    isPending: result.isPending,
    isError: result.isError,
    dataExists: !!result.data,
    eModesCount: result.data?.length ?? 0,
    error: result.error?.message,
  });

  return result;
};
