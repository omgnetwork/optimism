// const VERSION = '1.0.10'
// const SERVICE_API_URL = 'https://api-service.rinkeby.omgx.network/'
// TODO: fixed once got an input

import rinkebyServiceAxiosInstance from 'api/rinkebyServiceAxios'

export const checkVersion = () => {
  // fetch(SERVICE_API_URL + 'get.wallet.version', {
  //   method: 'GET',
  //   headers: {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  // })

  rinkebyServiceAxiosInstance.get('get.wallet.version').then((res) => {
    if (res.status === 201) {
      // return res.json()
      if (res.data !== '') {
        if (res.data.version !== process.env.REACT_APP_WALLET_VERSION) {
          caches.keys().then(async function (names) {
            await Promise.all(names.map((name) => caches.delete(name)))
          })
        }
      }
    } else {
      return ''
    }
  })
  // .then((data) => {
  //   if (data !== '') {
  //     if (data.version !== VERSION) {
  //       caches.keys().then(async function (names) {
  //         await Promise.all(names.map((name) => caches.delete(name)))
  //       })
  //     }
  //   }
  // })
}
