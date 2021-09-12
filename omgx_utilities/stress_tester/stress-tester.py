#!python
#
# Copyright 2021 mmontour@enya.ai. Internal use only; all rights reserved
#
# L1/L2 stress tester. Starts with one funded "whale" account which allocates
# funds to various child processes. The child processes then randomly perform
# various operations like onboarding L1->L2, exiting L2->L1, staking liquidity
# pools, or sending payments to each other. More capabilities can be added
# in the future e.g. trading ERC20 tokens, simulated gambling, auctions, 
# multi-level marketing where a child account recruits others and then collects
# a fee on their future transactions, ...
#
# Child processes will only be performing one action at a time, chosen randomly
# and with probabilities intended to keep most of the activity on the L2 chain.
# However some L1 operations are included to ensure that there is some background
# activity which is not part of the rollup framework.

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

num_children = 20
num_workers = 2
min_active_per = 5  # For every <min_active_per> children, require 1 to stay on L2 (disallows exit operations)
max_fail = 0 # Ignore this many op failures. Next one will start a shutdown

min_balance = Web3.toWei(0.01, 'ether')
refund_balance = Web3.toWei(0.009, 'ether') # FIXME - try all refunds, and fail gracefully w. insufficient balance for gas cost
min_lp_balance = Web3.toWei(1.0, 'ether')

# Emit warning messages if any child has been waiting "slow_secs" or more. Shut down at "stuck_secs". 
slow_secs = 360
stuck_secs = 900
giveup_secs = 1800
fund_batch = 10

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

  
assert(num_children <= 1000) # Not a hard limit, but does affect log formatting

# Fail if the parameters would exceed the allowed funding limit
assert(num_children * (min_balance * 10) <= Web3.toWei(env['max_fund_eth'],'ether'))

class shutdown:
  level = 0
  num_done = 0
  num_fails = 0
  total_ops = 0  # FIXME - saving time by sticking this here. Move to its own stats object or other thread-safe place.
  batchGas = 0
  
class Account:
  def __init__(self, address, key):
    self.address = address
    self.key = key
    self.nonce = [0]*3
    
  def setNonces(self,rpcs):
    self.nonce[1] = rpcs[1].eth.get_transaction_count(self.address)
    self.nonce[2] = rpcs[2].eth.get_transaction_count(self.address)

class Context:
  def __init__(self, logpath):
    self.rpc = [None]*3
    self.rpc[1] = Web3(Web3.HTTPProvider(env['endpoints'][0]))
    myAssert (self.rpc[1].isConnected())
    self.rpc[2] = Web3(Web3.HTTPProvider(env['endpoints'][1]))
    myAssert (self.rpc[2].isConnected())
    
    self.chainIds = [None]*3
    self.chainIds[1] = self.rpc[1].eth.chain_id
    self.chainIds[2] = self.rpc[2].eth.chain_id

    l1C = loadL1Contracts(self.rpc[1])
    l2C = loadL2Contracts(self.rpc[2])
    self.contracts = {**l1C, **l2C}

    # see https://web3py.readthedocs.io/en/stable/middleware.html#geth-style-proof-of-authority
    if env['L1_geth_PoA']:
      self.rpc[1].middleware_onion.inject(geth_poa_middleware, layer=0)
    self.rpc[2].middleware_onion.inject(geth_poa_middleware, layer=0)

    self.log = open(logpath, "a")
    self.log.write("# Started at " + time.asctime(time.gmtime()) + "\n")
      
class Child:
  def __init__(self, num, acct, parent):
     
    self.num = num
    self.acct = acct
    # Optional parameter to force all children to start on one chain
    if 'start_chain' in env and env['start_chain'] > 0:
      self.on_chain = env['start_chain']
    else:
      self.on_chain = 2 - (self.num % 2)
    self.approved = [False]*3
    self.staked = [False]*3
    self.parent = parent
    self.ts = []
    self.op = None
    self.need_tx = False
    self.exiting = False
    self.gasEstimate = 0
    self.gasLimit = 0
    self.gasUsed = 0
    
    addr_names[acct.address] = "Child_" + str(num)
    # Could cache L1, L2 balances

signatures = dict()
def addSig(method,abi):
  sig = Web3.toHex(Web3.sha3(text=method + abi))
  signatures[sig] = method

def nameSig(sig):
  if sig in signatures:
    return signatures[sig]
  else:
    return sig

def nuke(sec):
  print("*** Forced exit in ",sec,"seconds ***")
  # could try to flush buffers, close files, etc
  time.sleep(sec)
  os._exit(1)
  
def myAssert(cond):
  if not (cond) and shutdown.level < 2:
    shutdown.level = 2
    threading.Thread(target=nuke, args=(10,)).start()
  assert(cond)

def ctrlC(sig, frame):
  print("SIGNAL",sig,frame)
  
  shutdown.level += 1

  if shutdown.level >= 2:
    signal.signal(signal.SIGINT, signal.SIG_DFL)

  print("")
  print("+---------------------+")
  print("Shutdown level: ", shutdown.level)
  print("listLock:", listLock.locked())
  print("txWatch items:", len(txWatch))
  if shutdown.level > 1:
    for i in txWatch.keys():
      print("  ",Web3.toHex(i))
  print("evMissed: ", evMissed)
  print("evWatch items:", len(evWatch))
  if shutdown.level > 1:
    for i in evWatch.keys():
      print("  ",i)
  print("readyQueue size:", readyQueue.qsize())
  print("idleQueue size:", idleQueue.qsize())
  print("numDone:", shutdown.num_done,"of",num_children)
  if shutdown.level > 1:
    for c in children:
      if not c.exiting:
        print("*** Child",c.num,"acct",c.acct.address,"in op",c.op,"on chain",c.on_chain,"ts",c.ts,"need_tx",c.need_tx)
        
  print("+---------------------+")
  print("")
  
signal.signal(signal.SIGINT, ctrlC)

listLock = threading.Lock()
evWatch = dict()
txWatch = dict()
evMissed = []

readyQueue = queue.Queue()
idleQueue = queue.Queue()

account_log = open("./logs/accounts-" + env['name'] + ".log","a")
logLock = threading.Lock()

op_log = open("./logs/op.log","a")
op_log.write("# Started at " + time.asctime(time.gmtime()) + " with " + str(num_children)+ " children and " + str(num_workers) + " worker threads\n")

addrs = []
children = []

core_addrs = requests.get(env['address_server'] + "/addresses.json")
a1 = json.loads(core_addrs.text)
boba_addrs = None
if 'address_server_2' in env: # Legacy
  boba_addrs = requests.get(env['address_server_2'] + "/addresses.json")
else:
  boba_addrs = requests.get(env['address_server'] + "/omgx-addr.json")

a2 = json.loads(boba_addrs.text)


# From packages/contracts/src/predeploys.ts
predeploys = {
  'Zero_Address': '0x0000000000000000000000000000000000000000',
  'OVM_L2ToL1MessagePasser': '0x4200000000000000000000000000000000000000',
  'OVM_L1MessageSender': '0x4200000000000000000000000000000000000001',
  'OVM_DeployerWhitelist': '0x4200000000000000000000000000000000000002',
  'OVM_ECDSAContractAccount': '0x4200000000000000000000000000000000000003',
  'OVM_SequencerEntrypoint': '0x4200000000000000000000000000000000000005',
  'OVM_ETH': '0x4200000000000000000000000000000000000006',
  'OVM_L2CrossDomainMessenger': '0x4200000000000000000000000000000000000007',
  'Lib_AddressManager': '0x4200000000000000000000000000000000000008',
  'OVM_ProxyEOA': '0x4200000000000000000000000000000000000009',
  'OVM_ExecutionManagerWrapper': '0x420000000000000000000000000000000000000B',
  'OVM_GasPriceOracle': '0x420000000000000000000000000000000000000F',
  'OVM_SequencerFeeVault': '0x4200000000000000000000000000000000000011',
  'OVM_L2StandardBridge': '0x4200000000000000000000000000000000000010',
  'ERC1820Registry': '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24'
}

