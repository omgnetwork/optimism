import { styled } from '@material-ui/core/styles'
import { TextField } from '@material-ui/core'

export const CssTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      // borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      // borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
});
