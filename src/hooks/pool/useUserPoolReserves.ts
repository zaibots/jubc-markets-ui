import { useQueries } from '@tanstack/react-query';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const useUserPoolsReservesHumanized = <T = UserReservesDataHumanized>(
  marketsData: MarketDataType[],
  opts?: HookOpts<UserReservesDataHumanized, T>
) => {
  const { uiPoolService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);

  console.log('[useUserPoolsReservesHumanized] Hook called:', {
    user,
    marketsCount: marketsData.length,
    markets: marketsData.map((m) => m.market),
    enabled: !!user,
  });

  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.userPoolReservesDataHumanized(user, marketData),
      queryFn: async () => {
        console.log('[useUserPoolsReservesHumanized] Fetching user reserves:', {
          market: marketData.market,
          user,
        });
        try {
          const result = await uiPoolService.getUserReservesHumanized(marketData, user);
          console.log('[useUserPoolsReservesHumanized] Query SUCCESS:', {
            market: marketData.market,
            user,
            userReservesCount: result.userReserves?.length ?? 0,
            userEmodeCategoryId: result.userEmodeCategoryId,
          });
          return result;
        } catch (error) {
          console.error('[useUserPoolsReservesHumanized] Query ERROR:', {
            market: marketData.market,
            user,
            error,
          });
          throw error;
        }
      },
      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  });
};

export const useUserPoolReservesHumanized = (marketData: MarketDataType) => {
  const result = useUserPoolsReservesHumanized([marketData])[0];

  console.log('[useUserPoolReservesHumanized] Hook state:', {
    market: marketData.market,
    status: result.status,
    isPending: result.isPending,
    isError: result.isError,
    dataExists: !!result.data,
    userReservesCount: result.data?.userReserves?.length ?? 0,
    error: result.error?.message,
  });

  return result;
};
