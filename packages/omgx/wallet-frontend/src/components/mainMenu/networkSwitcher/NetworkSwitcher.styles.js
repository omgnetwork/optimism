import styled from '@emotion/styled';

export const WalletPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  @include mobile {
    font-size: 0.9em;
    padding: 10px;
  }
`;

export const WallerPickerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  @include mobile {
    flex-direction: column;
  }
  img {
    height: 20px;
  }
`;

export const Menu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 1;
  position: relative;
  @include mobile {
    width: 100%;
    justify-content: space-between;
  }
  a {
    cursor: pointer;
  }
`;

export const Chevron = styled.img`
  transform: ${props => props.open ? 'rotate(-90deg)' : 'rotate(90deg)'};
  transition: all 200ms ease-in-out;
  height: 20px;
  margin-bottom: 0;
`;

export const Dropdown = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 27px;
  @include mobile {
    right: unset;
    left: 10px;
    width: 150px;
  }
  a {
    background-color: $gray3;
    transition: all 200ms ease-in-out;
    padding: 10px 15px;
    /* cursor: pointer; */
    &:hover {
      background-color: $gray2;
    }
  }
  > div {
    cursor: pointer;
    background-color: rgba(0,0,0,0.9);
    border-radius: 5px;
    margin-bottom: 1px;
    padding-left: 12px;
    margin-left: 20px;
  }
`;

export const NetWorkStyle = styled.div`
  /* margin-left: 10px; */
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: ${(props) => props.walletEnabled !== false ? 'inherit' : 'pointer'};
`;
