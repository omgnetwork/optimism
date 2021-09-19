#!python
import os,sys
from web3 import Web3
import threading
import signal
import time
from random import *
import queue
import requests,json
from web3.gas_strategies.time_based import fast_gas_price_strategy
from web3.middleware import geth_poa_middleware
from web3.logs import STRICT, IGNORE, DISCARD, WARN


def myAssert(cond):
  assert(cond)

if len(sys.argv) < 2:
  print("Usage:",sys.argv[0],"<target>")
  exit(1)

env = None
try:
  env_path = "./targets/"+sys.argv[1]+".json"
  with open(env_path) as f:
    env = json.loads(f.read())
except:
  print("Unable to load target definition",env_path)
  exit(1)

def loadContract(rpc, addr, abiPath):
  with open(abiPath) as f:
    abi = json.loads(f.read())['abi']
  c = rpc.eth.contract(address=addr, abi=abi)

  for x in abi:
    if x['type'] == 'event':
      abi_str=None
      for y in x['inputs']:
        if abi_str is None:
          abi_str = "("+y['type'] # or is it internalType?
        else:
          abi_str = abi_str + "," + y['type']
      abi_str = abi_str + ")"

      print("Event",x['name']) # addSig(x['name'],abi_str)
      
  #print("Loaded contract",abiPath,"with address", addr)
  return c



rpc_addr=env['endpoints'][0]
print("Connecting to", rpc_addr)
w3 = Web3(Web3.HTTPProvider(rpc_addr))
myAssert (w3.isConnected())
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

print("Connected, chainId=",w3.eth.chainId)

ama = env['address_manager_address']
AM=loadContract(w3,ama,"contracts/Lib_AddressManager.json")
ch = Web3.keccak(w3.eth.get_code(ama))
print("AddressManager",ama,Web3.toHex(ch))

a1 = {}
a2 = {}
a1['AddressManager'] = ama

def lookup(name):
  addr = AM.functions['getAddress'](name).call()
  
  ch = Web3.keccak(w3.eth.get_code(addr))
  print(name, addr, Web3.toHex(ch))
  return addr
  
base = ["OVM_CanonicalTransactionChain","OVM_ChainStorageContainer-CTC-batches",
  "OVM_ChainStorageContainer-CTC-queue","OVM_ChainStorageContainer-SCC-batches",
  "OVM_ExecutionManager","OVM_FraudVerifier","OVM_L1CrossDomainMessenger",
  "OVM_L1MultiMessageRelayer","OVM_SafetyChecker","OVM_StateCommitmentChain",
  "OVM_StateManagerFactory","OVM_StateTransitionerFactory","Proxy__OVM_L1CrossDomainMessenger",
  "Proxy__OVM_L1StandardBridge","OVM_BondManager","OVM_Sequencer","Deployer"]
omgx=["OVM_L1CrossDomainMessengerFast","Proxy__OVM_L1CrossDomainMessengerFast",
  "L2LiquidityPool","L1LiquidityPool","Proxy__L1LiquidityPool","Proxy__L2LiquidityPool",
  "L2TokenPool","L1Message","L2Message","AtomicSwap","L2ERC721","L2ERC721Reg",
  "L1NFTBridge","L2NFTBridge","Proxy__L1NFTBridge","Proxy__L2NFTBridge",
  "OVM_L1MultiMessageRelayerFast"]

for name in base:
  a1[name] = lookup(name)


print()

for name in omgx:
  a2[name] = lookup(name)
print()

print(json.dumps(a1))
print()

print(json.dumps(a2))
