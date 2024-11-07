# Wordle

This is a Wordle implementation built on Nillion.

```
put screenshot here
```

## Setup

If needed, [install Node](https://nodejs.org/en/download/package-manager) first.

Then [install the Nillion SDK](https://docs.nillion.com/quickstart-install).

To install dependencies: run `pnpm install`.

To launch: `pnpm dev`.

To view: open [http://localhost:3000](http://localhost:3000) with your browser.

If anything goes wrong here, ping me on Discord.

Created using [create-nillion-app](https://github.com/NillionNetwork/create-nillion-app).

## Scheduling words to be set in advance

See `schedule/` in this repo.

To update the word of the day from the CLI once:

- get private key from your wallet and save as `NILCHAIN_PRIVATE_KEY` in `.env` or `export` it
- note the store ID output from `schedule/set-word.sh <WORD>` and export it as `NEXT_PUBLIC_WORDLE_STORE_ID` to Wordle
- have Wordle rebuilt using the new value

For updating the word of the day automatically every day:

- ensure that you can update the word once as above
- use crontab and wordlist examples in `schedule/` as a base for your own
