import type { EmodeMarketCategory, Market, MarketUserState, Reserve } from '@aave/graphql';
import { UserReserveData } from '@aave/math-utils';
import { client } from 'pages/_app.page';
import React, { PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { formatEmodes } from '../../store/poolSelectors';
import {
  ExtendedFormattedUser as _ExtendedFormattedUser,
  useExtendedUserSummaryAndIncentives,
} from '../pool/useExtendedUserSummaryAndIncentives';
import {
  FormattedReservesAndIncentives,
  usePoolFormattedReserves,
} from '../pool/usePoolFormattedReserves';
import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
import { FormattedUserReserves } from '../pool/useUserSummaryAndIncentives';
import { computeAggregateMetrics, createFallbackMarket } from './transformReserveData';
import { useMarketsData } from './useMarketsData';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

/**
 * @deprecated Use FormattedReservesAndIncentives type from usePoolFormattedReserves hook
 */
export type ComputedReserveData = FormattedReservesAndIncentives;

/**
 * @deprecated Use FormattedUserReserves type from useUserSummaryAndIncentives hook
 */
export type ComputedUserReserveData = FormattedUserReserves;

/**
 * @deprecated Use ExtendedFormattedUser type from useExtendedUserSummaryAndIncentives hook
 */
export type ExtendedFormattedUser = _ExtendedFormattedUser;
export type ReserveWithId = Reserve & { id: string };
export interface AppDataContextType {
  loading: boolean;
  /** SDK market snapshot */
  market?: Market;
  totalBorrows?: number;
  supplyReserves: ReserveWithId[];
  borrowReserves: ReserveWithId[];
  eModeCategories: EmodeMarketCategory[];
  userState?: MarketUserState;
  /** Legacy fields (deprecated) kept temporarily for incremental migration */
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  user?: ExtendedFormattedUser;
  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
}

const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { currentAccount } = useWeb3Context();

  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const networkConfig = getNetworkConfig(currentMarketData.chainId);

  // Debug: Log current market data
  console.log('[AppDataProvider] Current market data:', {
    market: currentMarketData.market,
    marketTitle: currentMarketData.marketTitle,
    chainId: currentMarketData.chainId,
    v3: currentMarketData.v3,
    addresses: {
      UI_POOL_DATA_PROVIDER: currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
      LENDING_POOL_ADDRESS_PROVIDER: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
    },
    currentAccount,
  });

  const { data, isPending } = useMarketsData({
    client,
    marketData: currentMarketData,
    account: currentAccount,
  });

  const marketAddress = currentMarketData.addresses.LENDING_POOL.toLowerCase();

  const sdkMarket = data?.find((item) => item.address.toLowerCase() === marketAddress);

  // Contract-based data (always fetched as fallback)
  const { data: reservesData, isPending: reservesDataLoading } =
    usePoolReservesHumanized(currentMarketData);
  const { data: formattedPoolReserves, isPending: formattedPoolReservesLoading } =
    usePoolFormattedReserves(currentMarketData);
  const baseCurrencyData = reservesData?.baseCurrencyData;

  // Determine if we should use fallback (contract data) instead of SDK data
  // Fallback is used when SDK doesn't return data for this market (custom/non-indexed markets)
  const useContractDataFallback = !sdkMarket && !isPending && formattedPoolReserves;

  // Debug logging for contract data flow
  useEffect(() => {
    console.group('[AppDataProvider] Data Sources Debug');
    console.log('Market Address:', marketAddress);
    console.log('SDK isPending:', isPending);
    console.log('SDK data (all markets):', data);
    console.log('SDK market (matched):', sdkMarket);
    console.log('Contract reservesData:', reservesData);
    console.log('Contract formattedPoolReserves:', formattedPoolReserves);
    console.log('Using fallback mode:', useContractDataFallback);
    console.groupEnd();
  }, [
    marketAddress,
    isPending,
    data,
    sdkMarket,
    reservesData,
    formattedPoolReserves,
    useContractDataFallback,
  ]);

  // Create fallback market data from contract calls when SDK data is unavailable
  const fallbackMarketData = useMemo(() => {
    if (!useContractDataFallback || !formattedPoolReserves) {
      return null;
    }
    const fallback = createFallbackMarket(formattedPoolReserves, marketAddress, networkConfig);
    console.group('[AppDataProvider] Fallback Market Created');
    console.log('Total Market Size:', fallback.totalMarketSize);
    console.log('Total Available Liquidity:', fallback.totalAvailableLiquidity);
    console.log('Supply Reserves Count:', fallback.supplyReserves.length);
    console.log('Borrow Reserves Count:', fallback.borrowReserves.length);
    console.log('Supply Reserves:', fallback.supplyReserves);
    console.log('Borrow Reserves:', fallback.borrowReserves);
    console.groupEnd();
    return fallback;
  }, [useContractDataFallback, formattedPoolReserves, marketAddress, networkConfig]);

  // Compute aggregate metrics - use SDK data if available, otherwise use fallback
  const totalBorrows = useMemo(() => {
    if (sdkMarket) {
      return sdkMarket.borrowReserves.reduce((acc, reserve) => {
        const value = reserve.borrowInfo?.total?.usd ?? 0;
        return acc + Number(value);
      }, 0);
    }
    if (formattedPoolReserves) {
      return computeAggregateMetrics(formattedPoolReserves).totalBorrows;
    }
    return undefined;
  }, [sdkMarket, formattedPoolReserves]);

  // Supply reserves - use SDK data if available, otherwise use fallback
  const supplyReserves = useMemo(() => {
    if (sdkMarket) {
      return sdkMarket.supplyReserves.map((reserve) => ({
        ...reserve,
        id: `${sdkMarket.address}-${reserve.underlyingToken.address}`,
      }));
    }
    if (fallbackMarketData) {
      return fallbackMarketData.supplyReserves.map((reserve) => ({
        ...reserve,
        id: `${marketAddress}-${reserve.underlyingToken.address}`,
      }));
    }
    return [];
  }, [sdkMarket, fallbackMarketData, marketAddress]);

  // Borrow reserves - use SDK data if available, otherwise use fallback
  const borrowReserves = useMemo(() => {
    if (sdkMarket) {
      return sdkMarket.borrowReserves.map((reserve) => ({
        ...reserve,
        id: `${sdkMarket.address}-${reserve.underlyingToken.address}`,
      }));
    }
    if (fallbackMarketData) {
      return fallbackMarketData.borrowReserves.map((reserve) => ({
        ...reserve,
        id: `${marketAddress}-${reserve.underlyingToken.address}`,
      }));
    }
    return [];
  }, [sdkMarket, fallbackMarketData, marketAddress]);

  // Create a synthetic market object for fallback mode
  const market = useMemo(() => {
    if (sdkMarket) {
      return sdkMarket;
    }
    if (fallbackMarketData) {
      // Return a minimal Market-like object with the data we have
      return {
        address: marketAddress,
        totalMarketSize: fallbackMarketData.totalMarketSize,
        totalAvailableLiquidity: fallbackMarketData.totalAvailableLiquidity,
        supplyReserves: fallbackMarketData.supplyReserves,
        borrowReserves: fallbackMarketData.borrowReserves,
      } as unknown as Market;
    }
    return undefined;
  }, [sdkMarket, fallbackMarketData, marketAddress]);

  const eModeCategories = sdkMarket?.eModeCategories ?? [];
  const marketUserState = sdkMarket?.userState ?? undefined;

  // user hooks
  const eModes = formattedPoolReserves ? formatEmodes(formattedPoolReserves) : {};

  const { data: userReservesData, isPending: userReservesDataLoading } =
    useUserPoolReservesHumanized(currentMarketData);
  const { data: userSummary, isPending: userSummaryLoading } =
    useExtendedUserSummaryAndIncentives(currentMarketData);
  const userReserves = userReservesData?.userReserves;

  // loading - in fallback mode, we wait for contract data instead of SDK
  const isReservesLoading = reservesDataLoading || formattedPoolReservesLoading;
  const isUserDataLoading = userReservesDataLoading || userSummaryLoading;

  // Loading is true when:
  // 1. SDK is still pending AND we don't have contract data yet, OR
  // 2. Contract data is still loading
  const loading = useMemo(() => {
    // If SDK data is available, use original loading logic
    if (sdkMarket) {
      return isPending || isReservesLoading || (!!currentAccount && isUserDataLoading);
    }
    // In fallback mode, wait for contract data
    return isReservesLoading || (!!currentAccount && isUserDataLoading);
  }, [sdkMarket, isPending, isReservesLoading, isUserDataLoading, currentAccount]);

  // Debug logging for final context values
  useEffect(() => {
    console.group('[AppDataProvider] Final Context Values');
    console.log('loading:', loading);
    console.log('market:', market);
    console.log('totalBorrows:', totalBorrows);
    console.log('supplyReserves:', supplyReserves);
    console.log('borrowReserves:', borrowReserves);
    console.log('reserves (legacy):', formattedPoolReserves);
    console.log('baseCurrencyData:', baseCurrencyData);
    console.groupEnd();
  }, [
    loading,
    market,
    totalBorrows,
    supplyReserves,
    borrowReserves,
    formattedPoolReserves,
    baseCurrencyData,
  ]);

  // Debug: Log final provider state
  console.log('[AppDataProvider] Final state:', {
    market: currentMarketData.market,
    loading,
    isReservesLoading,
    isUserDataLoading,
    sdkMarketFound: !!sdkMarket,
    supplyReservesCount: supplyReserves.length,
    borrowReservesCount: borrowReserves.length,
    eModeCategoriesCount: eModeCategories.length,
    formattedReservesCount: formattedPoolReserves?.length ?? 0,
    eModesKeys: Object.keys(eModes),
    userReservesCount: userReserves?.length ?? 0,
    hasUserSummary: !!userSummary,
    marketReferencePriceInUsd: baseCurrencyData?.marketReferenceCurrencyPriceInUsd || '0',
  });

  return (
    <AppDataContext.Provider
      value={{
        loading,
        market,
        totalBorrows,
        supplyReserves,
        borrowReserves,
        eModeCategories,
        userState: marketUserState,
        // Legacy fields (to be removed once consumers migrate)
        reserves: formattedPoolReserves || [],
        eModes,
        user: userSummary,
        userReserves: userReserves || [],
        marketReferencePriceInUsd: baseCurrencyData?.marketReferenceCurrencyPriceInUsd || '0',
        marketReferenceCurrencyDecimals: baseCurrencyData?.marketReferenceCurrencyDecimals || 0,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
