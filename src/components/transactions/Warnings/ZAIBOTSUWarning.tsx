import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { ROUTES } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

export const ZAIBOTSUWarning = () => {
  return (
    <Warning severity="info">
      <Typography>
        <Trans>Supplying your </Trans> ZAIBOTSU{' '}
        <Trans>tokens is not the same as staking them. If you wish to stake your </Trans> ZAIBOTSU{' '}
        <Trans>tokens, please go to the </Trans>{' '}
        <Link href={ROUTES.staking}>
          <Trans>staking view</Trans>
        </Link>
      </Typography>
    </Warning>
  );
};
