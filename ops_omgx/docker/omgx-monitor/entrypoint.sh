#!/bin/sh
export NODE_ENV=`/opt/secret2env -name $SECRETNAME|grep -w NODE_ENV|sed 's/NODE_ENV=//g'`
export L1_NODE_WEB3_WS=`/opt/secret2env -name $SECRETNAME|grep -w L1_NODE_WEB3_WS|sed 's/L1_NODE_WEB3_WS=//g'`
export L1_LIQUIDITY_POOL_ADDRESS=`/opt/secret2env -name $SECRETNAME|grep -w L1_LIQUIDITY_POOL_ADDRESS|sed 's/L1_LIQUIDITY_POOL_ADDRESS=//g'`
export L2_LIQUIDITY_POOL_ADDRESS=`/opt/secret2env -name $SECRETNAME|grep -w L2_LIQUIDITY_POOL_ADDRESS|sed 's/L2_LIQUIDITY_POOL_ADDRESS=//g'`
npm start
