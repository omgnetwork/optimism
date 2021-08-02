import styled from '@emotion/styled';

export const MainBar = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-top: 30px;
  margin-bottom: 15px;
  @include mobile {
    flex-direction: column;
    align-items: center;
    margin-top: 0px;
  }
`;

export const MainLeft = styled.div`
  width: 520px;
  font-size: 1.3em;
  color: $gray3;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 3px;
  @include mobile {
    width: unset;
    font-size: 1.2em;
    padding-bottom: 20px;
    padding-left: 20px;
  }

  h2 {
    font-size: 62px;
    line-height: 62px;
    color: #fff;
    font-weight: 700;
  }

  p {
    font-size: 24px;
    line-height: 38px;
    font-weight: 300;
  }
`;

export const MainRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

export const DisabledMM = styled.div`
  padding-top: 20px;
  font-size: 0.9em;
  color: $red;
`;


export const WalletPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  font-family: 'Messina';
  margin-bottom: 50px;

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
    margin-bottom: 20px;
    height: 60px;
    @include mobile {
      height: 50px;
    }
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
    cursor: pointer;
    &:hover {
      background-color: $gray2;
    }
  }
`;

export const NetWorkStyle = styled.div`
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

export const Indicator = styled.div`
  margin-right: 5px;
  width: 5px;
  height: 13px;
  background-color: #2a308e;
  border-radius: 4px;
`;

export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 20px;
  color: $gray4;
`;
