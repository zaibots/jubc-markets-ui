import { Trans } from '@lingui/macro';
import { GENERAL } from 'src/utils/events';

import { Link } from '../primitives/Link';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type FixedToolTipProps = TextWithTooltipProps;

export const FixedAPYTooltipText = (
  <Trans>
    Interest rate that is determined by Zaibots Governance. This rate may be changed over time
    depending on the need for the AIEN supply to contract/expand.{' '}
    <Link
      href="https://docs.aien.xyz/concepts/how-aien-works/interest-rate-discount-model#interest-rate-model"
      underline="always"
    >
      <Trans>Learn more</Trans>
    </Link>
  </Trans>
);

export const FixedAPYTooltip = (props: FixedToolTipProps) => {
  return (
    <TextWithTooltip
      event={{
        eventName: GENERAL.TOOL_TIP,
        eventParams: { tooltip: 'AIEN APY' },
      }}
      {...props}
    >
      {FixedAPYTooltipText}
    </TextWithTooltip>
  );
};
