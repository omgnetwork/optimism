import axios from 'axios'

export const _localAddressAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_OMGX_DEPLOYER_API_URL,
})

export const _rinkebyAddressAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_OMGX_DEPLOYER_API_URL,
})
