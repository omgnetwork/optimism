import { Box } from '@material-ui/core';
import { styled } from '@material-ui/system';

export const StyleCreateTransactions = styled(Box)`
  background: rgba(32, 29, 49, 0.8);
  box-shadow: -13px 15px 39px rgba(0, 0, 0, 0.16), inset 123px 116px 230px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(66px);
  padding: 40px;
  border-radius: 12px;
`;

export const StyleStages = styled(Box)`
  box-shadow: 10px -6px 234px rgba(1, 0, 74, 0.55), inset 33px 16px 80px rgba(255, 255, 255, 0.06);
  background: rgba(9, 22, 43, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  padding: 20px 40px;
  margin-top: 50px;
`;
