import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useSAienApyHistory } from 'src/hooks/useSAienApyHistory';
import { MeritApyGraphContainer } from 'src/modules/reserve-overview/graphs/MeritApyGraphContainer';

/**
 * sAIEN APY Chart component for displaying Merit APY history
 * Can be integrated into the sAIEN deposit panel or other sAIEN-related pages
 */
export const SAienApyChart = () => {
  const { data, loading, error, refetch } = useSAienApyHistory();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        <Trans>sAIEN Merit APY History</Trans>
      </Typography>

      <MeritApyGraphContainer
        data={data}
        loading={loading}
        error={error}
        lineColor="#2EBAC6"
        showAverage={true}
        title="Merit APY"
        onRetry={refetch}
      />
    </Box>
  );
};
