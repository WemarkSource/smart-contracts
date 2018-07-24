#! /bin/bash

python3 $(pwd)/solidity_flattener/solidity_flattener contracts/WemarkToken.sol --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ --output contracts/flattened/WemarkToken.sol