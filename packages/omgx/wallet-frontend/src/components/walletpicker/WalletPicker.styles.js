import styled from '@emotion/styled';
import BgWallet from "../../images/backgrounds/bg-wallet.png";

export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 20px;
  color: $gray4;
`;

export const WalletCard = styled.div`
  border-top-left-radius: 4px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px;
  padding: 40px;
  background: url(${BgWallet});
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
  cursor: pointer;
`;

export const PlusIcon = styled.div`
    background-color: #091426;
    border-radius: 50%;
    font-size: 16px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const DescriptionContent = styled.div`
  display: flex;
  align-items: center;
`;