hardhat = {
'GAS_ORACLE': '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
'SEQUENCER': '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
'PROPOSER': '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
'HARDHAT_03': '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
'HARDHAT_04': '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
'HARDHAT_05': '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
'HARDHAT_06': '0x976ea74026e726554db657fa54763abd0c3a0aa9',
'HARDHAT_07': '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
'RELAYER': '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
'HARDHAT_09': '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
'HARDHAT_10': '0xbcd4042de499d14e55001ccbb24a551f3b954096',
'HARDHAT_11': '0x71be63f3384f5fb98995898a86b02fb2426c5788',
'HARDHAT_12': '0xfabb0ac9d68b0b445fb7357272ff202c5651694a',
'HARDHAT_13': '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
'HARDHAT_14': '0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097',
'HARDHAT_15': '0xcd3b766ccdd6ae721141f452c550ca635964ce71',
'HARDHAT_16': '0x2546bcd3c84621e976d8185a91a922ae77ecec30',
'HARDHAT_17': '0xbda5747bfd65f08deb54cb465eb87d40e51b197e',
'FAST_RELAYER': '0xdd2fd4581271e230360230f9337d5c0430bf44c0',
'HARDHAT_19': '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'
}

for i in hardhat:
  hardhat[i] = Web3.toChecksumAddress(hardhat[i])
  
omgx_addrs = {**a2, **a1, **predeploys, **hardhat}

addr_names = {}
for k in omgx_addrs:
  v = omgx_addrs[k]
  if type(v) is str:
    addr_names[v] = k
  
gasPrice = [0]*3
# Rinkeby seems to work at 0.5 gwei, ~75s
gasPrice[1] = Web3.toWei(env['gas_price_gwei'][0],'gwei')  # FIXME - try to estimate it (fails on local network; needs active txns?)
gasPrice[2] = Web3.toWei(env['gas_price_gwei'][1],'gwei') # This one is fixed

whale = Account(Web3.toChecksumAddress(env['whale_acct'][0]),env['whale_acct'][1])

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
      #print("ABI:",x['name'],abi_str)
      addSig(x['name'],abi_str)
      
  #print("Loaded contract",abiPath,"with address", addr)
  return c
  
def loadL1Contracts(rpc):
  contracts = dict()
  
  contracts['LP_1'] = loadContract(rpc,omgx_addrs['Proxy__L1LiquidityPool'],'./contracts/L1LiquidityPool.json')
  contracts['SB_1'] = loadContract(rpc,omgx_addrs['Proxy__OVM_L1StandardBridge'], './contracts/OVM_L1StandardBridge.json')
  contracts['CTC'] = loadContract(rpc,omgx_addrs['OVM_CanonicalTransactionChain'],'./contracts/OVM_CanonicalTransactionChain.json')
  contracts['SCC'] = loadContract(rpc,omgx_addrs['OVM_StateCommitmentChain'],'./contracts/OVM_StateCommitmentChain.json')
  contracts['OVM_L1CrossDomainMessenger'] = loadContract(rpc,omgx_addrs['OVM_L1CrossDomainMessenger'],'./contracts/OVM_L1CrossDomainMessenger.json')
  
  return contracts
   
def loadL2Contracts(rpc):
  contracts = dict()
 
  contracts['LP_2'] = loadContract(rpc,omgx_addrs['Proxy__L2LiquidityPool'],'./contracts/L2LiquidityPool.json')
  contracts['SB_2'] = loadContract(rpc,'0x4200000000000000000000000000000000000010','./contracts/OVM_L2StandardBridge.json')
  contracts['oETH'] = loadContract(rpc,'0x4200000000000000000000000000000000000006','./contracts/OVM_ETH.json')
  contracts['OVM_L2CrossDomainMessenger'] = loadContract(rpc,omgx_addrs['OVM_L2CrossDomainMessenger'],'./contracts/OVM_L2CrossDomainMessenger.json')
  
  return contracts

def wPrint(log, ch, msg, screenEcho = True):
  if screenEcho:
    print("--",ch,"-- ", msg)
  log.write(msg + "\n")
  
def lPrint(log, msg, screenEcho = True):
  if screenEcho:
    print(msg)
  log.write(msg + "\n")

  
gCtx = Context("./logs/mainloop.log")
lPrint (gCtx.log, "Versions: L1=" + gCtx.rpc[1].clientVersion + ", L2=" + gCtx.rpc[2].clientVersion)
lPrint (gCtx.log, "Detected chain IDs: L1=" + str(gCtx.chainIds[1]) + ", L2=" + str(gCtx.chainIds[2]))

whale.setNonces(gCtx.rpc)

def Fund(ctx, fr, to, chain, amount, n=None):

  amount -= randint(0,65535)
  
  if n is None:
    n = ctx.rpc[chain].eth.get_transaction_count(fr.address)
  
  tx = {
      'nonce': n,
 #     'gasPrice':gasPrice[chain],
      'from':fr.address,
      'to':to,
      'value':1,
#      'gas':800000,
      'chainId': ctx.chainIds[chain],
  }

#  print("DBG FundTx before estimateGas", tx)
  
  eg = ctx.rpc[chain].eth.estimate_gas(tx)
#  print("DBG FundTx estimate_gas:", eg, "GasPrice", ctx.rpc[chain].eth.gasPrice)
  
  eg = int(eg * env['gas_mult'][chain-1])
  
  tx['gas'] = Web3.toWei(eg , 'wei')
  tx['gasPrice'] = gasPrice[chain]
#  print("EG", eg)
  
  myAssert(eg*gasPrice[chain] < amount)
  tx['value'] = Web3.toWei(amount - eg*gasPrice[chain], 'wei')
#  print("DBG Modified FundTx", tx)
  
  signed_txn = ctx.rpc[chain].eth.account.sign_transaction(tx, fr.key)
  
  ret = ctx.rpc[chain].eth.send_raw_transaction(signed_txn.rawTransaction)
  
  return ret

def xFund(ctx, c, to, amount, n=None):

  amount -= randint(0,65535)
  
  if n is None:
    n = ctx.rpc[c.on_chain].eth.get_transaction_count(c.acct.address)
  
  tx = {
      'nonce': n,
#      'gasPrice':gasPrice[c.on_chain],
      'from':c.acct.address,
      'to':to,
      'value':1,
      'gas':800000,
      'chainId': ctx.chainIds[c.on_chain],
  }

#  print("DBG FundTx before estimateGas", tx)
  
  c.gasEstimate = ctx.rpc[c.on_chain].eth.estimate_gas(tx)
  
#  print("DBG FundTx estimate_gas:", eg, "GasPrice", ctx.rpc[c.on_chain].eth.gasPrice)
  
  c.gasLimit = int(c.gasEstimate * env['gas_mult'][c.on_chain-1])
  
  tx['gas'] = Web3.toWei(c.gasLimit , 'wei')
  tx['gasPrice'] = gasPrice[c.on_chain]
  
#  print("EG", eg)
  
  myAssert(c.gasLimit*gasPrice[c.on_chain] < amount)
  tx['value'] = Web3.toWei(amount - c.gasLimit*gasPrice[c.on_chain], 'wei')
#  print("DBG Modified FundTx", tx)
  
  signed_txn = ctx.rpc[c.on_chain].eth.account.sign_transaction(tx, c.acct.key)
  
  ret = ctx.rpc[c.on_chain].eth.send_raw_transaction(signed_txn.rawTransaction)
  
  return ret

