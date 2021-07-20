#!/bin/bash

trap 'catch' EXIT
catch() {
  echo "Done with tests."
}

function test_banner {
    echo "************************************************************************************************************************************"
}

function test_plugin {
	if [ -n "$RUN_TEST" ]; then
    test_banner
		test_banner
		echo "SMOKE TEST BASIC WALLET FUNCTIONALITY"
		test_banner
		/vault/test/smoke.wallet.sh
		test_banner
		echo "SMOKE TEST OVM SUBMIT BATCH"
		test_banner
		/vault/test/smoke.ovm.sh
		echo "SMOKE TEST OVM CUSTOM ENCODING"
		test_banner
		/vault/test/smoke.encode_asb.sh
	else
			echo "Skipping tests."
			wait $VAULT_PID
	fi
}

test_plugin