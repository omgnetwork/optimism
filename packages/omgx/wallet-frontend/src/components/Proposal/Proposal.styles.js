import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const ProposalCard = styled(Box)`
  margin: 10px auto;
  padding: 20px;
  border-radius: 12px;
  background: ${(props) => props.theme.palette.background.secondary};
`;

export const ProposalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

export const Muted = styled(Typography)`
  opacity: 0.7;
`;

export const ProposalContent = styled(Box)`
  display: flex;
  justify-content: space-between;
  opacity: 0.7;
  margin-top: 20px;
`;