if len(sys.argv) >= 3 and sys.argv[2] == "recover":
  print("Recovering account balances on ", env['name'])
  n = 0
  err = 0
  
  with open("./logs/accounts-" + env['name'] + ".log", "r") as f:
    for l in f.readlines():
      n += 1
      jj = json.loads(l)
      
      addr = jj['addr']
      print("Line ",n,":", addr)
      
      a = [0]  # gCtx.contracts['LP_1'].functions.userInfo('0x0000000000000000000000000000000000000000', addr).call()
      if a[0] != 0:

        addr = jj['addr']
        key = jj['key']

        print("addr", addr, "has liquidity", a)

        b = gCtx.contracts['LP_1'].functions.withdrawLiquidity(Web3.toWei(a[0] / 10, 'wei'), '0x0000000000000000000000000000000000000000', addr).buildTransaction({
          'nonce':gCtx.rpc[1].eth.get_transaction_count(addr),
          'gasPrice':gasPrice[1],
          'gas': 2000000,
          'from':addr,
          'value':1,
          'chainId':gCtx.chainIds[1],
        })

        eg = 0
        try:
          eg = gCtx.rpc[1].eth.estimate_gas(b)
          b['gas'] = Web3.toWei(eg, 'wei')

          st = gCtx.rpc[1].eth.account.sign_transaction(b,key)
          r = gCtx.rpc[1].eth.send_raw_transaction(st.rawTransaction)
          rcpt = gCtx.rpc[1].eth.wait_for_transaction_receipt(r)
          print("RCPT", rcpt)
        except Exception as e:
          print ("EXCEPTION", e)
          time.sleep(2)

      bal = gCtx.rpc[1].eth.get_balance(addr)
      print("L1 bal", Web3.fromWei(bal,'ether'))
      
      if bal > refund_balance:
        class tmpFrom:
          def __init__(self, address, key):
            self.address = address
            self.key = key
        print("Will refund L1 from addr", addr)
        tFr = tmpFrom(addr, jj['key'])

        try:
          ret = Fund(gCtx, tFr, whale.address, 1, bal)
          rcpt = gCtx.rpc[1].eth.wait_for_transaction_receipt(ret)
          print("RCPT status", rcpt.status)
          if rcpt.status != 1:
            err += 1
        except Exception as e:
          print("Refund failed:" , e)
          err += 1
          
      bal = gCtx.rpc[2].eth.get_balance(addr)
      print("L2 bal", Web3.fromWei(bal,'ether'))
      
      if bal > refund_balance:
        class tmpFrom:
          def __init__(self, address, key):
            self.address = address
            self.key = key
        print("Will refund L2 from addr", addr)
        tFr = tmpFrom(addr, jj['key'])

        try:
          ret = Fund(gCtx, tFr, whale.address, 2, bal)
          rcpt = gCtx.rpc[2].eth.wait_for_transaction_receipt(ret)
          print("RCPT status", rcpt.status)
          if rcpt.status != 1:
            err += 1
        except Exception as e:
         print("Refund failed:" , e)
         err += 1
      
      if err >= 5:
        exit(1)
            
      time.sleep(0.5)
     
  exit(0)
elif len(sys.argv) >= 3 and sys.argv[2] == "testpay":

  #fr = whale
  
  fr = Account(Web3.toChecksumAddress("0x1cbd3b2770909d4e10f157cabc84c7264073c9ec"), "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd")
  
  chain = 2
  ctx = gCtx
  
  amount = Web3.toWei(0.01,'ether')
  to = "0x6cF9BAf45458cF510F6AC807B52596C62Bf242B1"   # "key": "0x74db41959addb60d029f1a81536ab9de13f094c66dd747d6f4b66de646120fd8" (random test acct)

  n = ctx.rpc[chain].eth.get_transaction_count(fr.address)
  
  tx = {
      'nonce': n,
      'gasPrice':gasPrice[chain],
      'from':fr.address,
      'to':to,
      'value':1,
#      'gas':1,
      'chainId': ctx.chainIds[chain],
  }

  print("DBG FundTx before estimateGas", tx)
  
  egRaw = ctx.rpc[chain].eth.estimate_gas(tx)
  print("DBG FundTx estimate_gas:", egRaw, "GasPrice", ctx.rpc[chain].eth.gasPrice)
  
  if len(sys.argv) >= 4:
    eg = int(sys.argv[3])
    print("Using supplied gas limit", eg)
  else:
    print("Auto-adjusting gas limit")
    eg = int(egRaw * env['gas_mult'][chain-1])
  
  tx['gas'] = Web3.toWei(eg , 'wei')
  print("Estimated Gas: raw=", egRaw, "adjusted=", eg, "price=", ctx.rpc[chain].eth.gasPrice)
  
  myAssert(eg*gasPrice[chain] < amount)
  tx['value'] = Web3.toWei(amount - eg*gasPrice[chain], 'wei')
#  print("DBG Modified FundTx", tx)
  
  signed_txn = ctx.rpc[chain].eth.account.sign_transaction(tx, fr.key)
  
  ret = ctx.rpc[chain].eth.send_raw_transaction(signed_txn.rawTransaction)

  rcpt = gCtx.rpc[chain].eth.wait_for_transaction_receipt(ret)
  print("RCPT", rcpt)


  exit(0)


def Start(ctx, c, op):
  myAssert(c.op is None)
  myAssert(not c.ts) # Ensure it's empty
  c.op = op
  c.gasEstimate = 0
  c.gasLimit = 0
  c.gasUsed = 0
  
  c.ts.append(time.time())
  s = "OP_START," + "{:03d}".format(c.num) + "," + op + "," + str(c.on_chain) + "," + "{:.8f}".format(c.ts[0])
  s += "\n"
  
  logLock.acquire()
  op_log.write(s)
  op_log.flush()
  logLock.release()

# Register the txhash to watch for. All watched operations do this
def Watch(ctx, c, op, tx=None):
  #print("Child",c.num,"START for", op)
  
  c.ts.append(time.time())
  
  s = "OP_WATCH," + "{:03d}".format(c.num) + "," + op + "," + str(c.on_chain) 
  start_at = c.ts[0]
  
  s += "," + "{:014.8f}".format(c.ts[1] - start_at)
  if tx:
    c.need_tx = True
    listLock.acquire()
    txWatch[tx] = c
    listLock.release()
    s = s + "," + Web3.toHex(tx)
  s = s + "\n"
  #ctx.log.write(s)
  logLock.acquire()
  op_log.write(s)
  op_log.flush()
  logLock.release()
  
# Wrapper to watch for an event as well as a tx receipt
def WatchEv(ctx, c, op, tx=None):
  myAssert(tx is not None)

  listLock.acquire()
  evWatch[c.acct.address] = c
  listLock.release()
  Watch(ctx, c, op, tx)

def Finish(c,success=1):
  myAssert(c.op)
  tNow = time.time()
  c.ts.append(tNow)

  op_str = "OP_DONE_," + "{:03d}".format(c.num) + "," + c.op + "," + str(c.on_chain) + "," + str(success)
  op_str += "," + str(c.gasEstimate) + "/" + str(c.gasLimit) + "/" + str(c.gasUsed)
  c.gasEstimate = 0
  c.gasLimit = 0
  c.gasUsed = 0
  
  start_at = c.ts.pop(0)
  for t in c.ts:
    op_str += "," + "{:014.8f}".format(t - start_at)
  op_str += "\n"
  
  logLock.acquire()
  
  shutdown.total_ops += 1
  
  op_log.write(op_str)
  op_log.flush() 
  logLock.release()
  old_op = c.op
  
  c.ts = []
  c.op = None
  
  if c.exiting:
    print("Child",c.num,"is done")
    shutdown.num_done += 1
    # FIXME - advance shutdown if it was the last one
  elif success:
    readyQueue.put(c)
  else:
    print("Putting child",c.num,"into idleQueue after failed operation:", old_op)
    shutdown.num_fails += 1
    if shutdown.num_fails > max_fail and shutdown.level == 0: 
      print("*** Maximum failure count reached, starting shutdown")
      shutdown.level = 1
    idleQueue.put(c)
    
# Periodically take a child out of the idleQueue and see if it has gained enough funds to be put back
# into the readyQueue.
def idle_manager(env):
  loopCheck = None
  while shutdown.level < 2:
    c = None
    items = idleQueue.qsize()
    
    if items == 0:
      #print("idle_manager idleQueue empty")
      time.sleep(20)
      continue
    
    c = idleQueue.get()
    if shutdown.level > 0:
      readyQueue.put(c)
      continue
      
    
    bal = gCtx.rpc[2].eth.get_balance(c.acct.address)
    if bal >= min_balance:
      c.on_chain = 2
      print("idle_manager re-activating child",c.num,"on chain", c.on_chain)
      loopCheck = None
      readyQueue.put(c)
      continue
    
    bal = gCtx.rpc[1].eth.get_balance(c.acct.address)
    if bal >= min_balance:
      c.on_chain = 1
      print("idle_manager re-activating child",c.num,"on chain", c.on_chain)
      loopCheck = None
      readyQueue.put(c)
      continue
    
    interval = 2
    if loopCheck is None:
      loopCheck = c.num
    elif loopCheck == c.num:
      interval = 20
      loopCheck = None
      # If every child is idle and we've scanned the whole queue once, might as well quit.
      if idleQueue.qsize() >= num_children and shutdown.level == 0:
        print("Welp, looks like we're done here.")
        shutdown.level = 1
    
    idleQueue.put(c)
    #print("idle_manager did not reactivate child",c.num,",will sleep for", interval)
    time.sleep(interval)

  print("idle_manager done")

