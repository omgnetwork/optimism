import React, { useState, useEffect } from 'react'
import getBlockchain from '../../services/ethereum.js'
import {ethers} from "ethers"
import "./boringBoba.css"



    async function getToppings() {
        const {bobaMenu} = await getBlockchain();
        let toppingCount = await bobaMenu.toppingIndex();
        let toppingList = [];
        for(let i = 0; i < toppingCount; i++){
            let new_topping = {};
            let tempStore = await bobaMenu.toppings(i);
            new_topping["topping"] = ethers.utils.parseBytes32String(tempStore.topping);
            new_topping["commonScore"] = parseInt(tempStore.commonScore._hex);
            new_topping["color"] = []
            let tempColor = await bobaMenu.getColorOrGradient(i, false, true);
            tempColor.forEach((element) => {
                new_topping["color"].push(parseInt(element._hex));
            })
            toppingList.push(new_topping);
        }
        return toppingList;
    }
    async function getFlavors(){
        const {bobaMenu} = await getBlockchain();
        let flavorCount = await bobaMenu.flavorIndex();
        let flavorList = [];
        for(let i = 0; i < flavorCount; i++){
            let new_flavor = {};
            let tempStore = await bobaMenu.flavors(i);
            new_flavor["flavor"] = ethers.utils.parseBytes32String(tempStore.flavor);
            new_flavor["commonScore"] = parseInt(tempStore.commonScore._hex);
            new_flavor["color"] =  [];
            let tempColor = await bobaMenu.getColorOrGradient(i, true, true);
            new_flavor["gradient"] = [];
            let tempGradient = await bobaMenu.getColorOrGradient(i, true, false);
            tempColor.forEach((element) => {
                new_flavor["color"].push(parseInt(element._hex));
            });
            tempGradient.forEach((element) => {
                new_flavor["gradient"].push(parseInt(element._hex));
            });

            flavorList.push(new_flavor);
        }
        return flavorList;
    }

export {getToppings, getFlavors};