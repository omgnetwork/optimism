pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;

import "./BobaRecipes.sol";

contract BobaChef {

    event NewAdmin(address indexed newAdmin);
    event NewPendingAdmin(address indexed newPendingAdmin);
    event newFlavorAdded(flavor indexed new_flavor);
    event newToppingAdded(topping indexed new_topping);
    event flavorReplaced(flavor indexed old_flavor, flavor indexed new_flavor);
    event toppingReplaced(topping indexed old_topping, topping indexed new_topping);
    event lockChanged(bool indexed newLocked);

    struct flavor {
        bytes32 flavor;
        uint[3] color;
        uint commonScore;
        uint[3] gradient;
    }

    struct topping{
        bytes32 topping;
        uint[3] color;
        uint commonScore;
    }


    topping[10] public toppings;
    flavor[10] public flavors;

    uint public toppingIndex = 0;
    uint public flavorIndex = 0;

    bool public locked = false;

    address public admin;
    address public pendingAdmin;

    mapping (bytes32 => bool) public queuedTransactions;


    constructor(address admin_, topping memory _first_topping, flavor memory _first_flavor)  {
        toppings[toppingIndex] = _first_topping;
        flavors[flavorIndex] = _first_flavor;
        toppingIndex += 1;
        flavorIndex += 1;
        admin = admin_;
    }

    function addFlavor(flavor memory new_flavor) public {
        require(msg.sender == admin, "BobaChef::addFlavor: Call must come from Timelock.");
        require(flavorIndex < 10, "BobaChef::addFlavor: Flavors can no longer be added.");
        require(locked == false, "BobaChef::addFlavor: Kitchen locked.");
        flavors[flavorIndex] = new_flavor;
        flavorIndex += 1;
        emit newFlavorAdded(new_flavor);
    }

    function replaceFlavor(uint indexOfOld, flavor memory new_flavor) public{
        require(msg.sender == admin, "BobaChef::replaceFlavor: Call must come from Timelock.");
        require(locked == false, "BobaChef::replaceFlavor: Kitchen locked.");
        flavor memory old_flavor = flavors[indexOfOld];
        require(old_flavor.flavor != bytes32(0), "BobaChef::replaceFlavor: Old flavor does not exist.");
        flavors[indexOfOld] = new_flavor;
        emit flavorReplaced(old_flavor, new_flavor);
    }

    function addTopping(topping memory new_topping) public{
        require(msg.sender == admin, "BobaChef::addFlavor: Call must come from Timelock.");
        require(toppingIndex < 10, "BobaChef::addTopping: Toppings can no longer be added.");
        require(locked == false, "BobaChef::addTopping: Kitchen locked.");
        toppings[toppingIndex] = new_topping;
        toppingIndex += 1;
        emit newToppingAdded(new_topping);
    }

    function replaceTopping(uint indexOfOld, topping memory new_topping) public{
        require(msg.sender == admin, "BobaChef::replaceTopping: Call must come from Timelock.");
        require(locked == false, "BobaChef::replaceTopping: Kitchen locked.");
        topping memory old_topping = toppings[indexOfOld];
        require(old_topping.topping != bytes32(0), "BobaChef::replaceTopping: Old topping does not exist.");
        toppings[indexOfOld] = new_topping;
        emit toppingReplaced(old_topping, new_topping);
    }

    function acceptAdmin() public {
        require(msg.sender == pendingAdmin, "Timelock::acceptAdmin: Call must come from pendingAdmin.");
        admin = msg.sender;
        pendingAdmin = address(0);
        emit NewAdmin(admin);
    }

    function changeLock(bool newLocked) public{
        require(msg.sender == admin, "BobaChef::changeLock: Call must come from Timelock.");
        require(locked != newLocked, "BobaChef::changeLock: Old locked status.");
        locked = newLocked;
        emit lockChanged(locked);
    }

    function setPendingAdmin(address pendingAdmin_) public {
        require(msg.sender == admin, "Timelock::setPendingAdmin: Call must come from Timelock.");
        pendingAdmin = pendingAdmin_;

        emit NewPendingAdmin(pendingAdmin);
    }

    function getColorOrGradient(uint index, bool isFlavor, bool isColor) public view returns (uint[3] memory){
        if(isFlavor){
            if(isColor){
                return flavors[index].color;
            }
            return flavors[index].gradient;
        } else {
            return toppings[index].color;
        }
    }
}
