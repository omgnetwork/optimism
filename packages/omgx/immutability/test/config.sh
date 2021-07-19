#!/bin/bash

export CHAIN_ID=5777
export CHAIN_L2_ID=28
export RPC_URL="http://l1_chain:8545"
export RPC_L2_URL="http://l2geth:8545"
export WALLET_NAME=sequencer
export WALLET_NAME_2=proposer
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
echo "CONFIGURE BACKEND"
vault write -format=json immutability-eth-plugin/config rpc_url="$RPC_URL" chain_id="$CHAIN_ID" rpc_l2_url="$RPC_L2_URL" chain_l2_id="$CHAIN_L2_ID"

# lets create a sequencer wallet without mnemonic
echo "WALLET $WALLET_NAME WITHOUT MNEMONIC"
vault write -format=json -f immutability-eth-plugin/wallets/$WALLET_NAME
# lets create a proposer wallet without mnemonic
echo "WALLET $WALLET_NAME_2 WITHOUT MNEMONIC"
vault write -format=json -f immutability-eth-plugin/wallets/$WALLET_NAME_2

echo "CREATE TWO NEW ACCOUNTS IN WALLET $WALLET_NAME and $WALLET_NAME_2"
ACCOUNT0=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME/accounts)
ACCOUNT1=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME_2/accounts)

tee append-sequencer-batch.hcl <<EOF
path "immutability-eth-plugin/wallets/$WALLET_NAME/accounts/$ACCOUNT0/ovm/appendSequencerBatch" {
    capabilities = ["create"]
}
EOF

vault policy write append-sequencer-batch append-sequencer-batch.hcl

tee append-state-batch-proposer.hcl <<EOF
path "immutability-eth-plugin/wallets/$WALLET_NAME_2/accounts/$ACCOUNT1/ovm/appendStateBatch" {
    capabilities = ["create"]
}
EOF

vault policy write append-state-batch-proposer append-state-batch-proposer.hcl

rm $DIR/tokens.sh || true
touch $DIR/tokens.sh
PROPOSER_TOKEN=$(vault token create -field=token -period=10m -policy=append-state-batch-proposer)
SEQUENCER_TOKEN=$(vault token create -field=token -period=10m -policy=append-sequencer-batch)
echo "#!/bin/bash" >> $DIR/tokens.sh
echo "export PROPOSER_TOKEN=$PROPOSER_TOKEN" >> $DIR/tokens.sh
echo "export SEQUENCER_TOKEN=$SEQUENCER_TOKEN" >> $DIR/tokens.sh
echo "export SEQUENCER=$ACCOUNT0" >> $DIR/tokens.sh
echo "export PROPOSER=$ACCOUNT1" >> $DIR/tokens.sh
cat $DIR/tokens.sh