import React, { useState } from 'react'
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';

function BoringBoba(props){
    const { toppings, flavors, x, y } = props;

    function cArrayToString(colorArray){
        return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
    }

    let flavorsMarkup = flavors.map((flavor, i)=>(
                    <Line
                        x={x + i * 200}
                        y={y}
                        points={[0, 0, 150, 0, 125, 150, 25, 150]}
                        tension={0.1}
                        closed
                        stroke="black"
                        fillLinearGradientStartPoint={{ x: -70, y: -70 }}
                        fillLinearGradientEndPoint={{ x: 70, y: 70 }}
                        fillLinearGradientColorStops={[0, cArrayToString(toppings[i].color), 1, cArrayToString(flavor.color)]}
                    />

    ));


    // let toppingsMeta = [0, 1, 2, 3, 4];
    let startingIndexes = [];
    toppings.forEach((element, index) => {
        startingIndexes.push({'x':(x + index * 200) + 20, 'y': y + 100});
    });


    let allToppings = [];
    toppings.forEach((topping, index) => {
        for(let j = 0; j < 3; j++){
            for(let i = 0; i < 7; i++){
                if((j == 1 && i > 5) || (j == 2 && i > 4)) continue;
                allToppings.push(
                    <Line
                        x={x + (index * 200) + (i + .5 * j) * 15 + 20}
                        y={y + 100 + j * 15}
                        points={[0, 0, 10, 0, 10, 10]}
                        tension={topping.topping.includes('Pearl') ? 0.5: 0.7}
                        closed
                        stroke="black"
                        // fill={cArrayToString(toppings[i].color)}
                        fillLinearGradientStartPoint={{ x: -10, y: -10 }}
                        fillLinearGradientEndPoint={{ x: 10, y: 10 }}
                        fillLinearGradientColorStops={[0, cArrayToString(topping.color), 1, cArrayToString(topping.color)]}
                    />
                );
            }
        }
    });



    let toppingsMarkup = toppings.map((topping, i) => (
                    <Line
                        x={(x + i * 200)+ 20}
                        y={y + 100}
                        points={[0, 0, 10, 0, 10, 10]}
                        tension={0.7}
                        closed
                        stroke="black"
                        // fill={cArrayToString(toppings[i].color)}
                        fillLinearGradientStartPoint={{ x: -10, y: -10 }}
                        fillLinearGradientEndPoint={{ x: 10, y: 10 }}
                        fillLinearGradientColorStops={[0, cArrayToString(topping.color), 1, cArrayToString(topping.color)]}
                    />
    ));

    let testArr = [(
        <Line
            x={(x + 0 * 200)+ 20}
            y={y + 100}
            points={[0, 0, 10, 0, 10, 10]}
            tension={0.7}
            closed
            stroke="black"
            // fill={cArrayToString(toppings[i].color)}
            fillLinearGradientStartPoint={{ x: -10, y: -10 }}
            fillLinearGradientEndPoint={{ x: 10, y: 10 }}
            fillLinearGradientColorStops={[0, cArrayToString(toppings[0].color), 1, cArrayToString(toppings[0].color)]}
        />
    ),(
        <Line
            x={(x + 10)+ 20}
            y={y + 100}
            points={[0, 0, 10, 0, 10, 10]}
            tension={0.7}
            closed
            stroke="black"
            // fill={cArrayToString(toppings[i].color)}
            fillLinearGradientStartPoint={{ x: -10, y: -10 }}
            fillLinearGradientEndPoint={{ x: 10, y: 10 }}
            fillLinearGradientColorStops={[0, cArrayToString(toppings[1].color), 1, cArrayToString(toppings[1].color)]}
        />
    )]






    return (<Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    {flavorsMarkup}
                    {allToppings}
                </Layer>

            </Stage>);
}

export default BoringBoba;

//{/* <Rect
                        // x={(x + i * 200)+80}
                        // y={y + 100}
                        // width={20}
                        // height={20}
                        // tension={0.8}
                        // fill={cArrayToString(toppings[i].color)}
                        // /> */}

// let strawsMarkup = flavors.map((flavor, i) =>(
//     <Line
//         x={x + 65 + i * 200}
//         y={y-100}
//         points={[0, 0, 20, 0, 20, 225, 0, 225]}
//         tension={0.1}
//         closed
//         stroke="rgba(0,0,0,.8)"
//         fillLinearGradientStartPoint={{ x: -70, y: -70 }}
//         fillLinearGradientEndPoint={{ x: 70, y: 70 }}
//         fillLinearGradientColorStops={[0, "rgba(0,0,0,.5)", 1, "rgba(0,0,0,.5)"]}
//     />
// ));