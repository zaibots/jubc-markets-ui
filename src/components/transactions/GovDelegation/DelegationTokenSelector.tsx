import { DelegationType } from '@aave/contract-helpers';
import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = {
  address: string;
  name: string;
  amount: string;
  symbol: string;
  votingDelegatee?: string;
  propositionDelegatee?: string;
  type: DelegationTokenType;
};

export enum DelegationTokenType {
  ALL = 0,
  ZAIBOTSU,
  STKZAIBOTSU,
  aZaibots,
}

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationTokenType: (type: DelegationTokenType) => void;
  delegationTokenType: DelegationTokenType;
  delegationType: DelegationType;
  filter: boolean;
};

type TokenRowProps = {
  symbol: string[] | string;
  amount: string | number;
};

export const TokenRow: React.FC<TokenRowProps> = ({ symbol, amount }) => {
  return (
    <Row
      sx={{ alignItems: 'center', width: '100%' }}
      caption={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {Array.isArray(symbol) ? (
            symbol.map((token, index) => (
              <>
                <TokenIcon
                  aToken={token === 'aZAIBOTSU'}
                  symbol={token === 'aZAIBOTSU' ? 'zaibots' : token}
                  sx={{ width: 16, height: 16 }}
                />
                <Typography variant="subheader1">{token}</Typography>
                {index < symbol.length - 1 && <Typography variant="subheader1">+</Typography>}
              </>
            ))
          ) : (
            <>
              <TokenIcon
                aToken={symbol === 'aZAIBOTSU'}
                symbol={symbol === 'aZAIBOTSU' ? 'zaibots' : symbol}
                sx={{ width: 16, height: 16 }}
              />
              <Typography variant="subheader1">{symbol}</Typography>
            </>
          )}
        </Box>
      }
    >
      <FormattedNumber variant="secondary14" color="text.secondary" value={amount} />
    </Row>
  );
};

const filterTokens = (
  tokens: DelegationToken[],
  delegationType: DelegationType
): DelegationToken[] => {
  if (delegationType === DelegationType.VOTING) {
    return tokens.filter((token) => token.votingDelegatee !== '');
  } else if (delegationType === DelegationType.PROPOSITION) {
    return tokens.filter((token) => token.propositionDelegatee !== '');
  }
  return tokens.filter(
    (token) => token.propositionDelegatee !== '' || token.votingDelegatee !== ''
  );
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationTokenType,
  delegationTokenType,
  delegationType,
  filter,
}: DelegationTokenSelectorProps) => {
  const {
    data: { zaibots, stkZaibots, aZaibots },
  } = useGovernanceTokens();

  const filteredTokens = filter ? filterTokens(delegationTokens, delegationType) : delegationTokens;
  const isOneLiner = filter && filteredTokens.length === 1;

  useEffect(() => {
    if (isOneLiner) setDelegationTokenType(filteredTokens[0].type);
  }, [isOneLiner, filteredTokens, setDelegationTokenType]);

  if (isOneLiner) {
    return <TokenRow symbol={filteredTokens[0].symbol} amount={filteredTokens[0].amount} />;
  }

  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <RadioGroup
        value={delegationTokenType}
        onChange={(e) =>
          setDelegationTokenType(Number(e.target.value) as unknown as DelegationTokenType)
        }
      >
        <FormControlLabel
          value={DelegationTokenType.ALL}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={
            <TokenRow
              symbol={['ZAIBOTSU', 'stkZAIBOTSU', 'aZAIBOTSU']}
              amount={Number(zaibots) + Number(stkZaibots) + Number(aZaibots)}
            />
          }
          data-cy={`delegate-token-both`}
        />
        <FormControlLabel
          value={DelegationTokenType.ZAIBOTSU}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="ZAIBOTSU" amount={zaibots} />}
          data-cy={`delegate-token-ZAIBOTSU`}
        />
        <FormControlLabel
          value={DelegationTokenType.STKZAIBOTSU}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="stkZAIBOTSU" amount={stkZaibots} />}
          data-cy={`delegate-token-stkZAIBOTSU`}
        />
        <FormControlLabel
          value={DelegationTokenType.aZaibots}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="aZAIBOTSU" amount={aZaibots} />}
          data-cy={`delegate-token-aZaibots`}
        />
      </RadioGroup>
    </FormControl>
  );
};