def AddLiquidity(ctx, c,amount):
  Start(ctx, c, "AL")
  if c.staked[c.on_chain]:
    # FIXME - do a withdrawal in this case
    lPrint(ctx.log, "Child " + str(c.num) + " alredy staked on chain " + str(c.on_chain) + " in AddLiquidity")
  r2 = AddLiquidity_2(ctx, c.on_chain, c.acct, amount)
  c.staked[c.on_chain] = True
  Watch(ctx, c, "AL", r2)
  
def AddLiquidity_2(ctx, chain, acct,amount):
  # FIXME - Withdraw if previously staked

  chainId = 0
  token = None
  if (chain==1):
    LP = ctx.contracts['LP_1']
    token = '0x0000000000000000000000000000000000000000'
  else:
    LP = ctx.contracts['LP_2']
    token = '0x4200000000000000000000000000000000000006'
  
  t2 = LP.functions.addLiquidity(
    amount,
    token,
  ).buildTransaction({
    'nonce':ctx.rpc[chain].eth.get_transaction_count(acct.address),
#    'gasPrice':gasPrice[chain],
    'from':acct.address,
#    'value':amount,
    'chainId':ctx.chainIds[chain],
  })
  
  if(chain==1):
    t2['value'] = amount
  eg = ctx.rpc[chain].eth.estimate_gas(t2)
  t2['gas'] = eg # FIXME
  t2['gasPrice'] = gasPrice[chain]
  st = ctx.rpc[chain].eth.account.sign_transaction(t2, acct.key)
  r2 = ctx.rpc[chain].eth.send_raw_transaction(st.rawTransaction)
  return r2

# FIXME - this is used by the Whale to transfer L1->L2 if needed on startup. Can't quite unify it with 
# the Onramp_trad code path used by the workers.
def Onramp_2(ctx, acct, amount):
  
  sb = ctx.contracts['SB_1'].functions.depositETH(
    8000000,  # FIXME / ref: 100000 == MIN_ROLLUP_TX_GAS from OVM_CanonicalTransactionChain.sol
              # Values like 8*MIN can fail silently, successful Tx on L1 but no event ever on L2
              # 8000000 works sometimes(?)
    '0x',
  )
  r2 = sb.buildTransaction({
    'nonce':ctx.rpc[1].eth.get_transaction_count(acct.address),
#    'gas':1,
#    'gasPrice':gasPrice[1],
    'from':acct.address,
    'value':1,
    'chainId':ctx.chainIds[1],
  })
  
  eg =  int(ctx.rpc[1].eth.estimate_gas(r2) * env['gas_mult'][0])

  r2['gas'] = eg
  r2['gasPrice'] = gasPrice[1]
  r2['value'] = Web3.toWei(amount - (eg*gasPrice[1]),'wei')
  
  r2 = ctx.rpc[1].eth.account.sign_transaction(r2, acct.key)

  ret = ctx.rpc[1].eth.send_raw_transaction(r2.rawTransaction)

  return ret
  
def Onramp_trad(ctx,c):
  acct = c.acct
  chain = 1
  
  try:
    Start(ctx,c,"SO")
    bb = ctx.rpc[1].eth.getBalance(acct.address)

    bb = Web3.toWei(bb, 'wei')

    sb = ctx.contracts['SB_1'].functions.depositETH(
      8000000,  # FIXME / ref: 100000 == MIN_ROLLUP_TX_GAS from OVM_CanonicalTransactionChain.sol
                # Values like 8*MIN can fail silently, successful Tx on L1 but no event ever on L2
                # 8000000 works sometimes(?)
      '0x',
    )
    r2 = sb.buildTransaction({
      'nonce':ctx.rpc[1].eth.get_transaction_count(acct.address),
#      'gas':1,
#      'gasPrice':gasPrice[1],
      'from':acct.address,
      'value':1,
      'chainId':ctx.chainIds[1],
    })

    c.gasEstimate = ctx.rpc[1].eth.estimate_gas(r2) 
    c.gasLimit = int(c.gasEstimate * env['gas_mult'][0])

    r2['gas'] = c.gasLimit
    r2['gasPrice'] = gasPrice[1]
    r2['value'] = Web3.toWei(bb - (c.gasLimit*gasPrice[1]),'wei')
     
#    print("SlowOnramp modified Tx:", r2)
    r2 = ctx.rpc[1].eth.account.sign_transaction(r2, acct.key)
    ret = ctx.rpc[1].eth.send_raw_transaction(r2.rawTransaction)
    c.on_chain = 2
    
    WatchEv(ctx,c,"SO",ret)
    
  except Exception as e:
    print("ERROR onramp_trad failed for child",c.num, e)
    myAssert(False) # FIXME
    
def Onramp_fast(ctx,c):
  acct = c.acct
  chain = 1
  
  t = ctx.contracts['LP_2'].functions.poolInfo('0x4200000000000000000000000000000000000006').call()

  bb = ctx.rpc[1].eth.getBalance(acct.address)
    
  if bb > (t[2] / 2.0):
    lPrint(ctx.log, "***** WARNING Child " + str(c.num) + " falling back to traditional onramp")
    Onramp_trad(acct)
  else:
    if True:
      Start(ctx,c,"FO")
      dep = ctx.contracts['LP_1'].functions.clientDepositL1(
        0,
        '0x0000000000000000000000000000000000000000'
      ).buildTransaction({
        'nonce':ctx.rpc[1].eth.get_transaction_count(acct.address),
#        'gasPrice':gasPrice[chain],
#        'gas':1,
        'from':acct.address,
        'value':1,
        'chainId':ctx.chainIds[1],
      })
      #eg = int(ctx.rpc[1].eth.estimate_gas(dep) * env['gas_mult'][0])
      c.gasEstimate = ctx.rpc[1].eth.estimate_gas(dep)
      c.gasLimit = int(c.gasEstimate * env['gas_mult'][0])
      
      myAssert(bb > c.gasLimit*gasPrice[chain])
      amount = Web3.toWei(bb - c.gasLimit * gasPrice[chain],'wei')
      dep['gas'] = c.gasLimit
      dep['gasPrice'] = gasPrice[chain]
      dep['value'] = amount
      
#      print("FastOnramp modified Tx:", dep)
      
      st = ctx.rpc[1].eth.account.sign_transaction(dep, acct.key)
      r = ctx.rpc[1].eth.send_raw_transaction(st.rawTransaction)

      c.on_chain = 2

      WatchEv(ctx,c,"FO",r)
#    except Exception as e:
#      print("ERROR - FastOnramp failed for child", c.num, repr(e), "TS", time.time())
#      myAssert(False) 

def SlowExit(ctx,c):
  Start(ctx,c,"SX")
  acct = c.acct
  chain = 2
   
  amount = ctx.rpc[2].eth.getBalance(acct.address)
  
    
  t1 = ctx.contracts['SB_2'].functions.withdraw(
    '0x4200000000000000000000000000000000000006',
    Web3.toWei(amount,'wei'),
    1,  # L1-gas, unused
    '0x41424344',
  ).buildTransaction({
    'nonce':ctx.rpc[2].eth.get_transaction_count(acct.address),
    'from':acct.address,
    'chainId':ctx.chainIds[2],
  })
  
  c.gasEstimate = ctx.rpc[2].eth.estimate_gas(t1)
  c.gasLimit = int(c.gasEstimate * env['gas_mult'][1])
  
  myAssert(amount > c.gasLimit*gasPrice[chain])
  amount = amount - c.gasLimit*gasPrice[chain]
  
  t = ctx.contracts['SB_2'].functions.withdraw(
    '0x4200000000000000000000000000000000000006',
    Web3.toWei(amount,'wei'),
    1,  # L1-gas, unused
    '0x41424344',
  ).buildTransaction({
    'nonce':ctx.rpc[2].eth.get_transaction_count(acct.address),
    'gasPrice':gasPrice[chain],
    'gas':c.gasLimit, # FIXME
    'from':acct.address,
    'chainId':ctx.chainIds[2],
  })
  
  st = ctx.rpc[2].eth.account.sign_transaction(t,acct.key)

  r = ctx.rpc[2].eth.send_raw_transaction(st.rawTransaction)
  c.on_chain = 1
  WatchEv(ctx,c,"SX",r)

