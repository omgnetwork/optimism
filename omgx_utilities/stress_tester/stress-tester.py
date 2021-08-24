#!python
#
# Copyright 2021 mmontour@enya.ai. Internal use only; all rights reserved
#
# L1/L2 stress tester. Starts with one funded "whale" account which allocates
# funds to various child processes. The child processes then randomly perform
# various operations like onboarding L1->L2, exiting L2->L1, staking liquidity
# pools, or sending payments to each other. More capabilities can be added
#in the future e.g. trading ERC20 tokens, simulated gambling, auctions, 
# multi-level marketing where a child account recruits others and then collects
# a fee on their future transactions, ...
#
# Child processes will only be performing one action at a time, chosen randomly
# and with probabilities intended to keep most of the activity on the L2 chain.
# However some will stay on L1 to ensure that there is some background activity
# which is not part of the rollup framework.

from web3 import Web3
import threading
import signal
import time
from random import *
import queue
import json

omgx_addrs = {
"L2LiquidityPool": "0x67d269191c92Caf3cD7723F116c85e6E9bf55933",
"L1LiquidityPool": "0x4c5859f0F772848b2D91F1D83E2Fe57935348029",
"Proxy__OVM_L1StandardBridge": "0x851356ae760d987E095750cCeb3bC6014560891C",
}
with open('Proxy__OVM_L1StandardBridge.json') as f:
  abi = json.loads(f.read())['abi']
with open('OVM_L1StandardBridge.json') as f:
  abi2 = json.loads(f.read())['abi']
rpc=[None]*3

# rpc[0] unused; could use for DTL address registry
rpc[1] = Web3(Web3.HTTPProvider('http://localhost:9545'))
rpc[2] = Web3(Web3.HTTPProvider('http://localhost:8545'))

run = True
min_balance = Web3.toWei(0.01, 'ether')
whale_acct = Web3.toChecksumAddress("0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc")
whale_key = "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"

# L1->L2
def Onramp(acct):

  addr = acct.address
  #addr = whale_acct 
  
  print("\nONRAMP\n")
 # contract = rpc[1].eth.contract(
 #   address=omgx_addrs['Proxy__OVM_L1StandardBridge'],
 #   abi=abi
 # )
  L1B = omgx_addrs['Proxy__OVM_L1StandardBridge'] # contract.functions.getImplementation().call()
  print ("L1B", L1B)

  c2 = rpc[1].eth.contract(
    address=L1B,
    abi=abi2
  )
  
  bb = rpc[1].eth.getBalance(acct.address)
  print("BAL", bb)
  
  bb = Web3.toWei(bb / 2, 'wei')
  
  r2 = c2.functions.depositETH(
    8000000,
    '0x',
  ).buildTransaction({
    'nonce':rpc[1].eth.get_transaction_count(addr),
    'gasPrice':150000,
    'gas':9500000,
    'from':addr,
    'value':bb, # Web3.toWei(54321,'micro'),
    'chainId':31337,
  })
  #print ("R2 build", r2)
  
  r2 = rpc[1].eth.account.sign_transaction(r2, acct.key)
    
  #print(" R2 sign", r2)
  
  ret = rpc[1].eth.send_raw_transaction(r2.rawTransaction)
 # print ("S", ret)
  
  rcpt = rpc[1].eth.wait_for_transaction_receipt(ret)
  #print("funding RCPT", rcpt)
  assert(rcpt.status == 1)
  
  print("ONRAMP done")
  
   

def worker_thread(num, acct, q):
  print("Init thread", num, "address", acct.address)
  
  chain = 1

  while run: 
    time.sleep(5)
    print("Child Balances", num, rpc[1].eth.getBalance(acct.address),
      rpc[2].eth.getBalance(acct.address))

    # Request funding if necessary
    bal = rpc[chain].eth.getBalance(acct.address)
    
    if (bal < min_balance):
      print("Child ", num, "requesting funding on chain", chain)
      q.put({'addr':acct.address, 'chain':chain})

    if (chain == 1):
      Onramp(acct)
      chain = 2
      # Choose a Chain 1 action
      print("  Chain 1 operation", randint(0,4))
    else:
      # Choose a Chain 2 action
      print("  Chain 2 operation", randint(0,6))
      
  print("Thread done", num)
  
print (rpc[1].isConnected(), rpc[2].isConnected())


from web3.middleware import geth_poa_middleware
# https://web3py.readthedocs.io/en/stable/middleware.html#geth-style-proof-of-authority
print ("Versions", rpc[1].clientVersion, rpc[2].clientVersion)
rpc[2].middleware_onion.inject(geth_poa_middleware, layer=0)


print("Whale balance", rpc[2].eth.getBalance(whale_acct), "nonce", rpc[2].eth.get_transaction_count(whale_acct))
threads = list()
fundQueue = queue.Queue()

def ctrlC(sig, frame):
  print("SIGNAL",sig,frame)
  run = False
  exit(1)

# signal.signal(signal.SIGINT, ctrlC)

def Fund(addr, chain, amount):
  if (chain == 1):
    chainId = 31337
  elif (chain == 2):
    chainId = 28
  else:
    assert("Invalid chain")

  signed_txn = rpc[chain].eth.account.sign_transaction({
      'nonce':rpc[chain].eth.get_transaction_count(whale_acct),
      'gasPrice':15000000,
      'gas':5920000,
      'from':whale_acct,
      'to':addr,
      'value':amount,
      'chainId': chainId,
    },
    whale_key,
  )
  ret = rpc[chain].eth.send_raw_transaction(signed_txn.rawTransaction)
  #print ("fuding RET", ret)
  
  # This only works for auto-mining chains, or else it would run too slowly
  if True:
    rcpt = rpc[chain].eth.wait_for_transaction_receipt(ret)
    #print("funding RCPT", rcpt)
    assert(rcpt.status == 1)
  
  
for i in range(1,2):
  print("Creating child account", i)
  acct = rpc[1].eth.account.create()
  
  t = threading.Thread(target=worker_thread, args=(i,acct,fundQueue,))
  threads.append(t)

  t.start()


while run:  
  print("Whale balances", rpc[1].eth.getBalance(whale_acct),
    rpc[2].eth.getBalance(whale_acct))
  req = fundQueue.get(True)
  
  print("Funding request for addr", req['addr'], "on chain", req['chain'])
  
  Fund(req['addr'], req['chain'], min_balance * 10)
  
fundQueue.join()
