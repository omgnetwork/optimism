import React, {useEffect, useState} from 'react'
import { ReactComponent as Logo } from './../../images/logo-boba.svg'
import * as S from "./MainMenu.styles"
import { Link } from 'react-router-dom'
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher'
import LayerSwitcher from './layerSwitcher/LayerSwitcher'
import MenuItems from './menuItems/MenuItems'
import { useTheme } from '@emotion/react'
import { Container, Drawer, IconButton, useMediaQuery } from '@material-ui/core'
import WalletAddress from 'components/walletAddress/WalletAddress'
import { makeStyles } from '@material-ui/styles'
import { ReactComponent as CloseIcon } from './../../images/icons/close-modal.svg'
import { ReactComponent as NavIcon } from './../../images/icons/nav-collapsed.svg'

const useStyles = makeStyles({
  root: {
    width: "100%",
    color: "f00",
  },
});

function MainMenu ({ pageDisplay, handleSetPage }) {
  const themeFromLocalStorage = localStorage.getItem('theme');
  const [light, setLight] = useState(themeFromLocalStorage === 'light');
  const [ open, setOpen ] = useState(false);

  const classes = useStyles()

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }, [light]);

  return (
    <>
      {isMobile ? (
        <Container>
          <S.MobileNavTag>
            <NavIcon onClick={() => setOpen(!open)} />

            <Drawer open={open} onClose={() => setOpen(false)} classes={{paper: classes.root}}>
              <S.StyleDrawer theme={theme}>

                <S.DrawerHeader>
                  <S.WrapperCloseIcon>
                    <Link to="/" style={{ display: "flex"}}>
                      <Logo width={150} />
                    </Link>

                    <IconButton size="small" onClick={() => setOpen(false)}>
                      <CloseIcon />
                    </IconButton>
                  </S.WrapperCloseIcon>

                  <NetworkSwitcher />
                  <LayerSwitcher />
                </S.DrawerHeader>

                <MenuItems pageDisplay={pageDisplay} handleSetPage={handleSetPage} />
              </S.StyleDrawer>
            </Drawer>

            <WalletAddress />

          </S.MobileNavTag>
        </Container>
      ) : (
        <S.Menu>
          <Link to="/" onClick={() => handleSetPage("AccountNow")}>
            <Logo />
          </Link>
          <NetworkSwitcher />
          <LayerSwitcher />
          <MenuItems pageDisplay={pageDisplay} handleSetPage={handleSetPage} />
          {/* <ThemeSwitcher light={light} setLight={setLight} /> */}
        </S.Menu>
      )}
    </>
  );
}

export default MainMenu;
