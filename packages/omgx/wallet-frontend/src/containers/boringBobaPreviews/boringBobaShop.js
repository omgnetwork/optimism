import React, { useState, useEffect } from 'react'
import getBlockchain from '../../services/ethereum.js'
import "./boringBoba.css"
import {getToppings, getFlavors} from './bobaMenuProcess'
import BoringBoba from './boringBoba.js'
import { CompareSharp } from '@material-ui/icons';


function BoringBobaShop() {
    const [ toppings, setToppings ] = useState([]);
    const [flavors, setFlavors] = useState([]);
    const x = 20;
    const y = 200;

    useEffect(() => {
        const init = async () => {
            const newToppings  = await getToppings();
            const newFlavors =  await getFlavors();
            setToppings(prevToppings => prevToppings = newToppings);
            setFlavors(prevFlavors => prevFlavors = newFlavors);
        }
        init();

    }, [flavors, toppings]);

    if(toppings[0] == undefined || flavors[0] == undefined){
        return (<div>
            <h1>
                Flavor and topping have still not been defined!
            </h1>
        </div>)
    }

    console.log(`Toppings: ${JSON.stringify(toppings)}`);
    console.log(`Flavors: ${JSON.stringify(flavors)}`);
    let toppingsMarkup = toppings.map((topping) => (
            <h2>
                ---{topping.topping}
            </h2>
      ));

    let flavorsMarkup = flavors.map((flavor) => (
        <h2>
            ---{flavor.flavor}
        </h2>
    ));

    return(
        <div >
            <h1>Menu:</h1>
            <h2>Flavors</h2>
            {flavorsMarkup}
            <h2>Toppings</h2>
            {toppingsMarkup}
            <h1>Samples</h1>

            <BoringBoba toppings={toppings} flavors={flavors} x={x} y ={y}/>
        </div>
    );

}

export default BoringBobaShop;