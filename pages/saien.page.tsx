import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { WalletBalance } from 'src/modules/reserve-overview/ReserveActions';
import { SGHODepositPanel } from 'src/modules/sAien/SAienDepositPanel';
import { SGHOHeader } from 'src/modules/sAien/SAienHeader';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { SAFETY_MODULE } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

const SavingsAienDepositModal = dynamic(() =>
  import('../src/components/transactions/SavingsAien/SavingsAienDepositModal').then(
    (module) => module.SavingsAienDepositModal
  )
);
const SavingsAienWithdrawModal = dynamic(() =>
  import('../src/components/transactions/SavingsAien/SavingsAienWithdrawModal').then(
    (module) => module.SavingsAienWithdrawModal
  )
);
const StakeRewardClaimModal = dynamic(() =>
  import('../src/components/transactions/StakeRewardClaim/StakeRewardClaimModal').then(
    (module) => module.StakeRewardClaimModal
  )
);

export default function SavingsAien() {
  const { openSavingsAienDeposit, openSavingsAienWithdraw } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  );
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);

  // Automatically switch to the testnet market
  // Note: sAIEN functionality requires mainnet, but only testnet is available
  useEffect(() => {
    if (currentMarket !== CustomMarket.test_sepolia_v3) {
      setCurrentMarket(CustomMarket.test_sepolia_v3);
    }
  }, [currentMarket, setCurrentMarket]);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sAIEN',
    });
  }, [trackEvent]);

  let stkGho: StakeTokenFormatted | undefined;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [, , stkGho] = stakeGeneralResult;
  }

  let stkGhoUserData: StakeUIUserData | undefined;
  if (stakeUserResult && Array.isArray(stakeUserResult)) {
    [, , stkGhoUserData] = stakeUserResult;
  }

  return (
    <>
      <SGHOHeader />
      <ContentContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 0 },
            alignItems: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          <Paper
            sx={{
              pt: 4,
              pb: { xs: 6, md: 20 },
              px: downToXsm ? 4 : 6,
              flex: 1,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
                mb: { xs: 4, md: 6 },
              }}
            >
              <Box
                sx={{
                  mb: { xs: 4, md: 8 },
                }}
              >
                <Typography variant="h3">
                  <Trans>Savings AIEN (sAIEN)</Trans>
                </Typography>
              </Box>

              <SGHODepositPanel
                stakedToken="AIEN"
                stakeData={stkGho}
                stakeUserData={stkGhoUserData}
                onStakeAction={() => {
                  trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                    action: SAFETY_MODULE.OPEN_STAKE_MODAL,
                    asset: 'AIEN',
                    stakeType: 'Safety Module',
                  });
                  openSavingsAienDeposit();
                }}
                onCooldownAction={() => {
                  trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                    action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                    asset: 'AIEN',
                    stakeType: 'Safety Module',
                  });
                  openSavingsAienWithdraw();
                }}
                onUnstakeAction={() => {
                  trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                    action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                    asset: 'AIEN',
                    stakeType: 'Safety Module',
                  });
                  openSavingsAienWithdraw();
                }}
              />
            </Box>
          </Paper>
          {currentAccount ? <YourInfoGhoSection /> : <ConnectWallet />}
        </Box>
      </ContentContainer>
    </>
  );
}

const YourInfoGhoSection = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { walletBalances } = useWalletBalances(currentMarketData);

  const GHO_ADDRESS = AaveV3Ethereum.ASSETS.GHO.UNDERLYING;

  const userGhoBalance = GHO_ADDRESS
    ? walletBalances[GHO_ADDRESS.toLowerCase()] || { amount: '0', amountUSD: '0' }
    : { amount: '0', amountUSD: '0' };

  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 4, xsm: 6 },
        px: { xs: 4, xsm: 6 },
        minWidth: { md: '300px' },
        ml: { md: 4 },
        height: { md: '180px' },
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Typography variant="h3" sx={{ mb: 6 }}>
        Your Info
      </Typography>
      <WalletBalance balance={userGhoBalance.amount} symbol="AIEN" marketTitle="AIEN" />
    </Paper>
  );
};

const ConnectWallet = () => {
  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 4, xsm: 6 },
        px: { xs: 4, xsm: 6 },
        minWidth: { xs: '100%', md: '300px' },
        ml: { xs: 0, md: 4 },
        height: { xs: 'auto', md: '180px' },
        width: { xs: '100%', md: 'auto' },
      }}
    >
      <>
        <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
          <Trans>Your info</Trans>
        </Typography>
        <Typography sx={{ mb: 6 }} color="text.secondary">
          <Trans>Please connect a wallet to view your balance here.</Trans>
        </Typography>
        {}
        <ConnectWalletButton />
      </>
    </Paper>
  );
};

SavingsAien.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <SavingsAienDepositModal />
      <SavingsAienWithdrawModal />
      <StakeRewardClaimModal />
      {/** End of modals */}
    </MainLayout>
  );
};
