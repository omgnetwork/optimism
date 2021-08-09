import React from 'react';
import { styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';

const ButtonM = styled(({ outlined, ...other }) => <Button {...other} />)({
  background: (props) => props.outlined ? 'none' : '#4A6FEF',
  border: (props) =>
    props.outlined
      ? '1px solid #fff'
      : 'none',
  color: "#FFF",
  textTransform: "none",
  borderRadius: "8px",
  padding: "8px 32px",
  filter: "drop-shadow(0px 0px 7px rgba(73, 107, 239, 0.35))",

  '&:hover': {
    background: (props) => props.outlined ? '#4A6FEF' : 'none',
  },
});

function ButtonMUI ({ children, outlined }) {
  return (
    <ButtonM outlined={outlined}>
      {children}
    </ButtonM>
  )
}

export default React.memo(ButtonMUI);