def FastExit(ctx, c):
  acct = c.acct
  t = ctx.contracts['LP_1'].functions.poolInfo('0x0000000000000000000000000000000000000000').call()
  chain = 2
  
  bb = ctx.rpc[2].eth.getBalance(acct.address)
  
  if bb > (t[2] / 2.0):
    print("Falling back to traditional exit")
    SlowExit(ctx,c)
  else:
    Start(ctx,c,"FX")    
    amount = Web3.toWei(bb,'wei')
    
    am2 = Web3.toWei(amount * 0.8, 'wei') # FIXME - amount of 1 gives too-low result; full amount out-of-gas in estimateGas.
    dep_1 = ctx.contracts['LP_2'].functions.clientDepositL2(
      amount,
      '0x4200000000000000000000000000000000000006'
    ).buildTransaction({
      'nonce':ctx.rpc[2].eth.get_transaction_count(acct.address),
      'gas': 1,
#      'gasPrice':gasPrice[chain],
      'from':acct.address,
      'chainId':ctx.chainIds[2],
    })
    c.gasEstimate = ctx.rpc[2].eth.estimate_gas(dep_1)
    
    c.gasLimit = int(c.gasEstimate * env['gas_mult'][1])
    
    myAssert(amount > c.gasLimit*gasPrice[chain])
    amount = amount - c.gasLimit*gasPrice[chain]
    
    dep = ctx.contracts['LP_2'].functions.clientDepositL2(
      amount,
      '0x4200000000000000000000000000000000000006'
    ).buildTransaction({
      'nonce':ctx.rpc[2].eth.get_transaction_count(acct.address),
      'gas': c.gasLimit,
      'gasPrice':gasPrice[chain],
      'from':acct.address,
      'chainId':ctx.chainIds[2],
    })
    
    st = ctx.rpc[2].eth.account.sign_transaction(dep, acct.key)
    r = ctx.rpc[2].eth.send_raw_transaction(st.rawTransaction)
    c.on_chain = 1
    WatchEv(ctx,c,"FX",r)
 
def SendFunds(ctx, c):

  bal = ctx.rpc[c.on_chain].eth.getBalance(c.acct.address) # FIXME - cache this in the Child structure
  
  idx = randint(0,len(addrs)-1)
  if (addrs[idx] == c.acct.address):
    lPrint(ctx.log, "Child " + str(c.num) + " NOP on chain " + str(c.on_chain))
    readyQueue.put(c)
  else:
    Start(ctx,c,"PY")
    tt = xFund(ctx, c, addrs[idx], bal / 10.0)
    myAssert(tt not in txWatch)
    Watch(ctx,c,"PY",tt)

def StopChild(ctx, c):
  for ch in range(1,3):
    # FIXME - try removing liquidity instead, if staked on either chain.
    if c.staked[ch]:
      pass
    b = ctx.rpc[ch].eth.getBalance(c.acct.address)
    lPrint(ctx.log, "StopChild " + str(c.num) + " chain " + str(ch) + " balance " + str(b))
    if b > refund_balance:
      try:
        Start(ctx,c,"RF")
        r = Fund(ctx, c.acct, c.parent, ch, Web3.toWei(b, 'wei'))
        lPrint(ctx.log, "Child " + str(c.num) + " refunding " + str(Web3.fromWei(b,'ether')) + " to " + c.parent + " on chain " + str(ch) + " tx " + Web3.toHex(r))
        Watch(ctx,c,"RF",r)
      except Exception as e:
        lPrint(ctx.log, "ERROR Refund attempt failed for child " + str(c.num) + " on chain " + str(ch) + " error " + str(e))
        continue
      return
    else:
      lPrint(ctx.log, "Child " + str(c.num) + " is below minimum refund balance on chain " + str(ch))
  Start(ctx, c,"DN")
  Watch(ctx, c,"DN")
  c.exiting = True
  Finish(c)

# Create a child process and give it 1/2 of my balance
def SpawnChild(ctx,c):
  # FIXME - not yet implemented
  # Create a new Child process. Update num_children, add to list
  # Start a Fund transaction
  pass
  
def RollDice(prob):
  if randint(0,100) < prob:
    return True
  else:
    return False

def dispatch(ctx, prefix, c):
    if c.on_chain == 1:
      # ERC20 approval not presently needed on L1
      
      if not c.staked[1] and RollDice(env['op_pct'][0][0]):
        bal = ctx.rpc[c.on_chain].eth.getBalance(c.acct.address)
        lPrint(ctx.log, prefix + "will add/remove liquidity")
        AddLiquidity(ctx, c, Web3.toWei(bal / 4.0,'wei'))
      elif RollDice(env['op_pct'][0][1]):
        lPrint(ctx.log, prefix +  "will fast-onramp")
        Onramp_fast(ctx, c)
      elif RollDice(env['op_pct'][0][2]):
        lPrint(ctx.log, prefix + "will traditonal-onramp")
        Onramp_trad(ctx, c)    
      else:
       lPrint(ctx.log, prefix + "Will send funds")
       SendFunds(ctx, c)
    else:
      if not c.approved[2]:
        lPrint(ctx.log, prefix + "Approving contracts")
        # Currently synchronous, could do multi-step waits for completion 
        Approve(ctx, omgx_addrs['Proxy__L2LiquidityPool'], c.acct)
        Approve(ctx, '0x4200000000000000000000000000000000000010', c.acct)
        c.approved[2] = True
        readyQueue.put(c)
        return
      
      mayExit = True
      minActive = int(num_children / min_active_per)
      if (len(evWatch) + idleQueue.qsize()) >= (num_children - minActive):
        mayExit = False
      
#      print("DBG dispatch mayExit", mayExit, "minActive", minActive, "evWatch", len(evWatch), "idle", idleQueue.qsize())
      
      if not c.staked[2] and RollDice(env['op_pct'][1][0]):
        bal = ctx.rpc[c.on_chain].eth.getBalance(c.acct.address)
        lPrint(ctx.log, prefix + "will add/remove liquidity")
        AddLiquidity(ctx, c, Web3.toWei(bal / 4.0,'wei'))
      elif mayExit and RollDice(env['op_pct'][1][1]):
        lPrint(ctx.log, prefix + "will fast-exit")
        r = FastExit(ctx, c)
      elif mayExit and RollDice(env['op_pct'][1][2]):
        lPrint(ctx.log, prefix + "will slow-exit")
        SlowExit(ctx, c)
      else:
        lPrint(ctx.log, prefix + "Will send funds")
        SendFunds(ctx, c) 
  

def worker_thread(num, cx, ch):
  ctx = Context("./logs/worker-"+str(num)+".log")
  
  wasBusy = True
  while shutdown.num_done < num_children and shutdown.level < 2:
    c = None
    
    try:
      c = readyQueue.get(False)
      wasBusy = True
    except:
      if wasBusy:
        lPrint(ctx.log, "Worker " + str(num) + " readyQueue is empty")
        wasBusy = False
    
    if not c:  
      time.sleep(2)
      continue
      
    b1 = ctx.rpc[1].eth.getBalance(c.acct.address)
    b2 = ctx.rpc[2].eth.getBalance(c.acct.address)
    
    # Request funding if necessary
    bal = ctx.rpc[c.on_chain].eth.getBalance(c.acct.address)
    
    if shutdown.level > 0:
      StopChild(ctx, c)  # A child might get here several times before it's done
      continue
      
    prefix = "W " + str(num) + " ch " + str(c.on_chain) + " Child " + str(c.num) + " "
    
    s = prefix + "dispatching at " + str(time.time()) + " b1 " + str(Web3.fromWei(b1,'ether'))
    s +=  " b2 " + str(Web3.fromWei(b2,'ether')) + " L2_Share " + str(int(100*b2/(b1+b2))) + "%"
    lPrint(ctx.log, s)
    
    if (bal >= min_balance):
      pass
    elif c.on_chain == 1 and b2 >= min_balance:
      lPrint(ctx.log, prefix + "balance low, switching to chain 2")
      c.on_chain = 2
    elif c.on_chain == 2 and b1 >= min_balance:
      lPrint(ctx.log, prefix + "balance low, switching to chain 1")
      c.on_chain = 1
    else:  
      lPrint(ctx.log, prefix + "has insufficient funding on either chain")
      idleQueue.put(c)
      continue

    dispatch(ctx, prefix, c)

    ctx.log.flush() 
    time.sleep(env['op_delay'])
    
  ctx.log.write("# Finished at " + time.asctime(time.gmtime()) + "\n")
  ctx.log.flush()
  lPrint(ctx.log, "Thread " + str(num) + " done")

