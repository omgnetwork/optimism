import { styled } from '@material-ui/core/styles'
import { Box, TextField } from '@material-ui/core'

export const Wrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.newStyle ? 'rgba(9, 22, 43, 0.5)' : 'transparente' };
  border-radius: 8px;
  box-shadow: ${(props) => props.newStyle ? '-13px 15px 19px rgba(0, 0, 0, 0.15), inset 53px 36px 120px rgba(255, 255, 255, 0.06)' : 'none' };
  padding: ${(props) => props.newStyle ? '10px 20px' : '0' };
  border: ${(props) => props.newStyle ? '2px solid #5E6170' : 'none' };
`;

export const TextFieldTag = styled(TextField)(({ ...props }) => ({
  '& .MuiInputBase-input': {
    fontSize: props.newStyle ? '24px' : '16px',
    fontWeight: 700,
    opacity: 0.7,
    padding: '0 15px',
  },
  '&:hover': {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
}));

export const UnitContent = styled(Box)`
display: flex;
justify-content: flex-start;
border-right: 1px solid rgba(255,255,255,0.2);
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
  flex: 6,
  [theme.breakpoints.down('md')]: {
    flex: 4,
  },
}));

export const ActionsWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 3;
`;
