#!/bin/bash

set -x

export VAULT_CACERT=$1/ca.crt
export VAULT_TOKEN=$1/unseal.json | jq .root_token

echo "CONFIGURE BACKEND"
vault write -format=json immutability-eth-plugin/config rpc_url="$RPC_URL" chain_id="$CHAIN_ID" rpc_l2_url="$RPC_L2_URL" chain_l2_id="$CHAIN_L2_ID"

# lets create a wallet without mnemonic
echo "WALLET $WALLET_NAME WITHHOUT MNEMONIC"
vault write -format=json -f immutability-eth-plugin/wallets/$WALLET_NAME

echo "CREATE TWO NEW ACCOUNTS IN WALLET $WALLET_NAME"
ACCOUNT0=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME/accounts)
ACCOUNT1=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME/accounts)

bash provision.sh $1 $WALLET_NAME $ACCOUNT0 $ACCOUNT1