lPrint(gCtx.log, "Whale L2 balance " + str(Web3.fromWei(gCtx.rpc[2].eth.getBalance(whale.address),'ether')) + " nonce " + str( gCtx.rpc[2].eth.get_transaction_count(whale.address)))
   
threads = []
l1PayQueue = queue.Queue()
l2PayQueue = queue.Queue()

def Approve(ctx, contract, acct):
  
  allowance = ctx.contracts['oETH'].functions.allowance(acct.address,contract).call()
  
  if Web3.fromWei(allowance,'ether') > 1000:
    lPrint(ctx.log, "Approval not needed, allowance=" + str(allowance))
    return
  
  a = ctx.contracts['oETH'].functions.approve(
    contract,
    Web3.toWei(99999,'ether')
  ).buildTransaction({
    'nonce':ctx.rpc[2].eth.get_transaction_count(acct.address),
    'from':acct.address,
    'chainId':ctx.chainIds[2],
  })
  
  eg = ctx.rpc[2].eth.estimate_gas(a)
#  bal = ctx.rpc[2].eth.getBalance(acct.address)
#  print("EG",eg,"BAL",bal)
  a['gas'] = Web3.toWei(eg, 'wei')
  a['gasPrice'] = gasPrice[2]
  
  st = ctx.rpc[2].eth.account.sign_transaction(a, acct.key)
  ret = ctx.rpc[2].eth.send_raw_transaction(st.rawTransaction)
  rcpt = ctx.rpc[2].eth.wait_for_transaction_receipt(ret)
  lPrint(ctx.log, "APPROVED addr " + acct.address + " FOR " + contract + " STATUS " + str(rcpt.status))
  myAssert(rcpt.status == 1)

def addrName(addr):
  if addr in addr_names:
    return addr_names[addr]
  else:
    return addr  
  
def block_watcher(env, ch):
  log = open("./logs/watcher-L"+str(ch)+".log", "a")
  log.write("# Started at " + time.asctime(time.gmtime()) + "\n")
  
  rpc_addr = env['endpoints'][ch-1]
  confirmations = env['confirmations'][ch-1]
  
  w3 = Web3(Web3.HTTPProvider(rpc_addr))
  myAssert (w3.isConnected())

  if env['L1_geth_PoA'] or (ch == 2):
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

  next = w3.eth.block_number
  
  ctcCount = 0
  ctcGasUsed = 0
  sccCount = 0
  sccGasUsed = 0
  
  if ch == 1:
    contracts = loadL1Contracts(w3)
    FF = contracts['LP_1'].events.ClientPayL1()
    FS = contracts['SB_1'].events.ETHWithdrawalFinalized()
    FF_Err = contracts['LP_1'].events.ClientPayL1Settlement()
  else:
    contracts = loadL2Contracts(w3)
    FF = contracts['LP_2'].events.ClientPayL2()
    FS = contracts['SB_2'].events.DepositFinalized()
              
  while shutdown.level < 2:
    while (next + confirmations) > w3.eth.block_number and shutdown.level < 2:
      time.sleep(3)

    if shutdown.level >= 2:
      break
    b = None

    try:
      b = w3.eth.get_block(next,full_transactions=True)
    except:
      print("***ERR failed to get block",next,"on chain",ch)
      time.sleep(5)
      continue
      
    header =  "New block " + str(next) + " at " + str(time.time())
    if len(b.uncles) > 0:
      print("***WARNING - block has uncles:",b.uncles)
      header += "[UNCLES]"
      
    if len(b.transactions) == 0:
      header += " [No transactions]"
      wPrint(log, ch, header)
      wPrint(log, ch, "")
      next += 1
      continue
    
    if ch == 2:
      tx = b.transactions[0]
      header += " at L1_BN=" + str(int(tx.l1BlockNumber,16)) + ", L1_TS=" + str(int(tx.l1Timestamp,16))
      if tx.l1TxOrigin:
        header += ", l1QueueOrigin=" + addrName(Web3.toChecksumAddress(tx.l1TxOrigin))
    wPrint(log, ch, header)

    ign_count = 0
    for tx in b.transactions:
      logs = []
      t = tx.hash

      listLock.acquire()

      if t in txWatch: # Receipt for one of our direct transactions
        success=1
        tr=None
        try:
          tr = w3.eth.get_transaction_receipt(t)
        except Exception as e:
          print("eth.get_transaction_receipt exception:", e)
          wPrint(log,ch,"ERROR fetching receipt, will re-try once.")
          time.sleep(10)
          tr = w3.eth.get_transaction_receipt(t)
          
        logs = tr.logs
        cc = txWatch.pop(t)
        cc.need_tx = False
        wPrint(log, ch, "got TX " + Web3.toHex(t) + " child " + str(cc.num) + " addr " + cc.acct.address + " S " + str(tr.status))
        #print("gas", tx.gas, "gasUsed", tr.gasUsed)
        cc.gasUsed = tr.gasUsed
        
        if tr.status != 1:
          success = 0
          wPrint(log, ch, "ERROR Failed TX " + Web3.toHex(t) + " child " + str(cc.num) + " addr " + cc.acct.address)
          print("FAILED_TX",tx)
          print("FAILED_TX_RCPT",tr)
          
          if cc.acct.address in evWatch:
            wPrint(log, ch, "Removing " + cc.acct.address + "from evWatch after failed TX")
            evWatch.pop(cc.acct.address)
          #assert(tr.status == 1)
        cc.ts.append(time.time())
        if cc.acct.address in evWatch:

          print("Child", cc.num, "tx OK, waiting for event")
        else:
          Finish(cc,success)

      elif tx['from'] in addr_names or tx['to'] in addr_names: # System-generated  transactions
        tr = w3.eth.get_transaction_receipt(t)
        logs = tr.logs
        items = ['from', 'to', 'address', 'gasUsed', 'gas', 'nonce', 'value', 'status' ]
        pr = {}
        for i in items:
          if i in tr:
            val = tr[i]
          elif i in tx:
            val = tx[i]
          else:
            continue  
          pr[i] = addrName(val)
        if 'gas' in pr and 'gasUsed' in pr:
          if pr['gasUsed'] > pr['gas']:
            wPrint(log, ch, "*** GAS MISMATCH, gasUsed " + str(pr['gasUsed']) + " > gas " + str(pr['gas']))
            
        wPrint(log, ch, "sys TX " + Web3.toHex(t) + " " + str(pr))
        
        if pr['to'] == 'OVM_CanonicalTransactionChain':
          ctcCount += 1
          ctcGasUsed += pr['gasUsed']
        elif pr['to'] == 'OVM_StateCommitmentChain':
          sccCount += 1
          sccGasUsed += pr['gasUsed']
         
      else:
        ign_count += 1
        wPrint(log, ch, "ign TX " + Web3.toHex(t), False)
        
      for j in logs:
        topic_args = []
        for k in j.topics[1:]:
          topic_args.append(Web3.toHex(k) + " ")
        wPrint(log, ch, "    (EVENT) " + addrName(j.address) + " " + nameSig(Web3.toHex(j.topics[0])) + " " + str(topic_args))

        match=None
        ev=None
        success=1
        try:
          ev = FF.processLog(j)
          match = ev.args['sender']
        except:
          pass

        try:
          ev = FS.processLog(j)
          match = ev.args['_to']
        except:
          pass
          
        if ch == 1:
          try:
            ev = FF_Err.processLog(j)
            match = ev.args['sender'] # FIXME - appears as '_to' in some versions of contract???
            wPrint(log,ch,"     *****  WARNING Failed fast-onramp for addr " + match)
            success = 0
          except:
            pass

        if match in evWatch:
          c = evWatch.pop(match)
          wPrint(log,ch, "        --> Matched evWatch child " + str(c.num) + " addr " + match)
          if c.need_tx:
            wPrint(log,ch, "            NOTE got event before tx for addr" + match) # This is no longer a warning; should be handled OK, and happens if Confirmations is set higher than the DTL value
          else:
            Finish(c,success)
        elif match in addrs:  
          wPrint(log,ch, "     *****  WARNING Found unmatched event for addr " + match)
          evMissed.append(match)
        elif match == whale.address:
          wPrint(log,ch, "       -->  Ignoring event for Whale addr " + match)
        elif match:
          wPrint(log,ch, "     *****  WARNING Ignoring event for unknown addr " + match)
      listLock.release()
    if ign_count > 0:
      # FIXME - there is a small race condition where a txn could go through before the
      # txhash is registered. Should keep a history of ignored txns and cross-reference
      # against the txWatch. 
      wPrint(log, ch, "ignored " + str(ign_count) + " foreign transactions")

    listLock.acquire()
    for e in evMissed:
      if e in evWatch:
        c = evWatch.pop(e)
        wPrint(log, ch, "WARNING previous event " + e + " now matches child " + str(c.num))
        evMissed.remove(e)
        Finish(c, success)
    listLock.release()

    wPrint(log,ch, "")
    log.flush()
    try: # can get "broken pipe" with "tee"
      sys.stdout.flush()
    except:
      pass  
    
    next += 1
    
    if (next % 10) == 0 and ch == 1 and ctcCount > 0 and sccCount > 0:
      ctcAvg = int(ctcGasUsed / ctcCount)
      sccAvg = int(sccGasUsed / sccCount)
      s =  "+++ GAS_STATS +++ CTC has used " + str(ctcGasUsed) + " gas in " + str(ctcCount) + " tx (avg " + str(ctcAvg) + ")"
      s += "; SCC has used " + str(sccGasUsed) + " gas in " + str(sccCount) + " tx (avg " + str(sccAvg) + ")"
      wPrint(log, ch, s)

  # Print final stats on thread exit.
  if ch == 1 and ctcCount > 0 and sccCount > 0:  
    ctcAvg = int(ctcGasUsed / ctcCount)
    sccAvg = int(sccGasUsed / sccCount)
    s =  "+++ GAS_STATS_FINAL +++ CTC used total " + str(ctcGasUsed) + " gas in " + str(ctcCount) + " tx (avg " + str(ctcAvg) + ")"
    s += "; SCC used total " + str(sccGasUsed) + " gas in " + str(sccCount) + " tx (avg " + str(sccAvg) + ")"
    wPrint(log, ch, s)
    shutdown.batchGas = ctcGasUsed + sccGasUsed
    
  wPrint(log, ch, "Watcher thread done")
  
