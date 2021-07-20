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

import store from 'store';

// export function getFactories () {
//   const myFacotries = localStorage.getItem("NFTFactories")

//   const state = store.getState()
//   return state.nftList;
// }

//simply lists all the info in the nftList
export function getNFTs () {
  const state = store.getState()
  console.log("state.nft:",state.nft)
  return state.nft.list;
}

//simply lists all the info in the nftList
export function getNFTFactories () {
  const state = store.getState()
  console.log("state.nft:",state.nft)
  return state.nft.factory;
}

export async function addNFT ( NFT ) {
  
  console.log("adding NFT to state:", NFT)

  const state = store.getState();
  const UUID = NFT.UUID;

  console.log("state.nft.list:", state.nft.list)
    
  //if we already have looked it up, no need to look up again. 
  if (state.nft.list[UUID]) {
    return state.nft.list[UUID];
  }
  
  const info = {
    UUID: NFT.UUID, 
    owner: NFT.owner, 
    url: NFT.url, 
    mintedTime: NFT.mintedTime, 
    decimals: 0,
    name:  NFT.name, 
    symbol:  NFT.symbol, 
    address: NFT.address
  }

  console.log("nft info:",info)

  store.dispatch({
    type: 'NFT/GET/SUCCESS',
    payload: info
  })

  return info

}

export async function addNFTFactory ( Factory ) {

  const state = store.getState();
  //const UUID = NFTproperties.UUID;
    
  //if we already have looked it up, no need to look up again. 
  if (state.nft.factories[Factory.address]) {
    return state.nft.factories[Factory.address];
  }
  
  const factory = {
    owner: Factory.owner, 
    address: Factory.address,
    mintedTime: Factory.mintedTime, 
    decimals: 0,
    symbol:  Factory.symbol, 
    layer: Factory.layer,
    name: Factory.name, 
  }

  console.log("nft factory:",factory)

  store.dispatch({
    type: 'NFT/CREATEFACTORY/SUCCESS',
    payload: factory
  })

  return factory;

}