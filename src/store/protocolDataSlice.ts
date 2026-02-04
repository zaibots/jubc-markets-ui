import { providers, utils } from 'ethers';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import {
  availableMarkets,
  getNetworkConfig,
  getProvider,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { CustomMarket, MarketDataType } from '../ui-config/marketsConfig';
import { NetworkConfig } from '../ui-config/networksConfig';
import { RootStore } from './root';
import { setQueryParameter } from './utils/queryParams';

type TypePermitParams = {
  reserveAddress: string;
  isWrappedBaseAsset: boolean;
};

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: (chainId?: number) => providers.Provider;
  setCurrentMarket: (market: CustomMarket, omitQueryParameterUpdate?: boolean) => void;
  tryPermit: ({ reserveAddress, isWrappedBaseAsset }: TypePermitParams) => boolean;
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  ProtocolDataSlice
> = (set, get) => {
  const initialMarket = availableMarkets[0];
  const initialMarketData = marketsData[initialMarket];

  // Debug: Log initial market selection
  console.log('[ProtocolDataSlice] Initial market setup:', {
    market: initialMarket,
    chainId: initialMarketData.chainId,
    addresses: {
      UI_POOL_DATA_PROVIDER: initialMarketData.addresses.UI_POOL_DATA_PROVIDER,
      LENDING_POOL_ADDRESS_PROVIDER: initialMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      LENDING_POOL: initialMarketData.addresses.LENDING_POOL,
    },
    marketTitle: initialMarketData.marketTitle,
    v3: initialMarketData.v3,
  });

  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: (chainId) => getProvider(chainId ?? get().currentChainId),
    setCurrentMarket: (market, omitQueryParameterUpdate) => {
      if (!availableMarkets.includes(market as CustomMarket)) {
        console.warn('[ProtocolDataSlice] Invalid market:', market, 'Available:', availableMarkets);
        return;
      }
      const nextMarketData = marketsData[market];

      // Debug: Log market change
      console.log('[ProtocolDataSlice] setCurrentMarket:', {
        market,
        chainId: nextMarketData.chainId,
        addresses: {
          UI_POOL_DATA_PROVIDER: nextMarketData.addresses.UI_POOL_DATA_PROVIDER,
          LENDING_POOL_ADDRESS_PROVIDER: nextMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
          LENDING_POOL: nextMarketData.addresses.LENDING_POOL,
        },
        marketTitle: nextMarketData.marketTitle,
        v3: nextMarketData.v3,
      });

      localStorage.setItem('selectedMarket', market);
      if (!omitQueryParameterUpdate) {
        setQueryParameter('marketName', market);
      }
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
      });
    },
    tryPermit: ({ reserveAddress, isWrappedBaseAsset }: TypePermitParams) => {
      const currentNetworkConfig = get().currentNetworkConfig;
      const currentMarketData = get().currentMarketData;
      // current chain id, or underlying chain id for fork networks
      const underlyingChainId = currentNetworkConfig.isFork
        ? currentNetworkConfig.underlyingChainId
        : currentMarketData.chainId;
      // enable permit for all v3 test network assets (except WrappedBaseAssets) or v3 production assets included in permitConfig)
      const testnetPermitEnabled = Boolean(
        currentMarketData.v3 &&
          currentNetworkConfig.isTestnet &&
          !currentMarketData.permitDisabled &&
          !isWrappedBaseAsset
      );
      const productionPermitEnabled = Boolean(
        currentMarketData.v3 &&
          underlyingChainId &&
          permitByChainAndToken[underlyingChainId]?.[utils.getAddress(reserveAddress).toLowerCase()]
      );
      return testnetPermitEnabled || productionPermitEnabled;
    },
  };
};
