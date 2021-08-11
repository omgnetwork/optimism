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
import { styled } from '@material-ui/system';
import ModalUnstyled from '@material-ui/unstyled/ModalUnstyled';
import {
  Fade,
  Typography,
  Grid,
  Container,
  IconButton
} from '@material-ui/core';
import { ReactComponent as CloseIcon } from './../../images/icons/close-modal.svg';

const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  `;

const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(8, 22, 44, 0.7);
  backdrop-filter: blur(10px);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  background: 'rgba(32, 29, 49, 0.8)',
  boxShadow: '-13px 15px 39px rgba(0, 0, 0, 0.16), inset 123px 116px 230px rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(66px)',
  padding: '60px',
  border: 'none',
  outline: 'none',
  width: '500px',
  boxSizing: 'border-box',
  maxWidth: '100%',
  borderRadius: '12px',
};

function _Modal ({
  children,
  open,
  onClose,
  light,
  title
}) {

  return (
    <StyledModal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={onClose}
      // closeAfterTransition
      BackdropComponent={Backdrop}
    >
      <Fade in={open}>
        <Container maxWidth="lg">
          <Grid container>
            <Grid item xs={12} md={3}>
              <Typography variant="h1" component="h3" sx={{ marginRight: 4}}>{title}</Typography>
            </Grid>

            <Grid item xs={12} md={6} sx={style}>
              {children}
            </Grid>

            <Grid item xs={12} md={3}>
              {/* <Box sx={{ display: "flex", marginLeft: 2 }}> */}
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              {/* </Box> */}
            </Grid>
          </Grid>
        </Container>
      </Fade>
    </StyledModal>
  );
}

export default _Modal;
