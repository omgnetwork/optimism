import styled from '@emotion/styled';
import BgWallet from "../../images/backgrounds/bg-wallet.png";

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

export const WalletCard = styled.div`
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  padding: 40px;
  background: url(${BgWallet});
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
`;

export const WalletCardHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  div {
    background-color: #091426;
    border-radius: 50%;
    font-size: 16px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h4 {
    font-size: 38px;
    font-weight: 200;
    margin: 0px;
  }
`;

export const DescriptionContent = styled.div`
  display: flex;
  align-items: center;
`;
