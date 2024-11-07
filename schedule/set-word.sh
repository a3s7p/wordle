#!/bin/bash -e
# given X: create a new store with the word X, update vercel envvar and redeploy Wordle
# needs NILCHAIN_PRIVATE_KEY to be set to a valid funded wallet private key
# TODO use nillion CLI to update values in place once it supports that

die () { echo "ERROR: $*"; exit 1; }
for i in nillion jq; do which "${i}" >/dev/null || die "${i} is not available, please install it"; done
if [[ "$#" -lt 1 ]]; then die "Usage: wordlist/set-word.sh <word to store>"; fi
WORD="$1"; shift; if [[ "${#WORD}" -ne 5 ]]; then die "Expecting 5-letter word"; fi
WORD=$(echo "$WORD" | tr '[:lower:]' '[:upper:]')

source .env

# TODO unhardcode once nillion CLI provides a way to use the testnet config
BOOT_NODES_WS=/dns/node-1.testnet-photon.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWCfFYAb77NCjEk711e9BVe2E6mrasPZTtAjJAPtVAdbye
BOOT_NODES=/dns/node-1.testnet-photon.nillion-network.nilogy.xyz/tcp/14111/p2p/12D3KooWCfFYAb77NCjEk711e9BVe2E6mrasPZTtAjJAPtVAdbye
RPC_ENDPOINT=https://testnet-nillion-rpc.lavenderfive.com
CLUSTER_ID=b13880d3-dde8-4a75-a171-8a1a9d985e6c

NILLION_ARGS_BASE=(
  -b "$BOOT_NODES"
  -w "$BOOT_NODES_WS"
  --nilchain-rpc-endpoint "$RPC_ENDPOINT"
  --nilchain-private-key "$NILCHAIN_PRIVATE_KEY"
)

NILLION_ARGS_GM=(
  --node-key-seed "$NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED"
  --user-key-seed "$NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED"
)

NILLION_ARGS_USER=(
  --node-key-seed "$NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED"
  --user-key-seed "$NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED"
)

PLAYER_USER_ID="$( nillion "${NILLION_ARGS_BASE[@]}" "${NILLION_ARGS_USER[@]}" inspect-ids | grep '^User id:' | awk '{print $3;}' )"
NILLION_ARGS_STORE=( "${NILLION_ARGS_BASE[@]}" "${NILLION_ARGS_GM[@]}" store-values -c "$CLUSTER_ID" --ttl-days 2 "$NEXT_PUBLIC_WORDLE_PROGRAM_ID" --authorize-user-execution "$PLAYER_USER_ID" )

for i in $(seq 0 4); do
  chr=${WORD:i:1}
  int=$(echo -n "$chr" | od -An -tuC | tr -d ' \n')
  NILLION_ARGS_STORE+=(--si "correct_$((i + 1))=${int}")
done

NEW_STORE_ID="$(nillion "${NILLION_ARGS_STORE[@]}" | grep '^Store ID:' | awk '{print $3;}')"

for i in development preview production; do
  echo -n "$NEW_STORE_ID" | vercel env add NEXT_PUBLIC_WORDLE_GAMEMAKER_STORE_ID "$i" --force
done

vercel redeploy nillion-wordle.vercel.app
