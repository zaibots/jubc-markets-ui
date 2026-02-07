import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

export const GetAienToken = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleClick = () => {
    trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'Get AIEN' });
  };

  return (
    <>
      <DarkTooltip title="Get AIEN to stake within the Zaibots Protocol">
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          data-cy={`getGho-token`} // todo tests
          startIcon={
            <Box sx={{ mr: -1 }}>
              <TokenIcon symbol="AIEN" sx={{ fontSize: '14px' }} />
            </Box>
          }
        >
          <Trans>Get AIEN</Trans>
        </Button>
      </DarkTooltip>
    </>
  );
};
