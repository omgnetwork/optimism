import styled from "@emotion/styled";
import { Box } from '@material-ui/core';

export const MobileNavTag = styled.div`
  padding-top: 20px;
  padding-left: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const Style = styled(Box)`
  background-color: ${(props) => props.theme.palette.mode === 'light' ? 'white' : '#061122' };
  height: 100%;
`;
