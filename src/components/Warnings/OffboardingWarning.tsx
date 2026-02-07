import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';

// No offboarding assets for testnet
export const AssetsBeingOffboarded: { [market: string]: { [symbol: string]: string } } = {};

export const OffboardingWarning = ({ discussionLink }: { discussionLink: string }) => {
  return (
    <Trans>
      This asset is planned to be offboarded due to an Zaibots Protocol Governance decision.{' '}
      <Link href={discussionLink} sx={{ textDecoration: 'underline' }}>
        <Trans>More details</Trans>
      </Link>
    </Trans>
  );
};
