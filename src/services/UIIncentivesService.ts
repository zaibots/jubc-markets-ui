import { UiIncentiveDataProvider } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import invariant from 'tiny-invariant';

export class UiIncentivesService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiIncentiveDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    invariant(
      marketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
      'No UI incentive data provider address found for this market'
    );
    console.log('[UiIncentivesService] Creating UiIncentiveDataProvider:', {
      uiIncentiveDataProviderAddress: marketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
      chainId: marketData.chainId,
      market: marketData.market,
    });
    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: marketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
      provider,
      chainId: marketData.chainId,
    });
  }

  async getReservesIncentivesDataHumanized(marketData: MarketDataType) {
    console.log('[UiIncentivesService] getReservesIncentivesDataHumanized called:', {
      market: marketData.market,
      incentivesEnabled: marketData.enabledFeatures?.incentives,
    });

    if (!marketData.enabledFeatures?.incentives) {
      console.log('[UiIncentivesService] Incentives disabled, returning empty array');
      return [];
    }

    const uiIncentiveDataProvider = this.getUiIncentiveDataProvider(marketData);
    try {
      const result = await uiIncentiveDataProvider.getReservesIncentivesDataHumanized({
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      console.log('[UiIncentivesService] getReservesIncentivesDataHumanized SUCCESS:', {
        market: marketData.market,
        incentivesCount: result.length,
        incentives: result.map((i) => ({
          underlyingAsset: i.underlyingAsset,
          aIncentiveData: i.aIncentiveData,
          vIncentiveData: i.vIncentiveData,
        })),
      });
      return result;
    } catch (error) {
      console.error('[UiIncentivesService] getReservesIncentivesDataHumanized ERROR:', {
        market: marketData.market,
        error,
      });
      throw error;
    }
  }
  async getUserReservesIncentivesData(marketData: MarketDataType, user: string) {
    console.log('[UiIncentivesService] getUserReservesIncentivesData called:', {
      market: marketData.market,
      user,
      incentivesEnabled: marketData.enabledFeatures?.incentives,
    });

    if (!marketData.enabledFeatures?.incentives) {
      console.log('[UiIncentivesService] Incentives disabled, returning empty array');
      return [];
    }
    const uiIncentiveDataProvider = this.getUiIncentiveDataProvider(marketData);
    try {
      const result = await uiIncentiveDataProvider.getUserReservesIncentivesDataHumanized({
        user,
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      console.log('[UiIncentivesService] getUserReservesIncentivesData SUCCESS:', {
        market: marketData.market,
        user,
        userIncentivesCount: result.length,
      });
      return result;
    } catch (error) {
      console.error('[UiIncentivesService] getUserReservesIncentivesData ERROR:', {
        market: marketData.market,
        user,
        error,
      });
      throw error;
    }
  }
}
