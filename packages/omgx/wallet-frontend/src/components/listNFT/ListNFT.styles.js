import { styled } from '@material-ui/core/styles'
import { Box, Typography } from '@material-ui/core'

export const Wrapper = styled(Box)`
  width: 100%;
  border-radius: 8px;
  background-color: ${props => props.theme.palette.background.secondary};
  overflow: hidden;
`;

export const NFTTitle = styled(Typography)`
  font-weight: 700;
  margin-bottom: 16px;
`;

export const NFTItem = styled(Typography)`
  margin-bottom: 8px;
`;

export const DropdownWrapper = styled(Box)`
  padding: 0 24px 24px 24px;
`;