l1_watcher = threading.Thread(target=block_watcher, args=(env,1,))
l1_watcher.start()
l2_watcher = threading.Thread(target=block_watcher, args=(env,2,))
l2_watcher.start()
idle_mgr = threading.Thread(target=idle_manager, args=(env,))
idle_mgr.start()

# Ensure sufficient L2 balance
balStart = [None]*3
balStart[1] = gCtx.rpc[1].eth.getBalance(whale.address)
balStart[2] = gCtx.rpc[2].eth.getBalance(whale.address)
fvStart = gCtx.rpc[2].eth.getBalance('0x4200000000000000000000000000000000000011')

lPrint(gCtx.log, "Whale staring balances: L1=" + str(Web3.fromWei(balStart[1],'ether')) + " L2=" + str(Web3.fromWei(balStart[2],'ether')))
lPrint(gCtx.log, "Ratio: " + str(balStart[2] / (balStart[1] + balStart[2])))

if (balStart[2] / (balStart[1] + balStart[2])) < 0.4:
  diff = (balStart[1] + balStart[2])/2.0 - balStart[2]
  lPrint(gCtx.log, "Whale will move " + str(Web3.fromWei(diff,'ether')) + " from L1 to L2")
  
  diff = Web3.toWei(diff,'wei')
  
  tx = Onramp_2(gCtx,whale,diff)
  rcpt = gCtx.rpc[1].eth.wait_for_transaction_receipt(tx)
  #print("DBG rcpt", rcpt)
  myAssert(rcpt.status == 1)
  lPrint(gCtx.log, "Whale L1->L2 transfer completed on L1.")

  tries = 0
  while gCtx.rpc[2].eth.getBalance(whale.address) <= balStart[2]:
    lPrint(gCtx.log, "Waiting for transfer to arrive on L2")
    time.sleep(10)
    tries += 1
    myAssert(tries < 60)  
  lPrint(gCtx.log, "Whale L1->L2 transfer completed on L2. Recalculating start values.")

  balStart[1] = gCtx.rpc[1].eth.getBalance(whale.address)
  balStart[2] = gCtx.rpc[2].eth.getBalance(whale.address)
  lPrint(gCtx.log, "Updated staring balances: L1=" + str(Web3.fromWei(balStart[1],'ether')) + " L2=" + str(Web3.fromWei(balStart[2],'ether')))
  whale.setNonces(gCtx.rpc)

time.sleep(2)

Approve(gCtx, omgx_addrs['Proxy__L2LiquidityPool'], whale)
Approve(gCtx, '0x4200000000000000000000000000000000000010', whale)

# Pre-fund the LPs if necessary
t = gCtx.contracts['LP_1'].functions.poolInfo('0x0000000000000000000000000000000000000000').call()
if t[2] < min_lp_balance:
  r = AddLiquidity_2(gCtx, 1, whale, min_lp_balance)
  rcpt = gCtx.rpc[1].eth.wait_for_transaction_receipt(r)
  lPrint(gCtx.log, "Added liquidity to LP[1], status " + str(rcpt.status))
  myAssert(rcpt.status == 1)
else:
  lPrint(gCtx.log, "LP[1] has sufficient liquidity: " + str(Web3.fromWei(t[2],'ether')))

t = gCtx.contracts['LP_2'].functions.poolInfo('0x4200000000000000000000000000000000000006').call()
if t[2] < min_lp_balance:
  r = AddLiquidity_2(gCtx, 2, whale, min_lp_balance)
  rcpt = gCtx.rpc[2].eth.wait_for_transaction_receipt(r)
  lPrint(gCtx.log, "Added liquidity to LP[2], status " + str(rcpt.status))
  myAssert(rcpt.status == 1)
else:
  lPrint(gCtx.log, "LP[2] has sufficient liquidity: " + str(Web3.fromWei(t[2],'ether')))

whale.setNonces(gCtx.rpc)

# Process initial funding ops in batches to avoid overloading the L1 (Rinkeby)
def InitialFunding(env):
  lPrint(gCtx.log, "InitialFunding thread starting, num_children = " + str(len(children)))
  batchTx = []
  
  for c in children:
    lPrint(gCtx.log, "InitialFunding child " + str(c.num) + " addr " +  c.acct.address + " on chain " + str(c.on_chain))
    
    if shutdown.level > 0:
      lPrint(gCtx.log, "InitialFunding thread in shutdown, skipping child " + str(c.num))
      readyQueue.put(c)
      continue

    Start(gCtx, c, "IF")
    ret = Fund(gCtx, whale, c.acct.address, c.on_chain, min_balance * 10, whale.nonce[c.on_chain])

    whale.nonce[c.on_chain] += 1
    Watch(gCtx, c, "IF", ret)

    batchTx.append(ret)
    
    if (len(batchTx) >= fund_batch):
      lPrint(gCtx.log, "InitialFunding thread pausing for batch completion")
      tStart = time.time()
      while len(batchTx) > 0 and shutdown.level == 0:
        time.sleep(10)
        listLock.acquire()
        for t in batchTx:
          if t not in txWatch:
            lPrint(gCtx.log, "InitialFunding done for tx " + Web3.toHex(t))
            batchTx.remove(t)
        listLock.release()
        tWait = time.time() - tStart
        lPrint(gCtx.log, "InitialFunding thread still waiting for " + str(len(batchTx)) + " transactions after " + str(int(tWait)) + " secs")
        if tWait > stuck_secs and shutdown.level == 0:
          lPrint(gCtx.log, "InitialFunding thread triggering STUCK_OPERATION shutdown")
          shutdown.level = 1

  lPrint(gCtx.log, "InitialFunding thread done.")
  
