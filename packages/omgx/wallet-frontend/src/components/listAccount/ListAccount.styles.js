import { styled } from '@material-ui/core/styles'
import { Box } from '@material-ui/core';

export const Content = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 10px;
  background-color: #1C2738;
  padding: 10px;
  border-radius: 6px;
`;

export const DropdownWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 10px;
`;

export const TableCell = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20%;
`;

export const TableBody = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  text-align: center;
`;
