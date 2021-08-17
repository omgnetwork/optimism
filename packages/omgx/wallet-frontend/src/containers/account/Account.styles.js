import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const WrapperHeading = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
`;

export const TableHeading = styled(Box)`
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TableHeadingItem = styled(Typography)`
  width: 20%;
  gap: 5px;
  text-align: center;
`;


