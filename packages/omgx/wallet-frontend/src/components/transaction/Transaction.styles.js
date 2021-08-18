import styled from '@emotion/styled';
import {Typography, Box} from '@material-ui/core'

export const DropdownWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 10px;
`;

export const TableCell = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 20%;
`;

export const TableBody = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 5px;
  text-align: center;
`;
