import { AaveGovernanceService, ChainId, Power } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
// import { MarketDataType } from 'src/ui-config/marketsConfig';

export interface Powers {
  votingPower: string;
  zaibotsTokenPower: Power;
  stkZaibotsTokenPower: Power;
  propositionPower: string;
  zaibotsVotingDelegatee: string;
  zaibotsPropositionDelegatee: string;
  stkZaibotsVotingDelegatee: string;
  stkZaibotsPropositionDelegatee: string;
  aZaibotsVotingDelegatee: string;
  aZaibotsPropositionDelegatee: string;
  aZaibotsTokenPower: Power;
}

// interface VoteOnProposalData {
//   votingPower: string;
//   support: boolean;
// }

const ZAIBOTSU_GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c';

export class GovernanceService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getAaveGovernanceService(chainId: ChainId) {
    const provider = this.getProvider(chainId);
    return new AaveGovernanceService(provider, {
      GOVERNANCE_ADDRESS: ZAIBOTSU_GOVERNANCE_V2,
      GOVERNANCE_HELPER_ADDRESS: governanceV3Config.addresses.TOKEN_POWER_HELPER,
    });
  }

  // async getVotingPowerAt(
  //   marketData: MarketDataType,
  //   user: string,
  //   strategy: string,
  //   block: number
  // ) {
  //   const aaveGovernanceService = this.getAaveGovernanceService(marketData);
  //   return aaveGovernanceService.getVotingPowerAt({
  //     user,
  //     strategy,
  //     block,
  //   });
  // }

  // async getVoteOnProposal(
  //   marketData: MarketDataType,
  //   user: string,
  //   proposalId: number
  // ): Promise<VoteOnProposalData> {
  //   const aaveGovernanceService = this.getAaveGovernanceService(marketData);
  //   const { votingPower, support } = await aaveGovernanceService.getVoteOnProposal({
  //     user,
  //     proposalId,
  //   });
  //   return {
  //     votingPower: normalize(votingPower.toString(), 18),
  //     support,
  //   };
  // }

  async getPowers(govChainId: ChainId, user: string, blockHash?: string): Promise<Powers> {
    const { zaibotsTokenAddress, stkZaibotsTokenAddress, aZaibotsTokenAddress } =
      governanceV3Config.votingAssets;

    const aaveGovernanceService = this.getAaveGovernanceService(govChainId);

    const options: { blockTag?: string } = {};
    if (blockHash) {
      options.blockTag = blockHash;
    }

    const [zaibotsTokenPower, stkZaibotsTokenPower, aZaibotsTokenPower] =
      // pass blockhash here as optional
      await aaveGovernanceService.getTokensPower(
        {
          user: user,
          tokens: [zaibotsTokenAddress, stkZaibotsTokenAddress, aZaibotsTokenAddress],
        },
        options
      );
    // todo setup powers for aZaibotsToken
    const powers = {
      votingPower: normalize(
        valueToBigNumber(zaibotsTokenPower.votingPower.toString())
          .plus(stkZaibotsTokenPower.votingPower.toString())
          .plus(aZaibotsTokenPower.votingPower.toString())
          .toString(),
        18
      ),
      aZaibotsTokenPower,
      zaibotsTokenPower,
      stkZaibotsTokenPower,
      propositionPower: normalize(
        valueToBigNumber(zaibotsTokenPower.propositionPower.toString())
          .plus(stkZaibotsTokenPower.propositionPower.toString())
          .plus(aZaibotsTokenPower.votingPower.toString())
          .toString(),
        18
      ),
      aZaibotsVotingDelegatee: aZaibotsTokenPower.delegatedAddressVotingPower,
      aZaibotsPropositionDelegatee: aZaibotsTokenPower.delegatedAddressPropositionPower,

      zaibotsVotingDelegatee: zaibotsTokenPower.delegatedAddressVotingPower,
      zaibotsPropositionDelegatee: zaibotsTokenPower.delegatedAddressPropositionPower,

      stkZaibotsVotingDelegatee: stkZaibotsTokenPower.delegatedAddressVotingPower,

      stkZaibotsPropositionDelegatee: stkZaibotsTokenPower.delegatedAddressPropositionPower,
    };
    return powers;
  }
}
