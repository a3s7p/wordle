#!/bin/bash -e
# given X, Y: update word with word from line Y of file X

if [[ "$#" -lt 2 ]]; then echo "Usage: $0 <word list file> <line number>"; exit 1; fi
WORDLIST="$1" OFFSET="$2"; shift 2
WORD=$(sed '/^#/d; /^$/d' "$WORDLIST" | sed -n "${OFFSET}p")
exec ./wordlist/set-word.sh "$WORD"
