/* External Imports */
const { ethers } = require('hardhat');
const { expect } = require('chai');
const { Watcher } = require('@eth-optimism/watcher');
const common = require('mocha/lib/interfaces/common');
const { isCall } = require('hardhat/internal/hardhat-network/stack-traces/opcodes');
const { runOrCatchError } = require('@codechecks/client/dist/utils');
require('dotenv').config();
const env = process.env;


/* Internal Imports */
const factory = (name) => {
    const artifact = require(`../artifacts-ovm/contracts/${name}.sol/${name}.json`);
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode);
}

const BobaMenuFactory = factory('BobaMenu');

describe('Testing BobaMenu Contract', () => {
    // Set up
    const l2_provider = new ethers.providers.JsonRpcProvider(env.l2_provider);
    const wallet1 = new ethers.Wallet(env.privateKey1, l2_provider);
    const wallet2 = new ethers.Wallet(env.privateKey2, l2_provider);



    const flavor1 = "Taro Milk Tea";
    const topping1 = "Aloe Vera";
    const commonScore1 = 30;
    const topping_color1 = [230, 242, 234];
    const flavor_color1 = [221, 137, 245];
    const flavor_gradient1 = [1, 2, 3];

    const flavorStruct1 = [ethers.utils.formatBytes32String(flavor1), // flavor
                    flavor_color1, // color
                    commonScore1, // common score
                    flavor_gradient1 // gradient
                    ];
    const toppingStruct1 = [ethers.utils.formatBytes32String(topping1), // topping
                            topping_color1, // color
                            commonScore1 // common score
                            ];

    const flavor2 = "Matcha Milk Tea";
    const topping2 = "Coconut Jelly";
    const commonScore2 = 15;
    const topping_color2 = [252, 245, 227];
    const flavor_color2 = [61, 168, 89];
    const flavor_gradient2 = [3, 2, 1];

    const flavorStruct2 = [ethers.utils.formatBytes32String(flavor2), // flavor
                    flavor_color2, // color
                    commonScore2, // common score
                    flavor_gradient2 // gradient
                    ];
    const toppingStruct2 = [ethers.utils.formatBytes32String(topping2), // topping
                            topping_color2, // color
                            commonScore2 // common score
                            ];

    const flavor3 = "Black Milk Tea";
    const topping3 = "Tapioca Pearls";
    const commonScore3 = 15;
    const topping_color3 = [24, 31, 26];
    const flavor_color3 = [230, 172, 115];
    const flavor_gradient3 = [3, 2, 3];

    const flavorStruct3 = [ethers.utils.formatBytes32String(flavor3), // flavor
                    flavor_color3, // color
                    commonScore3, // common score
                    flavor_gradient3 // gradient
                    ];
    const toppingStruct3 = [ethers.utils.formatBytes32String(topping3), // topping
                            topping_color3, // color
                            commonScore3 // common score
                            ];

    const flavor4 = "Wintermelon Milk Tea"
    const topping4 = "Lychee Jelly";
    const commonScore4 = 5;
    const topping_color4 = [234, 235, 216];
    const flavor_color4 = [186, 149, 114];
    const flavor_gradient4 = [4, 2, 4];

    const flavorStruct4 = [ethers.utils.formatBytes32String(flavor4), // flavor
                    flavor_color4, // color
                    commonScore4, // common score
                    flavor_gradient4 // gradient
                    ];
    const toppingStruct4 = [ethers.utils.formatBytes32String(topping4), // topping
                            topping_color4, // color
                            commonScore4 // common score
                            ];



// 186, 149, 114

    let BobaMenu;

    before('Deploying BobaMenu', async () => {
        BobaMenu = await BobaMenuFactory.connect(wallet1).deploy(
            wallet1.address,
            toppingStruct1,
            flavorStruct1
        )
        await BobaMenu.deployTransaction.wait();
    });

    describe('Initialization and initial state', async () => {
        it(`Should have first topping and flavor initialized correctly`, async () => {
            // getting struct info
            const first_topping = await BobaMenu.toppings(0);
            const first_flavor = await BobaMenu.flavors(0);
            const first_flavor_color = await BobaMenu.getColorOrGradient(0, true, true);
            const first_flavor_gradient = await BobaMenu.getColorOrGradient(0, true, false);
            const first_topping_color = await BobaMenu.getColorOrGradient(0, false, true);

            // checking flavor and commonScore
            expect(ethers.utils.parseBytes32String(first_topping.topping)).to.eq(topping1);
            expect(ethers.utils.parseBytes32String(first_flavor.flavor)).to.eq(flavor1);
            expect(first_flavor.commonScore).to.eq(commonScore1);
            expect(first_topping.commonScore).to.eq(commonScore1);

            // checking arrays match
            first_flavor_color.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_color1[index]);
            });
            first_flavor_gradient.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_gradient1[index]);
            });
            first_topping_color.forEach((element,index)=>{
                expect(parseInt(element._hex)).to.eq(topping_color1[index]);
            });
        });
    });

    describe('Trivial Security', async () => {
        it(`Should not allow non admin users to add flavors or toppings`, async () =>{
            let failed = false;
            try {
                await BobaMenu.connect(wallet2).addFlavor(flavorStruct2);
            } catch (error) {
                failed = true;
            } finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try {
                await BobaMenu.connect(wallet2).addTopping(toppingStruct2);
            } catch (error) {
                failed = true;
            } finally{
                expect(failed).to.eq(true);
            }
        });
        it(`Should not allow non admin users to replace falvors or toppings`, async () => {
            let failed = false;
            try{
                await BobaMenu.connect(wallet2).replaceFlavor(0, flavorStruct2);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try{
                await BobaMenu.connect(wallet2).replaceTopping(0, flavorStruct2);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }

        });
        it(`Should not allow non admin users to lock contract state`, async () => {
            let failed = false;
            try{
                await BobaMenu.connect(wallet2).changeLock(true);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
        });
        it(`Should not allow non admin users to set new admin`, async () => {
            let failed = false;
            try{
                await BobaMenu.connect(wallet2).setPendingAdmin(wallet2.address);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
        });

    });
    describe('Trivial Functionality Test', () => {
        it(`Should Allow admin to add flavors and toppings`, async () => {
            const tx1 = await BobaMenu.connect(wallet1).addFlavor(flavorStruct2);
            const tx2 = await BobaMenu.connect(wallet1).addTopping(toppingStruct2);

            await tx1.wait();
            const txHashPrefix1 = tx1.hash.slice(0, 2);
            expect(txHashPrefix1).to.eq('0x');
            await tx2.wait();
            const txHashPrefix2 = tx2.hash.slice(0, 2);
            expect(txHashPrefix2).to.eq('0x');
        });
        it(`Should have added the right flavors and toppings`, async () => {
            // getting struct info
            const second_topping = await BobaMenu.toppings(1);
            const second_flavor = await BobaMenu.flavors(1);
            const second_flavor_color = await BobaMenu.getColorOrGradient(1, true, true);
            const second_flavor_gradient = await BobaMenu.getColorOrGradient(1, true, false);
            const second_topping_color = await BobaMenu.getColorOrGradient(1, false, true);

            // checking flavor and commonScore
            expect(ethers.utils.parseBytes32String(second_topping.topping)).to.eq(topping2);
            expect(ethers.utils.parseBytes32String(second_flavor.flavor)).to.eq(flavor2);
            expect(second_flavor.commonScore).to.eq(commonScore2);
            expect(second_topping.commonScore).to.eq(commonScore2);

            // checking arrays match
            second_flavor_color.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_color2[index]);
            });
            second_flavor_gradient.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_gradient2[index]);
            });
            second_topping_color.forEach((element,index)=>{
                expect(parseInt(element._hex)).to.eq(topping_color2[index]);
            });
        });
        it(`Should allow flavors to be replaced by admin`, async () => {
            const tx1 = await BobaMenu.connect(wallet1).replaceFlavor(1, flavorStruct3);
            const tx2 = await BobaMenu.connect(wallet1).replaceTopping(1, toppingStruct3);

            await tx1.wait();
            const txHashPrefix1 = tx1.hash.slice(0, 2);
            expect(txHashPrefix1).to.eq('0x');
            await tx2.wait();
            const txHashPrefix2 = tx2.hash.slice(0, 2);
            expect(txHashPrefix2).to.eq('0x');

            // getting struct info
            const second_topping = await BobaMenu.toppings(1);
            const second_flavor = await BobaMenu.flavors(1);
            const second_flavor_color = await BobaMenu.getColorOrGradient(1, true, true);
            const second_flavor_gradient = await BobaMenu.getColorOrGradient(1, true, false);
            const second_topping_color = await BobaMenu.getColorOrGradient(1, false, true);

            // checking flavor and commonScore
            expect(ethers.utils.parseBytes32String(second_topping.topping)).to.eq(topping3);
            expect(ethers.utils.parseBytes32String(second_flavor.flavor)).to.eq(flavor3);
            expect(second_flavor.commonScore).to.eq(commonScore3);
            expect(second_topping.commonScore).to.eq(commonScore3);

            // checking arrays match
            second_flavor_color.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_color3[index]);
            });
            second_flavor_gradient.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_gradient3[index]);
            });
            second_topping_color.forEach((element,index)=>{
                expect(parseInt(element._hex)).to.eq(topping_color3[index]);
            });
        });
        it(`Should not allow admin to replace flavors that have not been set`, async () => {
            let failed = false;
            try{
                await BobaMenu.connect(wallet1).replaceFlavor(2, flavorStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try{
                await BobaMenu.connect(wallet1).replaceTopping(2, toppingStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
        });
        it(`Should allow admin to lock contract`, async () => {
            const tx1 = await BobaMenu.connect(wallet1).changeLock(true);
            await tx1.wait();
            const txHashPrefix1 = tx1.hash.slice(0, 2);
            expect(txHashPrefix1).to.eq('0x');
        });
        it(`Should not allow changes to be made when contract is locked`, async () => {
            let failed = false;
            try{
                await BobaMenu.connect(wallet1).addFlavor(flavorStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try{
                await BobaMenu.connect(wallet1).addTopping(toppingStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try{
                await BobaMenu.connect(wallet1).replaceFlavor(1, toppingStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
            failed = false;
            try{
                await BobaMenu.connect(wallet1).replaceTopping(1, toppingStruct3);
            }catch(error){
                failed = true;
            }finally{
                expect(failed).to.eq(true);
            }
        });
        it(`Should allow admin to unlock contract`, async () => {
            const tx = await BobaMenu.connect(wallet1).changeLock(false);
            await tx.wait();
            const txHashPrefix = tx.hash.slice(0, 2);
            expect(txHashPrefix).to.eq('0x');
        });
        it(`Should allow admin to add toppings, flavors after contract is unlocked`, async () => {
            const tx1 = await BobaMenu.connect(wallet1).addFlavor(flavorStruct2);
            const tx2 = await BobaMenu.connect(wallet1).addTopping(toppingStruct2);

            await tx1.wait();
            const txHashPrefix1 = tx1.hash.slice(0, 2);
            expect(txHashPrefix1).to.eq('0x');
            await tx2.wait();
            const txHashPrefix2 = tx2.hash.slice(0, 2);
            expect(txHashPrefix2).to.eq('0x');

            const third_topping = await BobaMenu.toppings(2);
            const third_flavor = await BobaMenu.flavors(2);
            const third_flavor_color = await BobaMenu.getColorOrGradient(2, true, true);
            const third_flavor_gradient = await BobaMenu.getColorOrGradient(2, true, false);
            const third_topping_color = await BobaMenu.getColorOrGradient(2, false, true);

            // checking flavor and commonScore
            expect(ethers.utils.parseBytes32String(third_topping.topping)).to.eq(topping2);
            expect(ethers.utils.parseBytes32String(third_flavor.flavor)).to.eq(flavor2);
            expect(third_flavor.commonScore).to.eq(commonScore2);
            expect(third_topping.commonScore).to.eq(commonScore2);

            // checking arrays match
            third_flavor_color.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_color2[index]);
            });
            third_flavor_gradient.forEach((element, index) => {
                expect(parseInt(element._hex)).to.eq(flavor_gradient2[index]);
            });
            third_topping_color.forEach((element,index)=>{
                expect(parseInt(element._hex)).to.eq(topping_color2[index]);
            });
            const toppingIndex = await BobaMenu.connect(wallet1).toppingIndex();
            const flavorIndex =  await BobaMenu.connect(wallet1).flavorIndex();
            expect(toppingIndex).to.eq(3);
            expect(flavorIndex).to.eq(3);
        });

    });

    describe('Only up to ten flavors, toppings should be added', async () => {
        it(`Should only be able to add ten flavors`, async () => {
            const existing_flavors = [flavorStruct2, flavorStruct4, flavorStruct3, flavorStruct1];
            for(let i = 0; i < 7; i++){
                const tx1 = await BobaMenu.connect(wallet1).addFlavor(existing_flavors[i % existing_flavors.length]);
                await tx1.wait();
                const txHashPrefix1 = tx1.hash.slice(0, 2);
                expect(txHashPrefix1).to.eq('0x');
            }
            const flavorIndex = await BobaMenu.connect(wallet1).flavorIndex();
            expect(flavorIndex).to.eq(10);

            let failed = false;
            try {
                await BobaMenu.connect(wallet1).addFlavor(flavorStruct1);
            } catch (error) {
                failed = true;
            } finally{
                expect(failed).to.eq(true);
            }
        });
        it(`Should only be able to add ten toppings`, async () => {
            const existing_toppings = [toppingStruct3, toppingStruct4, toppingStruct1, toppingStruct3];
            for(let i = 0; i < 7; i++){
                const tx1 = await BobaMenu.connect(wallet1).addTopping(existing_toppings[i % existing_toppings.length]);
                await tx1.wait();
                const txHashPrefix1 = tx1.hash.slice(0, 2);
                expect(txHashPrefix1).to.eq('0x');
            }
            const toppingIndex = await BobaMenu.connect(wallet1).toppingIndex();
            expect(toppingIndex).to.eq(10);
            let failed = false;
            try {
                await BobaMenu.connect(wallet1).addTopping(toppingStruct1);
            } catch (error) {
                failed = true;
            } finally{
                expect(failed).to.eq(true);
            }
        });

    });
});