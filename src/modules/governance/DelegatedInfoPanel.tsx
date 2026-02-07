import { Trans } from '@lingui/macro';
import { Button, Divider, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { constants } from 'ethers';
import { AvatarSize } from 'src/components/Avatar';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ExternalUserDisplay } from 'src/components/UserDisplay';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';
import { usePowers } from 'src/hooks/governance/usePowers';
import { useModalContext } from 'src/hooks/useModal';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

type DelegatedPowerProps = {
  zaibotsPower: string;
  stkZaibotsPower: string;
  zaibotsDelegatee: string;
  stkZaibotsDelegatee: string;
  title: string;
  aZaibotsPower: string;
  aZaibotsDelegatee: string;
};

const DelegatedPower: React.FC<DelegatedPowerProps> = ({
  zaibotsPower,
  stkZaibotsPower,
  zaibotsDelegatee,
  stkZaibotsDelegatee,
  aZaibotsDelegatee,
  aZaibotsPower,
  title,
}) => {
  const isZaibotsSelfDelegated = !zaibotsDelegatee || constants.AddressZero === zaibotsDelegatee;
  const isStkZaibotsSelfDelegated = !stkZaibotsDelegatee || constants.AddressZero === stkZaibotsDelegatee;
  const isAZaibotsSelfDelegated = !aZaibotsDelegatee || constants.AddressZero === aZaibotsDelegatee;

  if (isZaibotsSelfDelegated && isStkZaibotsSelfDelegated && isAZaibotsSelfDelegated) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 6, mb: 2 }}>
      <Typography typography="caption" sx={{ mb: 5 }} color="text.secondary">
        <Trans>{title}</Trans>
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {zaibotsDelegatee !== ZERO_ADDRESS &&
        zaibotsDelegatee === stkZaibotsDelegatee &&
        zaibotsDelegatee === aZaibotsDelegatee ? (
          <Row
            align="flex-start"
            caption={
              <ExternalUserDisplay
                avatarProps={{ size: AvatarSize.XS }}
                titleProps={{ variant: 'subheader1' }}
                address={zaibotsDelegatee}
              />
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <FormattedNumber
                value={Number(zaibotsPower) + Number(stkZaibotsPower) + Number(aZaibotsPower)}
                variant="subheader1"
              />
              <Typography variant="helperText" color="text.secondary">
                ZAIBOTSU + stkZAIBOTSU + aZAIBOTSU
              </Typography>
            </Box>
          </Row>
        ) : (
          <>
            {!isZaibotsSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: 'subheader1' }}
                    address={zaibotsDelegatee}
                  />
                }
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TokenIcon symbol="ZAIBOTSU" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={zaibotsPower} variant="subheader1" />
                </Box>
              </Row>
            )}
            {!isStkZaibotsSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: 'subheader1' }}
                    address={stkZaibotsDelegatee}
                  />
                }
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TokenIcon symbol="stkZAIBOTSU" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={stkZaibotsPower} variant="subheader1" />
                </Box>
              </Row>
            )}

            {!isAZaibotsSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: 'subheader1' }}
                    address={aZaibotsDelegatee}
                  />
                }
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TokenIcon aToken symbol="zaibots" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={aZaibotsPower} variant="subheader1" />
                </Box>
              </Row>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export const DelegatedInfoPanel = () => {
  const address = useRootStore((store) => store.account);
  const {
    data: { zaibots, stkZaibots, aZaibots },
  } = useGovernanceTokens();
  const { data: powers } = usePowers();
  const { openGovDelegation, openRevokeGovDelegation } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (!powers || !address) return null;

  const disableButton =
    Number(zaibots) <= 0 &&
    Number(stkZaibots) <= 0 &&
    Number(aZaibots) <= 0 &&
    powers.zaibotsPropositionDelegatee === constants.AddressZero &&
    powers.zaibotsVotingDelegatee === constants.AddressZero &&
    powers.stkZaibotsPropositionDelegatee === constants.AddressZero &&
    powers.stkZaibotsVotingDelegatee === constants.AddressZero &&
    powers.aZaibotsPropositionDelegatee === constants.AddressZero &&
    powers.aZaibotsVotingDelegatee === constants.AddressZero;

  const showRevokeButton =
    powers.zaibotsPropositionDelegatee !== constants.AddressZero ||
    powers.zaibotsVotingDelegatee !== constants.AddressZero ||
    powers.stkZaibotsPropositionDelegatee !== constants.AddressZero ||
    powers.stkZaibotsVotingDelegatee !== constants.AddressZero ||
    powers.aZaibotsVotingDelegatee !== constants.AddressZero ||
    powers.aZaibotsPropositionDelegatee !== constants.AddressZero;

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Typography typography="h3">
          <Trans>Delegated power</Trans>
        </Typography>
        <Typography typography="description" sx={{ mt: 1 }} color="text.secondary">
          <Trans>
            Use your ZAIBOTSU, stkZAIBOTSU, or aZaibots balance to delegate your voting and proposition powers.
            You will not be sending any tokens, only the rights to vote and propose changes to the
            protocol. You can re-delegate or revoke power to self at any time.
          </Trans>
          <Link
            href="https://docs.zaibots.com/developers/v/2.0/protocol-governance/governance"
            target="_blank"
            variant="description"
            color="text.secondary"
            sx={{ textDecoration: 'underline', ml: 1 }}
            onClick={() => trackEvent(GENERAL.EXTERNAL_LINK, { link: 'Learn More Delegation' })}
          >
            <Trans>Learn more.</Trans>
          </Link>
        </Typography>
        {disableButton ? (
          <Typography variant="description" color="text.muted" mt={6}>
            <Trans>You have no ZAIBOTSU/stkZAIBOTSU/aZaibots balance to delegate.</Trans>
          </Typography>
        ) : (
          <>
            <DelegatedPower
              zaibotsPower={zaibots}
              stkZaibotsPower={stkZaibots}
              aZaibotsPower={aZaibots}
              aZaibotsDelegatee={powers.aZaibotsVotingDelegatee}
              zaibotsDelegatee={powers.zaibotsVotingDelegatee}
              stkZaibotsDelegatee={powers.stkZaibotsVotingDelegatee}
              title="Voting power"
            />
            <DelegatedPower
              zaibotsPower={zaibots}
              aZaibotsPower={aZaibots}
              aZaibotsDelegatee={powers.aZaibotsPropositionDelegatee}
              stkZaibotsPower={stkZaibots}
              zaibotsDelegatee={powers.zaibotsPropositionDelegatee}
              stkZaibotsDelegatee={powers.stkZaibotsPropositionDelegatee}
              title="Proposition power"
            />
          </>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          size="large"
          sx={{ width: '100%' }}
          variant="contained"
          disabled={disableButton}
          onClick={() => openGovDelegation()}
        >
          <Trans>Set up delegation</Trans>
        </Button>
        {showRevokeButton && (
          <Button
            size="large"
            sx={{ width: '100%' }}
            variant="outlined"
            disabled={disableButton}
            onClick={() => openRevokeGovDelegation()}
          >
            <Trans>Revoke power</Trans>
          </Button>
        )}
      </Box>
    </Paper>
  );
};
