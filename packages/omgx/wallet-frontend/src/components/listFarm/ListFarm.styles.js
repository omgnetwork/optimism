import { styled } from '@material-ui/core/styles'
import { Box } from '@material-ui/core';

export const DropdownWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background-color: #0F1B2F;
  border-radius: 12px;
  text-align: center;
`;

export const WrapperItems = styled(Box)`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  gap: 5px;
  /* width: 50%; */
`;

export const ListItems = styled(Box)`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'row' : 'column'};
  gap: ${props => props.isMobile ? '10px' : '5px'} ;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const WrapperActions = styled(Box)`
  opacity: ${props => props.disabled ? '0.4' : '1.0'};
  cursor: pointer;
`;

export const DropdownContent = styled(Box)`
  display: flex;
  justify-content: space-between;
  gap: ${props => props.isMobile ? "0" : "16px"};
  flex-direction: ${props => props.isMobile ? "column" : "row"}; ;
`;
