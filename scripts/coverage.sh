#!/bin/bash

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one).
  if [ -n "$testrpc_pid" ]; then
    kill -9 $testrpc_pid
  fi
}

testrpc_running() {
  nc -z localhost 8555
}

if testrpc_running; then
  echo "Using existing testrpc-sc instance"
else
  echo "Starting testrpc-sc to generate coverage"
  # We define 30 accounts with balance 1M ether, needed for high-value tests.
  ./node_modules/.bin/testrpc-sc --gasLimit 0xfffffffffff --port 8555 \
    --account="0xd65218fd601cd2d9e1491432ce62daee2cc5f3928259a06f02aff6535b499b19,1000000000000000000000000"  \
    --account="0x57899dd91f09cc670d300629955d8712dddd868839d71057c9907f15809b22ba,1000000000000000000000000"  \
    --account="0xad3031501b79580748b3ccecee55b266b019e8d7a3db2d0350a5546c59109b85,1000000000000000000000000"  \
    --account="0x6d924e8cb6793e48fea693a9a35090f72509cbb34c330cbb2e03a31a43c88c33,1000000000000000000000000"  \
    --account="0x08c2d12d25156fb5321538f39b158b69e3d34720dfdd00d1533ff47ecd644d1c,1000000000000000000000000"  \
    --account="0x198a1fe7e2382401147d2ee6d13d342eefeb3ade4fb4136fe85d52e6ee11ff83,1000000000000000000000000"  \
    --account="0xa16334db76222a3dce99d1210a8688d81302c9daa48ddb1cc20d52e2560844c8,1000000000000000000000000"  \
    --account="0xdca8dc57ce45a6fba751024f3b3cb5f96586954b55ea4dedbb1713cef5c9fc1b,1000000000000000000000000"  \
    --account="0xe8968186aca672b1a3fc3de64031f632cc749ba45ebda0b9abe2a33bee4654c8,1000000000000000000000000"  \
    --account="0xd4b24660edbe3bc6fd3b644425ac2c3eb52a5f6257992a1e05d440a8fc65ffcc,1000000000000000000000000"  \
  > /dev/null &
  testrpc_pid=$!
fi

SOLIDITY_COVERAGE=true ./node_modules/.bin/solidity-coverage