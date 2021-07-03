import axios from 'axios'

/*
Please see networkName.js for the right way to get all the endpoints
For example...
*/

import { getAllNetworks } from 'util/networkName'

const nw = getAllNetworks()

export const _addressRinkebyAxiosInstance = axios.create({
  baseURL: nw.rinkeby.L1.addressUrl,
})

export const _addressRinkebyOMGXAxiosInstance = axios.create({
  baseURL: nw.rinkeby.L1.addressOMGXUrl,
})

export const _addressLocalAxiosInstance = axios.create({
  baseURL: nw.local.L1.addressXUrl,
})

export const _addressLocalOMGXAxiosInstance = axios.create({
  baseURL: nw.local.L1.addressOMGXUrl,
})