for i in range(0,num_workers):  
  t = threading.Thread(target=worker_thread, args=(i,None,0,))
  threads.append(t)
  t.start()

# Make sure we have at least enough for the initial funding
myAssert(num_children * (min_balance * 10) < balStart[2])
fundCount = 0

for i in range(0,num_children):
  lPrint(gCtx.log, "Creating child account " + str(i))
  
  acct = gCtx.rpc[1].eth.account.create()
  addrs.append(acct.address)
  
  account_log.write(json.dumps({ 'addr':acct.address, 'key':Web3.toHex(acct.key) }))
  account_log.write("\n")
  
  c = Child(i,acct,whale.address)
  children.append(c)

  s = "OP_INIT_," + "{:03d}".format(c.num) + ",--," + str(c.on_chain) + "," + c.acct.address
  s += "\n"
  
  logLock.acquire()
  op_log.write(s)
  logLock.release()
  

ifThread = threading.Thread(target=InitialFunding, args=(env,))
ifThread.start()

account_log.flush()


start_time = time.time()

while shutdown.level < 2:  
  c = None
  while c is None and shutdown.level < 2: # FIXME
    listLock.acquire()
   # print("Whale balances", Web3.fromWei(gCtx.rpc[1].eth.getBalance(whale.address),'ether'),
   #   Web3.fromWei(gCtx.rpc[2].eth.getBalance(whale.address),'ether'))
    
    runtime = time.time() - start_time
    
    s = "Completed " + str(shutdown.total_ops) + " ops in " + str(runtime) + " seconds (" + str(int(3600 * shutdown.total_ops / runtime)) + "/hour)"
    lPrint(gCtx.log, s)
    
    ps = "Pool balances, TS " + str(time.time())
    ps += " LP1 " + str(Web3.fromWei(gCtx.contracts['LP_1'].functions.poolInfo('0x0000000000000000000000000000000000000000').call()[2],'ether'))
    ps += " LP2 " + str(Web3.fromWei(gCtx.contracts['LP_2'].functions.poolInfo('0x4200000000000000000000000000000000000006').call()[2],'ether'))
    ps += " SB1 " + str(Web3.fromWei(gCtx.rpc[1].eth.getBalance(omgx_addrs['Proxy__OVM_L1StandardBridge']),'ether'))
    ps += " oETH " + str(Web3.fromWei(gCtx.contracts['oETH'].functions.totalSupply().call(),'ether'))
    ps += " FV+ " + str(Web3.fromWei(gCtx.rpc[2].eth.getBalance('0x4200000000000000000000000000000000000011') - fvStart,'ether'))

    lPrint(gCtx.log, ps)
    
    s = ""  
    now = time.time()
    slowTx = set()
    tMax = 0
    slowCount = 0
    
    for i in txWatch:
      c = txWatch[i]
      if len(c.ts) == 0:
        continue # FIXME - shouldn't happen
      t = now - c.ts[0]
      tMax = max(t,tMax)
      if t > slow_secs:
        slowCount += 1
        if slowCount <= 5:
          s += "(child " + str(c.num)+ " op " + c.op +" tx " + str(int(t)) + "s) "
        slowTx.add(c.num)
        
    for i in evWatch:
      c = evWatch[i]
      if len(c.ts) == 0:
        continue # FIXME - shouldn't happen
      t = now - c.ts[0]
      tMax = max(t,tMax)
      if t > slow_secs and c.num not in slowTx:
        slowCount += 1
        if slowCount <= 5:
          s += "(child " + str(c.num) + " op " + c.op +" ev " + str(int(t)) + "s) "
    
    os = "Other stats"
    os += " L1GP " + str(Web3.fromWei(gCtx.rpc[1].eth.gasPrice,'gwei'))
    os += " L2GP " + str(Web3.fromWei(gCtx.rpc[2].eth.gasPrice,'gwei'))
    os += " txWatch " + str(len(txWatch)) + " evWatch " + str(len(evWatch)) + " readyQueue " + str(readyQueue.qsize())
    os += " idleQueue " + str(idleQueue.qsize())
    os += " maxWait " + str(int(tMax)) + " SL " + str(shutdown.level)
    os += " (" + str(shutdown.num_done) + "/" + str(num_children) + ")"
    lPrint(gCtx.log, os)
    
    if slowCount > 5:
      s += "...and " + str(slowCount - 5) + " more"
      
    if s != "":
      lPrint(gCtx.log, "SLOW OPERATION WARNINGS: " + s)
    
    if tMax > stuck_secs and shutdown.level == 0:
      lPrint(gCtx.log, "Shutting down on STUCK_OPERATION timeout")
      shutdown.level = 1
    elif tMax > giveup_secs and shutdown.level == 1:
      lPrint(gCtx.log, "Forcing level 2 shutdown after " + str(giveup_secs) + " secs")
      shutdown.level = 2
    
      
    listLock.release()
    try:
      sys.stdout.flush()
      gCtx.log.flush()
    except:
      pass
      
    if shutdown.level == 1 and shutdown.num_done >= num_children:
      lPrint(gCtx.log, "Continuing shutdown")
      shutdown.level = 2
      break
      
    time.sleep(5)
    
lPrint(gCtx.log,"Main joining worker threads")
for t in threads:
  t.join()

lPrint(gCtx.log, "Main joining watcher threads")
l1_watcher.join()
l2_watcher.join()
idle_mgr.join()
ifThread.join()

balEnd = [None]*3
balEnd[1] = gCtx.rpc[1].eth.getBalance(whale.address)
balEnd[2] = gCtx.rpc[2].eth.getBalance(whale.address)

l1_net = Web3.fromWei(balEnd[1],'ether') - Web3.fromWei(balStart[1],'ether')
l2_net = Web3.fromWei(balEnd[2],'ether') - Web3.fromWei(balStart[2],'ether')

lPrint(gCtx.log, "Final balances: L1 = " + str(Web3.fromWei(balEnd[1],'ether')) + " (" + str(l1_net) + ") L2 = " + str(Web3.fromWei(balEnd[2],'ether')) + " (" + str(l2_net) + ")")
diff = l1_net + l2_net
if diff > 0:
  # Maybe possible in the future with pool rewards or delayed exits from other activities?
  lPrint(gCtx.log, "Somehow we gained " + str(diff) + " ETH during this run")
else:
  lPrint(gCtx.log, "Total cost of run: " + str(-diff) + " ETH")

fvEnd = gCtx.rpc[2].eth.getBalance('0x4200000000000000000000000000000000000011')

lPrint(gCtx.log,"L2 Fee Vault collected " + str(Web3.fromWei(fvEnd-fvStart,'ether')) + " ETH during run")

lPrint(gCtx.log,"Batch submitter consumed " + str(shutdown.batchGas) + " L1 gas, costing " + str(Web3.fromWei(shutdown.batchGas * gasPrice[1], 'ether')) + " ETH")

s = "+++ OPS_TOTAL +++ Completed " + str(shutdown.total_ops) + " ops in " + str(runtime) + " seconds (" + str(int(3600 * shutdown.total_ops / runtime)) + "/hour)"
lPrint(gCtx.log, s)

lPrint(gCtx.log, "Main cleaning up")
if len(evWatch) == 0 and len(txWatch) == 0 and shutdown.num_done == num_children:
  op_log.write("# Clean exit at " + time.asctime(time.gmtime()) +"\n")
else:  
  op_log.write("# Dirty shutdown at " + time.asctime(time.gmtime()) +"\n")

op_log.close()
account_log.close()

