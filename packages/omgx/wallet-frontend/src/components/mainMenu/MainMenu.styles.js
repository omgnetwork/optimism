import styled from '@emotion/styled';

export const Menu = styled.div`
  flex: 0 0 260px;
  width: 260px;
  padding-top: 70px;
  padding-left: 40px;
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    margin-left: -40px;
  }

  > a {
    margin-bottom: 50px;
    display: flex;
  }
`

// export const MenuItem = styled(Link)`
//   color: ${props => props.selected ? props.theme.palette.primary.main : "inherit"};
//   background: ${props => props.selected ? 'linear-gradient(90deg, rgba(237, 72, 240, 0.09) 1.32%, rgba(237, 72, 236, 0.0775647) 40.2%, rgba(240, 71, 213, 0) 71.45%)' : 'none'};
//   display: flex;
//   align-items: center;
//   gap: 16px;
//   padding: 20px 10px;
//   padding-left: 40px;
//   position: relative;
//   margin-bottom: 1px;
//   font-weight: ${props => props.selected ? 700 : 'normal'};
//   &:hover {
//     color: ${props => props.theme.palette.primary.main};
//   }
//   &:before {
//     width: 5px;
//     height: 100%;
//     left: 0;
//     top: 0;
//     position: absolute;
//     content: '';
//     background-color: #506DFA;
//     opacity: 0.6;
//     display: ${props => props.selected ? 'block' : 'none'};
//   }
// `
// export const Chevron = styled.img`
//   transform: ${props => props.open ? 'rotate(-90deg)' : 'rotate(90deg)'};
//   transition: all 200ms ease-in-out;
//   height: 20px;
//   margin-bottom: 0;
// `;
