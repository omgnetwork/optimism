import styled from '@emotion/styled';

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
    color: #fff;
    opacity: 0.9;
`
export const CellSubTitle = styled.div`
    font-weight: normal;
    font-size: 18px;
    line-height: 112%;
    color: rgba(255, 255, 255, 0.7);
    opacity: 0.9;
`
