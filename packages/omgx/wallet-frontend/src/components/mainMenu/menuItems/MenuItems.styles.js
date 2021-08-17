import styled from "@emotion/styled";
import { Link } from 'react-router-dom';

export const Nav = styled.nav`
  width: 220px;
  max-width: 50vw;
  ul {
    list-style-type: none;
    @media (max-width: 960px) {
      padding-left: 0;
    }
    ul {
      margin-left: 0;
      list-style-type: none;
      @media (max-width: 960px) {
        padding-left: 0;
        margin-top: 0;
      }
      li a {
        padding-left: 80px;
      }
    }
 }
 @media (max-width: 960px) {
    background: ${props => props.theme.palette.background.default};
  }
`;

// export const MenuItem = styled(Link)`
export const MenuItem = styled.div`
  color: ${props => props.selected ? props.theme.palette.secondary.main : "inherit"};
  background: ${props => props.selected ? 'linear-gradient(90deg, rgba(237, 72, 240, 0.09) 1.32%, rgba(237, 72, 236, 0.0775647) 40.2%, rgba(240, 71, 213, 0) 71.45%)' : 'none'};
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 10px;
  padding-left: 40px;
  position: relative;
  margin-bottom: 1px;
  font-weight: ${props => props.selected ? 700 : 'normal'};
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.palette.secondary.main};
  }
  &:before {
    width: 5px;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    content: '';
    background-color: #506DFA;
    opacity: 0.6;
    display: ${props => props.selected ? 'block' : 'none'};
  }
`
export const Chevron = styled.img`
  transform: ${props => props.open ? 'rotate(-90deg)' : 'rotate(90deg)'};
  transition: all 200ms ease-in-out;
  height: 20px;
  margin-bottom: 0;
`;
