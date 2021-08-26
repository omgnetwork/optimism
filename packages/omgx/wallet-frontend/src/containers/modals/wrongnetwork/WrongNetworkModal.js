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

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'components/modal/Modal';
import { closeModal } from 'actions/uiAction';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

import { selectNetwork } from 'selectors/setupSelector';
import { Box, Card, Typography } from '@material-ui/core';

function WrongNetworkModal ({ open, onClose }) {

  const masterConfig = useSelector(selectNetwork());
  const dispatch = useDispatch();

  function handleClose () {
    onClose();
    dispatch(closeModal('wrongNetworkModal'));
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      light
      maxWidth="sm"
    >
      <Typography variant="h2" gutterBottom>
        Wrong Network
      </Typography>

      <Typography variant="body1">
        Metamask is set to the wrong network. Please switch Metamask to {masterConfig} to continue.
      </Typography>

      <Box display="flex" sx={{ flexDirection: 'column', alignItems: 'center', mt: 3 }}>
        <Card variant="outlined" sx={{ px: 2, py: 1, minWidth: 200, mb: 1 }}>
          <Typography variant="body1" color="secondary">
            {masterConfig}
          </Typography>
        </Card>
        <ArrowUpwardIcon color="disabled" />
      </Box>
    </Modal>
  );
}

export default React.memo(WrongNetworkModal);
