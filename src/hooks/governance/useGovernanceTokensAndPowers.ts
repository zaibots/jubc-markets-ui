import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/lib/ethers';
import { Powers } from 'src/services/GovernanceService';
import { GovernanceTokensBalance } from 'src/services/WalletBalanceService';

import { useGovernanceTokens } from './useGovernanceTokens';
import { usePowers } from './usePowers';

interface GovernanceTokensAndPowers extends Powers, GovernanceTokensBalance {
  isZaibotsTokenWithDelegatedPower: boolean;
  isStkZaibotsTokenWithDelegatedPower: boolean;
  isAZaibotsTokenWithDelegatedPower: boolean;
  refetchPowers: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Powers, unknown>>;
}

export const useGovernanceTokensAndPowers = (
  blockHash?: string
): GovernanceTokensAndPowers | undefined => {
  const { data: powers, refetch: refetchPowers } = usePowers(blockHash);
  const { data: governanceTokens } = useGovernanceTokens(blockHash);

  if (!powers || !governanceTokens) {
    return undefined;
  }

  // TODO Refactor and fix
  const convertToBigNumber = (value: string, decimals = 18) =>
    value ? ethers.utils.parseUnits(value.toString(), decimals) : BigNumber.from(0);

  const aZaibotsPower = powers.aZaibotsTokenPower.votingPower;
  const aZaibotsToken = convertToBigNumber(governanceTokens.aZaibots);
  const zaibotsPower = powers.zaibotsTokenPower.votingPower;
  const zaibotsToken = convertToBigNumber(governanceTokens.zaibots);
  const stkZaibotsPower = powers.stkZaibotsTokenPower.votingPower;
  const stkZaibotsToken = convertToBigNumber(governanceTokens.stkZaibots);

  return {
    ...powers,
    ...governanceTokens,
    isAZaibotsTokenWithDelegatedPower: aZaibotsPower.gt(aZaibotsToken),
    isZaibotsTokenWithDelegatedPower: zaibotsPower.gt(zaibotsToken),
    isStkZaibotsTokenWithDelegatedPower: stkZaibotsPower.gt(stkZaibotsToken),
    refetchPowers,
  };
};
