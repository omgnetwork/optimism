import { styled } from '@material-ui/core/styles'
import { Box } from '@material-ui/core';

export const DropdownWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background-color: #0F1B2F;
  border-radius: 12px;
  text-align: center;
`;

export const ListItems = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center
`;

