import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const AienRateTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Estimated compounding interest rate, that is determined by Zaibots Governance. This rate may be
        changed over time depending on the need for the AIEN supply to contract/expand.
      </Trans>
    </TextWithTooltip>
  );
};
