import styled from '@emotion/styled';
import {Typography, Box} from '@material-ui/core'

export const HistoryContainer = styled.div`
    background: linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%);
    border-radius: 8px;
    margin-bottom: 20px;
`;

export const TableHeading = styled(Box)`
  padding: 10px 20px;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export const TableHeadingItem = styled(Typography)`
  width: 20%;
  gap: 5px;
  text-align: flex-start;
  color: rgba(255, 255, 255, 0.7);
`;


export const Content = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  padding: 10px 20px;
  border-radius: 6px;
`;