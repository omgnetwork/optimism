import React from 'react';
import Button from '@material-ui/core/Button';

function ButtonMUI ({ children, variant, color, size, disabled, onClick}) {
  return (
    <Button variant={variant} color={color} size={size} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}

export default React.memo(ButtonMUI);
