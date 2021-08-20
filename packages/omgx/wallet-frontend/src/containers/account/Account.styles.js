import { styled } from '@material-ui/core/styles'
import { Box, Typography } from "@material-ui/core";

export const WrapperHeading = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
`;

export const TableHeading = styled(Box)(({ theme }) => ({
  padding: "10px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "rgba(255, 255, 255, 0.04);",

  [theme.breakpoints.down('md')]: {
    marginBottom: "5px",
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: "20px",
  },
}));

export const TableHeadingItem = styled(Typography)`
  width: 20%;
  gap: 5px;
  text-align: center;
`;

export const AccountWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    backgroundColor: "transparent",
  },
  [theme.breakpoints.up('md')]: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: "10px",
    padding: "20px",
  },
}));

