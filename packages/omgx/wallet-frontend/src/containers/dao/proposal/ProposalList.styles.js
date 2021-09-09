import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const ListContainer = styled(Box)`
  overflow-y: auto;
  margin: 10px auto;
  border-radius: 8px;
  padding: 20px;
  background: ${(props) => props.theme.palette.background.secondary};
`;

export const LoadingContainer = styled(Box)`
  margin: auto;
  text-align: center;
  width: 100%;
`;

export const ContainerAction = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin: 10px auto;
  flex-direction: row;
`;

