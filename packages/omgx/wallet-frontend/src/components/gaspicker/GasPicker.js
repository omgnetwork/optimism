/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import { Box, Card, CardActionArea, Grid, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectGas } from 'selectors/gasSelector';
import * as styles from './GasPicker.module.scss';

function GasPicker ({ selectedSpeed, setSelectedSpeed, setGasPrice }) {
  const gas = useSelector(selectGas);

  useEffect(() => {
    setGasPrice(gas[selectedSpeed]);
  }, [ selectedSpeed, gas, setGasPrice ]);

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="h6">
        Gas Fee
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Card
            variant={selectedSpeed === 'slow' ? 'selected' : 'outlined'}
          >
            <CardActionArea onClick={() => setSelectedSpeed('slow')}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">Slow</Typography>
                <Typography variant="caption" color="primary">{gas.slow / 1000000000} gwei</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card
            variant={selectedSpeed === 'normal' ? 'selected' : 'outlined'}
          >
            <CardActionArea onClick={() => setSelectedSpeed('normal')}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">Normal</Typography>
                <Typography variant="caption" color="primary">{gas.normal / 1000000000} gwei</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card
            variant={selectedSpeed === 'fast' ? 'selected' : 'outlined'}
          >
            <CardActionArea onClick={() => setSelectedSpeed('fast')}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">Fast</Typography>
                <Typography variant="caption" color="primary">{gas.fast / 1000000000} gwei</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default React.memo(GasPicker);
