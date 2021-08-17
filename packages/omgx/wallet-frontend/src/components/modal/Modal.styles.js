import { Box } from '@material-ui/core';
import { styled } from '@material-ui/system';
import ModalUnstyled from '@material-ui/unstyled/ModalUnstyled';

export const StyledModal = styled(ModalUnstyled)`
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

export const Backdrop = styled('div')`
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

export const Style = styled(Box)`
  background: ${(props) => props.transparent ? 'transparent' : 'rgba(32, 29, 49, 0.8)'};
  box-shadow: ${(props) => props.transparent ? 'none' : '-13px 15px 39px rgba(0, 0, 0, 0.16), inset 123px 116px 230px rgba(255, 255, 255, 0.03)'};
  backdrop-filter: ${(props) => props.transparent ? 'none' :'blur(66px)'};
  padding: ${(props) => props.transparent ? '0' : '60px'};
  border: 0;
  outline: 0;
  // width: '500px',
  box-sizing: border-box;
  max-width: 100%;
  border-radius: 12px;
`;
