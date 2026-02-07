import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { BorrowInfo } from '../BorrowInfo';
import { ReserveEModePanel } from '../ReserveEModePanel';
import { PanelRow, PanelTitle } from '../ReservePanels';

// import { SavingsAien } from './SavingsAien';

type AienReserveConfigurationProps = {
  reserve: ReserveWithId;
};

export const AienReserveConfiguration: React.FC<AienReserveConfigurationProps> = ({ reserve }) => {
  const [currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentNetworkConfig, store.currentMarketData])
  );
  const { borrowCap } = useAssetCapsSDK();
  const showBorrowCapStatus = reserve.borrowInfo?.borrowCap.amount.value !== '0';

  return (
    <>
      <PanelRow>
        <PanelTitle>
          <Trans>About AIEN</Trans>
        </PanelTitle>
        <Box>
          <Typography gutterBottom>
            <Trans>
              AIEN is a native decentralized, collateral-backed digital asset pegged to USD. It is
              created by users via borrowing against multiple collateral. When user repays their AIEN
              borrow position, the protocol burns that user&apos;s AIEN. All the interest payments
              accrued by minters of AIEN would be directly transferred to the ZaibotsDAO treasury.
            </Trans>
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://github.com/zaibots/gho/blob/main/techpaper/GHO_Technical_Paper.pdf"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Techpaper</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://aien.xyz"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Website</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://docs.aien.xyz/concepts/faq"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>FAQ</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
          </Box>
        </Box>
      </PanelRow>
      {/* <Divider sx={{ my: { xs: 6, sm: 10 } }} /> */}
      {/* <PanelRow>
        <PanelTitle>
          <Trans>Savings AIEN</Trans>
        </PanelTitle>
        <Box>
          <SavingsAien />
        </Box>
      </PanelRow> */}
      <Divider sx={{ my: { xs: 6, sm: 10 } }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Borrow info</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <BorrowInfo
            showBorrowCapStatus={showBorrowCapStatus}
            renderCharts={false}
            currentMarketData={currentMarketData}
            currentNetworkConfig={currentNetworkConfig}
            reserve={reserve}
            borrowCap={borrowCap}
          />
        </Box>
      </PanelRow>
      {reserve.eModeInfo?.length > 0 && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <ReserveEModePanel reserve={reserve} />
        </>
      )}
    </>
  );
};
