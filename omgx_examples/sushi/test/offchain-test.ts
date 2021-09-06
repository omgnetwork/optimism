import { BigNumber, Contract, ContractFactory, providers, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
chai.use(solidity)
const abiDecoder = require('web3-eth-abi')

import hre from 'hardhat'
const cfg = hre.network.config
const hPort = 1234 // Port for local HTTP server
var urlStr
const gasOverride = {} // Can specify e.g. {gasPrice:0, gasLimit:999999} if needed

// import HelloTuringJson_1 from "../artifacts/contracts/HelloTuring.sol/HelloTuring.json"
// import HelloTuringJson_2 from "../artifacts-ovm/contracts/HelloTuring.sol/HelloTuring.json"
// import TuringHelper_1 from "../artifacts/contracts/TuringHelper.sol/TuringHelper.json"
// import TuringHelper_2 from "../artifacts-ovm/contracts/TuringHelper.sol/TuringHelper.json"
import UniswapV2PairJSON from "../artifacts-ovm/contracts/uniswapv2/UniswapV2Pair.sol/UniswapV2Pair.ovm.json"
import TuringHelper_2 from "../artifacts-ovm/contracts/uniswapv2/TuringHelper.sol/TuringHelper.json"

let Factory__Hello: ContractFactory
let hello: Contract
let Factory__Helper: ContractFactory
let helper: Contract


const local_provider = new providers.JsonRpcProvider(cfg['url'])

// Key for Hardhat test account #13 (0x1cbd3b2770909d4e10f157cabc84c7264073c9ec)
const testPrivateKey = '0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd'
const testWallet = new Wallet(testPrivateKey, local_provider)
const L1 = !cfg['ovm']

describe("L2_Only", function() {
  // It is no longer feasible to mock out enough of the l2geth functionality to support
  // an L1 version of these tests.

  it("should not be run on an L1 chain", async() => {
    expect(L1).to.be.false
  })
})

describe("HelloTest", function() {

  before(async () => {
    var http = require('http');
    var ip = require("ip")

    var server = module.exports = http.createServer(function (req, res) {
      if (req.headers['content-type'] === 'application/json') {
	var body = '';
	req.on('data', function (chunk) {
	  body += chunk.toString();
	});

	req.on('end', function () {

	  var jBody = JSON.parse(body)
	  //console.log ("jBody", jBody)

    //       if (jBody.method === "hello") {
	  //   res.writeHead(200, {'Content-Type': 'application/json'});
	  //   var answer = "(UNDEFINED)"
	  //   var v3=jBody.params[0]
	  //   var v4 = abiDecoder.decodeParameter('string',v3)

	  //   switch(v4) {
    //           case 'EN_US':
		// answer = "Hello World"
		// break;
	  //     case 'EN_GB':
		// answer = "Top of the Morning"
		// break;
	  //     case 'FR':
		// answer = "Bonjour le monde"
		// break;
	  //     default:
		// answer = "(UNDEFINED)"  // FIXME This should return an error.
		// break;
	  //   }
	  //   console.log ("      (HTTP) Returning off-chain response:", v4, "->", answer)
	  //   var jResp = {
    //           "jsonrpc": "2.0",
	  //     "id": jBody.id,
	  //     "result": abiDecoder.encodeParameter('string',answer)
	  //   }
	  //   res.end(JSON.stringify(jResp))
	  //   server.emit('success', body);
    //       }
        if (jBody.method === "add2") {

	    let v1 = jBody.params[0]

	    const args = abiDecoder.decodeParameters(['uint256','uint256'], v1)

	    let sum = Number(args['0']) + Number(args['1'])

	    res.writeHead(200, {'Content-Type': 'application/json'});
	    console.log ("      (HTTP) Returning off-chain response:", args, "->", sum)
	    var jResp2 = {
              "jsonrpc": "2.0",
	      "id": jBody.id,
	      "result": abiDecoder.encodeParameter('uint256', sum)
	    }
	    res.end(JSON.stringify(jResp2))
	    server.emit('success', body);
	  } else {
	    res.writeHead(400, {'Content-Type': 'text/plain'});
	    res.end('Unknown method');
	  }

	});

      } else {
	res.writeHead(400, {'Content-Type': 'text/plain'});
	res.end('Expected content-type: application/json');
      };
    }).listen(hPort);

    // Get a non-localhost IP address of the local machine, as the target for the off-chain request
    urlStr = "http://" + ip.address() + ":" + hPort
    console.log("    Created local HTTP server at", urlStr)

    Factory__Helper = new ContractFactory(
      (L1 ? TuringHelper_1.abi : TuringHelper_2.abi),
      (L1 ? TuringHelper_1.bytecode :  TuringHelper_2.bytecode),
      testWallet)

    helper = await Factory__Helper.deploy(urlStr, gasOverride)
    console.log("    Helper contract deployed as", helper.address, "on","L2")

    await(helper.RegisterMethod(ethers.utils.toUtf8Bytes("hello")));
    await(helper.RegisterMethod(ethers.utils.toUtf8Bytes("add2")));

    Factory__Hello = new ContractFactory(
      (L1 ? HelloTuringJson_1.abi : HelloTuringJson_2.abi),
      (L1 ? HelloTuringJson_1.bytecode : HelloTuringJson_2.bytecode),
      testWallet)

    hello = await Factory__Hello.deploy(helper.address, gasOverride)
    console.log("    Test contract deployed as", hello.address)
  })

  it("should return the EN_US greeting via eth_call", async() => {
    let us_greeting = hello.CustomGreetingFor("EN_US", gasOverride)
    expect (await us_greeting).to.equal("Hello World")
  })

  it("should allow the user to set a locale via eth_sendRawTransaction", async() => {
    let loc1 = await hello.SetMyLocale("FR", gasOverride)
    expect (await loc1.wait()).to.be.ok
  })

  it("should return the expected personal greeting", async() => {
    let msg1 = hello.PersonalGreeting(gasOverride)
    expect (await msg1).to.equal("Bonjour le monde")
  })

  it("should allow the user to change their locale", async() => {
    let loc2 = await hello.SetMyLocale("EN_GB", gasOverride)
    expect (await loc2.wait()).to.be.ok
  })

  it("should now return a different personal greeting", async() => {
    let msg2 = hello.PersonalGreeting(gasOverride)
    expect (await msg2).to.equal("Top of the Morning")
  })

  it("should support numerical datatypes", async() => {
    let sum = hello.AddNumbers(20, 22)
    expect (await sum).to.equal(42)
  })
})
