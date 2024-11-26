# Wordle

This is a Wordle implementation built on [Nillion](https://nillion.com). [Play it live here!](https://nillion-wordle.vercel.app)

![Screenshot](https://github.com/user-attachments/assets/58b7ebba-b480-447c-8e9d-da36d62dc72c)
 
Words change daily around midnight [UTC](https://time.is/UTC).

## How to play

### Setting up the game

https://github.com/user-attachments/assets/4e37bdbe-7a2f-4de2-93b6-253f8207a436

### Playing the game

https://github.com/user-attachments/assets/969b1a7c-1721-4d54-81d9-a1fff38d176b

## Developer setup

If needed, [install Node.js](https://nodejs.org/en/download/package-manager) first.

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
