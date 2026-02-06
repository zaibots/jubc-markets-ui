import {
  EmodeDataHumanized,
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

// Minimal ABI for raw data fetching
const UI_POOL_DATA_PROVIDER_ABI = [
  'function getReservesData(address provider) external view returns (tuple[] memory, tuple memory)',
  'function getReservesList(address provider) external view returns (address[] memory)',
];

export type UserReservesDataHumanized = {
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
};

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private async getUiPoolDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    console.log('[UIPoolService] Creating UiPoolDataProvider:', {
      uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      chainId: marketData.chainId,
      market: marketData.market,
    });
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: marketData.chainId,
    });
  }

  // Fetch raw contract data for debugging
  private async getRawReservesData(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    const contract = new Contract(
      marketData.addresses.UI_POOL_DATA_PROVIDER,
      UI_POOL_DATA_PROVIDER_ABI,
      provider
    );

    try {
      // First try to get the reserves list
      console.log('[UIPoolService] Fetching raw reserves list...');
      const reservesList = await contract.getReservesList(
        marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
      );
      console.log('[UIPoolService] Raw reserves list:', {
        count: reservesList.length,
        addresses: reservesList,
      });

      // Then try to get the full reserves data
      console.log('[UIPoolService] Fetching raw reserves data...');
      const rawData = await contract.getReservesData(
        marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
      );
      console.log('[UIPoolService] Raw reserves data response:', {
        reservesArrayLength: rawData[0]?.length,
        baseCurrencyData: rawData[1],
        // Log first reserve's raw fields if available
        firstReserveRaw: rawData[0]?.[0]
          ? {
              field0: rawData[0][0][0]?.toString(),
              field1: rawData[0][0][1]?.toString(),
              field2: rawData[0][0][2]?.toString(),
              field3: rawData[0][0][3]?.toString(),
              field4: rawData[0][0][4]?.toString(),
              field5: rawData[0][0][5]?.toString(),
              field6: rawData[0][0][6]?.toString(),
              field7: rawData[0][0][7]?.toString(),
              field8: rawData[0][0][8]?.toString(),
              field9: rawData[0][0][9]?.toString(),
              allFields: rawData[0][0].map((f: unknown) =>
                typeof f === 'object' && f !== null && 'toString' in f ? f.toString() : f
              ),
            }
          : null,
      });
      return rawData;
    } catch (rawError) {
      console.error('[UIPoolService] Raw data fetch error:', rawError);
      return null;
    }
  }

  async getReservesHumanized(marketData: MarketDataType): Promise<ReservesDataHumanized> {
    console.log('[UIPoolService] getReservesHumanized called for market:', marketData.market);

    // First fetch raw data for debugging
    await this.getRawReservesData(marketData);

    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    try {
      const result = await uiPoolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      console.log('[UIPoolService] getReservesHumanized SUCCESS:', {
        market: marketData.market,
        reservesCount: result.reservesData?.length ?? 0,
        baseCurrencyData: result.baseCurrencyData,
        reserveSymbols: result.reservesData?.map((r) => r.symbol),
      });
      return result;
    } catch (error) {
      console.error('[UIPoolService] getReservesHumanized ERROR:', {
        market: marketData.market,
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
        error,
      });
      throw error;
    }
  }

  async getUserReservesHumanized(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    console.log('[UIPoolService] getUserReservesHumanized called:', {
      market: marketData.market,
      user,
    });
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    try {
      const result = await uiPoolDataProvider.getUserReservesHumanized({
        user,
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      console.log('[UIPoolService] getUserReservesHumanized SUCCESS:', {
        market: marketData.market,
        user,
        userReservesCount: result.userReserves?.length ?? 0,
        userEmodeCategoryId: result.userEmodeCategoryId,
      });
      return result;
    } catch (error) {
      console.error('[UIPoolService] getUserReservesHumanized ERROR:', {
        market: marketData.market,
        user,
        error,
      });
      throw error;
    }
  }

  // Fetch raw eModes data for debugging
  private async getRawEModesData(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    const eModesAbi = [
      'function getEModes(address provider) external view returns (tuple[] memory)',
    ];
    const contract = new Contract(marketData.addresses.UI_POOL_DATA_PROVIDER, eModesAbi, provider);

    try {
      console.log('[UIPoolService] Fetching raw eModes data...');
      const rawEModes = await contract.getEModes(
        marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
      );
      console.log('[UIPoolService] Raw eModes data:', {
        count: rawEModes?.length,
        firstEMode: rawEModes?.[0]
          ? {
              allFields: rawEModes[0].map((f: unknown) =>
                typeof f === 'object' && f !== null && 'toString' in f ? f.toString() : f
              ),
            }
          : null,
        rawEModes: rawEModes?.map((em: unknown[]) => ({
          fields: em?.map((f: unknown) =>
            typeof f === 'object' && f !== null && 'toString' in f ? f.toString() : f
          ),
        })),
      });
      return rawEModes;
    } catch (rawError) {
      console.error('[UIPoolService] Raw eModes fetch error:', rawError);
      return null;
    }
  }

  async getEModesHumanized(marketData: MarketDataType): Promise<EmodeDataHumanized[]> {
    console.log('[UIPoolService] getEModesHumanized called for market:', marketData.market);

    // First fetch raw data for debugging
    await this.getRawEModesData(marketData);

    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    try {
      const result = await uiPoolDataProvider.getEModesHumanized({
        lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      console.log('[UIPoolService] getEModesHumanized SUCCESS:', {
        market: marketData.market,
        eModesCount: result.length,
        eModes: result,
      });
      return result;
    } catch (error) {
      console.error('[UIPoolService] getEModesHumanized ERROR:', {
        market: marketData.market,
        error,
      });
      throw error;
    }
  }
}
