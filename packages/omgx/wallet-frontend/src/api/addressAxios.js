import axios from 'axios'

import { getAllNetworks } from 'util/networkName'

const nw = getAllNetworks()

export const _addressRinkebyAxiosInstance = axios.create({
  baseURL: nw.rinkeby.addressUrl,
})

export const _addressRinkebyOMGXAxiosInstance = axios.create({
  baseURL: nw.rinkeby.addressOMGXUrl,
})

export const _addressLocalAxiosInstance = axios.create({
  baseURL: nw.local.addressUrl,
})

export const _addressLocalOMGXAxiosInstance = axios.create({
  baseURL: nw.local.addressOMGXUrl,
})
