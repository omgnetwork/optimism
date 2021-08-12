/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import {
  Box, Button, Collapse, Grid, Tab, Table, TableBody, TableContainer, TableHead, Tabs, Typography
} from '@material-ui/core';
import DownIcon from 'components/icons/DownIcon';
import L2ToL1Icon from 'components/icons/L2ToL1Icon';
import LinkIcon from 'components/icons/LinkIcon';
import SearchIcon from 'components/icons/SearchIcon';
import SortIcon from 'components/icons/SortIcon';
import UpIcon from 'components/icons/UpIcon';
import PageHeader from 'components/pageHeader/PageHeader';
import React, { useState } from 'react';
import {
  CellSubTitle, CellTitle, PageContent, StyledTableCell,
  StyledTableRow
} from '../page.style';


function HistoryPage() {

  const [currentTab, setCurrentTab] = useState(0);
  const [expandRow, setExpandRow] = useState(false);

  const historyTabs = ['All', 'Deposits', 'Exits']

  const handleTabChange = (event, newValue) => {
    console.log([event, newValue]);
    setCurrentTab(newValue);
  }

  return (
    <PageContent>
      <PageHeader title="Transaction History" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >

        <Tabs value={currentTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          aria-label="transaction tabs"
        >
          {historyTabs.map((label) => (<Tab
            sx={{
              maxWidth: 'unset',
              minWidth: 'unset',
              alignItems: 'flex-start',
              margin: '0px 5px',
              height: '24px',
              fontWeight: 'normal',
              fontSize: '24px',
              lineHeight: '24px',
              textTransform: 'capitalize'
            }}
            label={label} />))}
        </Tabs>
        <SearchIcon color="#F0A000" />
      </Box>

      <TableContainer
        sx={{
          marginTop: '30px',
          textAlign: 'left',
          width: '100%',
          background: 'linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%)',
          borderRadius: '8px',
          padding: '20px 0px'
        }}
      >
        <Table>
          <TableHead
            sx={{
              padding: '0px 55px',
            }}
          >
            <StyledTableRow
              className="header"
            >
              <StyledTableCell color="rgba(255, 255, 255, 0.7)">
                <Grid
                  container
                  direction='row'
                  justify='space-between'
                  alignItems='center'
                >
                  <span>Transaction</span>
                </Grid>
              </StyledTableCell>
              <StyledTableCell color="rgba(255, 255, 255, 0.7)">
                <Grid
                  container
                  direction='row'
                  justify='space-around'
                  alignItems='center'
                >
                  <span
                    style={{
                      marginRight: '5px'
                    }}
                  >Result</span>
                  <SortIcon />
                </Grid>
              </StyledTableCell>
              <StyledTableCell color="rgba(255, 255, 255, 0.7)">
                <Grid
                  container
                  direction='row'
                  justify='space-around'
                  alignItems='center'
                >
                  <span
                    style={{
                      marginRight: '5px'
                    }}
                  >My Deposits</span>
                  <SortIcon />
                </Grid>
              </StyledTableCell>
              <StyledTableCell color="rgba(255, 255, 255, 0.7)">
                <Grid
                  container
                  direction='row'
                  justify='space-around'
                  alignItems='center'
                >
                  <span
                    style={{
                      marginRight: '5px'
                    }}
                  >External Information</span>
                  <SortIcon />
                </Grid>
              </StyledTableCell>
              <StyledTableCell color="rgba(255, 255, 255, 0.7)">
                <Grid
                  container
                  direction='row'
                  justify='space-between'
                  alignItems='center'
                >
                  <span>More</span>
                </Grid>
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              <StyledTableRow
                className={!!expandRow ? 'expand' : ''}
              >
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <L2ToL1Icon />
                    <Box
                      sx={{
                        marginLeft: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> L2 - L1 Exit </CellTitle>
                      <CellSubTitle> Fast Offramp </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle color="#06D3D3"> Swapped </CellTitle>
                      <CellSubTitle> Aug 6, 2021 11:56 AM </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> Block 9066690 </CellTitle>
                      <CellSubTitle> Block 9066690 </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Button
                      startIcon={<LinkIcon />}
                      variant="outlined"
                      color="primary">
                      Advanced Details
                    </Button>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    sx={{
                      cursor: 'pointer'
                    }}
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                    onClick={() => setExpandRow(!expandRow)}
                  >

                    {
                      !!expandRow ?
                        <UpIcon /> : <DownIcon />
                    }
                  </Grid>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow
                className={!!expandRow ? "detail" : 'hidden'}
              >
                <StyledTableCell
                  colSpan="5"
                >
                  <Collapse
                    in={expandRow}
                  >

                    <Box
                      sx={{
                        background: 'rgba(9, 22, 43, 0.5)',
                        borderRadius: '12px',
                        padding: '30px',
                      }}
                    >

                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            0xb62379...de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 Block
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            9066690
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            Block Has
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xb62379edc2c76cbe24a01885ce92dd3c3690b5f3a425ba2955abfbae60de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 From
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xbfcea3b73312c77edf5158812fac88871c50004c
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 To
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0x2c12649a5a4fc61f146e0a3409f3e4c7fbed15dc
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </StyledTableCell>
              </StyledTableRow>
            </>
            <>
              <StyledTableRow
                className={!!expandRow ? 'expand' : ''}
              >
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <L2ToL1Icon />
                    <Box
                      sx={{
                        marginLeft: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> L2 - L1 Exit </CellTitle>
                      <CellSubTitle> Fast Offramp </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle color="#06D3D3"> Swapped </CellTitle>
                      <CellSubTitle> Aug 6, 2021 11:56 AM </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> Block 9066690 </CellTitle>
                      <CellSubTitle> Block 9066690 </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Button
                      startIcon={<LinkIcon />}
                      variant="outlined"
                      color="primary">
                      Advanced Details
                    </Button>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    sx={{
                      cursor: 'pointer'
                    }}
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                    onClick={() => setExpandRow(!expandRow)}
                  >

                    {
                      !!expandRow ?
                        <UpIcon /> : <DownIcon />
                    }
                  </Grid>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow
                className={!!expandRow ? "detail" : 'hidden'}
              >
                <StyledTableCell
                  colSpan="5"
                >
                  <Collapse
                    in={expandRow}
                  >

                    <Box
                      sx={{
                        background: 'rgba(9, 22, 43, 0.5)',
                        borderRadius: '12px',
                        padding: '30px',
                      }}
                    >

                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            0xb62379...de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 Block
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            9066690
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            Block Has
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xb62379edc2c76cbe24a01885ce92dd3c3690b5f3a425ba2955abfbae60de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 From
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xbfcea3b73312c77edf5158812fac88871c50004c
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 To
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0x2c12649a5a4fc61f146e0a3409f3e4c7fbed15dc
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </StyledTableCell>
              </StyledTableRow>
            </>
            <>
              <StyledTableRow
                className={!!expandRow ? 'expand' : ''}
              >
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <L2ToL1Icon />
                    <Box
                      sx={{
                        marginLeft: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> L2 - L1 Exit </CellTitle>
                      <CellSubTitle> Fast Offramp </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle color="#06D3D3"> Swapped </CellTitle>
                      <CellSubTitle> Aug 6, 2021 11:56 AM </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> Block 9066690 </CellTitle>
                      <CellSubTitle> Block 9066690 </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Button
                      startIcon={<LinkIcon />}
                      variant="outlined"
                      color="primary">
                      Advanced Details
                    </Button>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    sx={{
                      cursor: 'pointer'
                    }}
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                    onClick={() => setExpandRow(!expandRow)}
                  >

                    {
                      !!expandRow ?
                        <UpIcon /> : <DownIcon />
                    }
                  </Grid>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow
                className={!!expandRow ? "detail" : 'hidden'}
              >
                <StyledTableCell
                  colSpan="5"
                >
                  <Collapse
                    in={expandRow}
                  >

                    <Box
                      sx={{
                        background: 'rgba(9, 22, 43, 0.5)',
                        borderRadius: '12px',
                        padding: '30px',
                      }}
                    >

                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            0xb62379...de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 Block
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            9066690
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            Block Has
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xb62379edc2c76cbe24a01885ce92dd3c3690b5f3a425ba2955abfbae60de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 From
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xbfcea3b73312c77edf5158812fac88871c50004c
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 To
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0x2c12649a5a4fc61f146e0a3409f3e4c7fbed15dc
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </StyledTableCell>
              </StyledTableRow>
            </>
            <>
              <StyledTableRow
                className={!!expandRow ? 'expand' : ''}
              >
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <L2ToL1Icon />
                    <Box
                      sx={{
                        marginLeft: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> L2 - L1 Exit </CellTitle>
                      <CellSubTitle> Fast Offramp </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle color="#06D3D3"> Swapped </CellTitle>
                      <CellSubTitle> Aug 6, 2021 11:56 AM </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CellTitle> Block 9066690 </CellTitle>
                      <CellSubTitle> Block 9066690 </CellSubTitle>
                    </Box>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                  >
                    <Button
                      startIcon={<LinkIcon />}
                      variant="outlined"
                      color="primary">
                      Advanced Details
                    </Button>
                  </Grid>
                </StyledTableCell>
                <StyledTableCell>
                  <Grid
                    sx={{
                      cursor: 'pointer'
                    }}
                    container
                    direction='row'
                    justify='space-between'
                    alignItems='center'
                    onClick={() => setExpandRow(!expandRow)}
                  >

                    {
                      !!expandRow ?
                        <UpIcon /> : <DownIcon />
                    }
                  </Grid>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow
                className={!!expandRow ? "detail" : 'hidden'}
              >
                <StyledTableCell
                  colSpan="5"
                >
                  <Collapse
                    in={expandRow}
                  >

                    <Box
                      sx={{
                        background: 'rgba(9, 22, 43, 0.5)',
                        borderRadius: '12px',
                        padding: '30px',
                      }}
                    >

                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            0xb62379...de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 Block
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            9066690
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            Block Has
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xb62379edc2c76cbe24a01885ce92dd3c3690b5f3a425ba2955abfbae60de1be9
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 From
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0xbfcea3b73312c77edf5158812fac88871c50004c
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            L1 To
                          </Typography>
                        </Grid>
                        <Grid xs={10}>
                          <Typography variant="body1" className="value" >
                            0x2c12649a5a4fc61f146e0a3409f3e4c7fbed15dc
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </StyledTableCell>
              </StyledTableRow>
            </>
          </TableBody>
        </Table>
      </TableContainer>
    </PageContent>
  );

}

export default React.memo(HistoryPage);
