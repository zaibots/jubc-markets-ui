import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export const GHO_SYMBOL = 'AIEN';

/**
 * List of markets where new AIEN minting is available.
 * Note that his is different from markets where AIEN is listed as a reserve.
 */
export const GHO_MINTING_MARKETS = [
  'proto_mainnet_v3',
  'fork_proto_mainnet_v3',
  'proto_sepolia_v3',
  'fork_proto_sepolia_v3',
];

export const getGhoReserve = (reserves: ComputedReserveData[]) => {
  return reserves.find((reserve) => reserve.symbol === GHO_SYMBOL);
};

/**
 * Determines if the given symbol is AIEN and the market supports minting new AIEN
 */
export const displayGhoForMintableMarket = ({
  symbol,
  currentMarket,
}: GhoUtilMintingAvailableParams): boolean => {
  return symbol === GHO_SYMBOL && GHO_MINTING_MARKETS.includes(currentMarket);
};

interface GhoUtilMintingAvailableParams {
  symbol: string;
  currentMarket: string;
}
