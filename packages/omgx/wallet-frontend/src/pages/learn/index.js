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


import PageHeader from 'components/pageHeader/PageHeader';
import { PageContent } from 'pages/page.style';
import React from 'react';
import {
  Box, Typography
} from '@material-ui/core';


function LearnPage() {

  return (
    <PageContent>
      <PageHeader title="Learn" />
      <Box
        sx={{
          textAlign: 'left',
          width: '100%',
          background: 'linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%)',
          borderRadius: '8px',
          padding: '80px 85px'
        }}
      >
        <Typography variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: '62px',
            lineHeight: '62px'
          }}
        >
          What is Layer 2 ?
        </Typography>
        <Box
          sx={{
            marginTop: '60px',
            textAlign: 'left'
          }}
        >
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 350,
              fontSize: '42px',
              lineHeight: '102%'
            }}
          >
            Why should you use it
          </Typography>

          <Typography
            variant="h2"
            gutterBottom
            sx={{
              flex: 'none',
              order: '1',
              flexGrow: '0',
              fontWeight: 350,
              fontSize: '24px',
              lineHeight: '140%',
              whiteSpace: 'break-all',
              color: 'rgba(255, 255, 255, 0.8)'

            }}
          >
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
          </Typography>

        </Box>
        <Box
          sx={{
            marginTop: '60px',
            textAlign: 'left'
          }}
        >
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 350,
              fontSize: '42px',
              lineHeight: '102%'
            }}
          >
            How to use it
          </Typography>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              margin: '30px 0px',
              fontWeight: 'bold',
              fontSize: '24px',
              lineHeight: '24px'
            }}
          >
            Step 1
          </Typography>

          <Typography
            variant="h2"
            gutterBottom
            sx={{
              flex: 'none',
              order: '1',
              flexGrow: '0',
              fontWeight: 350,
              fontSize: '24px',
              lineHeight: '140%',
              whiteSpace: 'break-all',
              color: 'rgba(255, 255, 255, 0.8)'

            }}
          >
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi"
          </Typography>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              margin: '30px 0px',
              fontWeight: 'bold',
              fontSize: '24px',
              lineHeight: '24px'
            }}
          >
            Step 2
          </Typography>

          <Typography
            variant="h2"
            gutterBottom
            sx={{
              flex: 'none',
              order: '1',
              flexGrow: '0',
              fontWeight: 350,
              fontSize: '24px',
              lineHeight: '140%',
              whiteSpace: 'break-all',
              color: 'rgba(255, 255, 255, 0.8)'

            }}
          >
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi"
          </Typography>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              margin: '30px 0px',
              fontWeight: 'bold',
              fontSize: '24px',
              lineHeight: '24px'
            }}
          >
            Step 3
          </Typography>

          <Typography
            variant="h2"
            gutterBottom
            sx={{
              flex: 'none',
              order: '1',
              flexGrow: '0',
              fontWeight: 350,
              fontSize: '24px',
              lineHeight: '140%',
              whiteSpace: 'break-all',
              color: 'rgba(255, 255, 255, 0.8)'

            }}
          >
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit
          </Typography>

        </Box>
      </Box>
    </PageContent>
  );

}

export default React.memo(LearnPage);

