import styled from '@emotion/styled';
import { TableCell, TableRow } from '@material-ui/core';
export const PageContent = styled.div`
    width: 90%;
    margin: 0px auto;
    height: 100vh;
    overflow: auto;
`;

export const PageTitle = styled.h1`
    font-weight: bold;
    font-size: 62px;
    line-height: 62px;
    margin: 0px
`;


// TODO:  Move me to the table specific folders.

export const Th = styled.div`
    font-weight: normal;
    font-size: 18px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.7);
    flex: none;
    order: 0;
    flex-grow: 0;
    margin: 0px 6px;
    svg {
        margin-left: 5px;
    }
`

export const CellTitle = styled.div`
    font-weight: normal;
    font-size: 24px;
    line-height: 24px;
    color: ${props => props.color ? props.color : '#fff'};
    opacity: 0.9;
    margin-bottom: 7px;
`
export const CellSubTitle = styled.div`
    font-weight: normal;
    font-size: 18px;
    line-height: 112%;
    color: rgba(255, 255, 255, 0.7);
    opacity: 0.9;
`
// TODO: move to the common style file.
export const Chevron = styled.img`
  transform: ${props => props.open ? 'rotate(-90deg)' : 'rotate(90deg)'};
  transition: all 200ms ease-in-out;
  height: 20px;
  margin-bottom: 0;
`;

export const StyledTableRow = styled(TableRow)`
    padding: 0px 30px;
    &.expand{
        background: rgba(255, 255, 255, 0.03);
        td:first-child { border-top-left-radius: 16px; }
        td:last-child { border-top-right-radius: 16px; }
        td {
            box-shadow: none;
        }
    }
    &:last-child {
        td {
            box-shadow: none;
        }
    }
    &.header{
        
        th {
            box-shadow: none;
        }
    }
    &.divider {
        height: 0px;
        td {
            padding: 0px;
        }
    }
    &.hidden {
        height: 0px;
        td {
            padding: 0px;
        }
        .value {
            marginLeft: 10px;
            color: rgba(255, 255, 255, 0.7);
        }
    }
    &.detail {
        background: rgba(255, 255, 255, 0.03);

        td:first-child { border-bottom-left-radius: 16px; }
        td:last-child { border-bottom-right-radius: 16px; }

        .value {
            marginLeft: 10px;
            color: rgba(255, 255, 255, 0.7);
        }
    }
`
export const StyledTableCell = styled(TableCell)`
    border: none;
    padding-top: 20px;
    color: ${props => props.color ? props.color : '#fff'};
    box-shadow: 0px 1px 0px rgb(255 255 255 / 5%)
`