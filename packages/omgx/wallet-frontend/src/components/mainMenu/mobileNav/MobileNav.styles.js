import styled from "@emotion/styled";
import { Box } from '@material-ui/core';

export const MobileNavTag = styled.div`
  padding: 40px 0;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
`;

export const Style = styled(Box)`
  background-color: ${(props) => props.theme.palette.mode === 'light' ? 'white' : '#061122' };
  height: 100%;
`;
