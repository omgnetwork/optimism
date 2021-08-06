import styled from '@emotion/styled';

export const ThemeSwitcherTag = styled.div`
  margin-left: -15px;
  margin-top: 100px;
  display: flex;
`;

export const Button = styled.button`
  border: 0;
  padding: 10px;
  border-radius: 16px;
  background-color: ${(props) => props.selected ? props.theme.palette.action.disabledBackground : 'transparent'};
  cursor: pointer;
  transition: all .2s ease-in-out;
`;
