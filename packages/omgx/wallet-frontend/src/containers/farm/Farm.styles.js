import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const TableHeading = styled(Box)(({ theme }) => ({
  padding: "20px",
  borderTopLeftRadius: "6px",
  borderTopRightRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#0D182A",

  [theme.breakpoints.down('md')]: {
    marginBottom: "5px",
  },
}));

export const TableHeadingItem = styled(Typography)`
  width: 20%;
  gap: 5px;
  text-align: center;
  opacity: 0.7;
`;
