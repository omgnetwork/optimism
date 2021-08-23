import { styled } from '@material-ui/core/styles'
import { Box, Input, TextField } from '@material-ui/core'

export const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(9, 22, 43, 0.5)',
  borderRadius: '8px',
  boxShadow: '-13px 15px 19px rgba(0, 0, 0, 0.15), inset 53px 36px 120px rgba(255, 255, 255, 0.06)',
  padding: '20px 30px',
  border: '2px solid #5E6170',
  // [theme.breakpoints.down('md')]: {
  // },
  // [theme.breakpoints.up('md')]: {
  // },
}));

export const TextFieldTag = styled(TextField)({
  '& .MuiInputBase-input': {
    fontSize: '24px',
    fontWeight: 700,
    opacity: 0.7,
  }
  // '& .MuiInputBase': {
    // fontWeight: 700,
    // fontSize: '20px',
  // },
});

export const UnitContent = styled(Box)`
display: flex;
justify-content: flex-start;
border-right: 1px solid #212639;
margin-right: 30px;
flex: 2;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const InputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  flex: 6,
  [theme.breakpoints.down('md')]: {
    flex: 4,
  },
}));

export const ActionsWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
  flex: 3;

`;
