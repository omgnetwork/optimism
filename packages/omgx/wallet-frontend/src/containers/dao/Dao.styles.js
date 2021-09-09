import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const Container = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.secondary};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 400px;
  min-height: 200px;
  flex: 1;

  div {
    text-align: center;
    p {
      margin-bottom: 10px;
    }
  }
`;

export const HelpText = styled(Typography)`
  opacity: 0.7;
  margin-top: 10px;
  margin-bottom: 20px;
`;
