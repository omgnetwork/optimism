import { Box } from '@material-ui/core';
import { styled } from '@material-ui/system';

export const StyleCreateTransactions = styled(Box)`
  background: rgba(32, 29, 49, 0.8);
  box-shadow: -13px 15px 39px rgba(0, 0, 0, 0.16), inset 123px 116px 230px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(66px);
  padding: 40px;
  border-radius: 12px;
`;

export const Balance = styled(Box)`
  background: rgba(9, 22, 43, 0.5);
  box-shadow: -13px 15px 39px rgba(0, 0, 0, 0.16), inset 53px 36px 120px rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  width: 100%;
  /* position: relative; */
`;

export const ContentBalance = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 20px;
`;

export const TransactionsButton = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border-radius: 50%;
  box-shadow: 0 0 0 15px rgb(32 29 49 / 80%);
  margin: auto;
  /* border: 12px solid rgba(32, 29, 49, 0.8); */
  /* position: absolute;
  top: 0;
  left: 0; */
`;
