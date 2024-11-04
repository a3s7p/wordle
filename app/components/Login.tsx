"use client"

import {useNillion, useNillionAuth} from "@nillion/client-react-hooks"
import {useState} from "react"

import Wordle from "./Wordle"
import WordleGamemakerWizard from "./WordleGamemaker"
import { UserSeed } from "@nillion/client-core"
import { useWordle, useWordleDispatch } from "./WordleContext"

export default function Login() {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const {client} = useNillion()
  const {authenticated, login, logout} = useNillionAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      let playerSeed = wordle.playerSeed

      if (wordle.gmSeed) {
        // log in to get future player UID -- is there a better way?..
        if (!playerSeed)
          playerSeed = crypto.randomUUID()

        await login({userSeed: playerSeed as UserSeed})
        wordleDispatch({type: "playerUserId", value: client.userId})
        await logout()
        // log in as gm
        await login({userSeed: wordle.gmSeed})
        wordleDispatch({type: "playerSeed", value: playerSeed})
        wordleDispatch({type: "gmPartyId", value: client.partyId})
      } else {
        // actually log in as player
        const need = {
           NEXT_PUBLIC_WORDLE_PROGRAM_ID: playerSeed,
           NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED: wordle.programId,
           NEXT_PUBLIC_WORDLE_GAMEMAKER_STORE_ID: wordle.gmStoreId,
           NEXT_PUBLIC_WORDLE_GAMEMAKER_PARTY_ID: wordle.gmPartyId,
        }

        for (const [k, v] of Object.entries(need))
          if (!v)
            throw new Error(`${k} is unset; cannot play Wordle without it!`)

        await login({userSeed: playerSeed as UserSeed})
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!wordle.gmSeed && !wordle.playerSeed) {
    throw Error('Set either NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED or the player envvars!')
  }

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto mb-5">
      <div>
        {authenticated || <div className="my-5">
          <p className="font-bold mb-3">To play you will need:</p>
          <ul className="list-disc list-inside">
            <li>Keplr wallet with testnet chain <a className="font-bold target-blank" href="https://docs.nillion.com/guide-testnet-connect" target="_blank">(?)</a></li>
            <li>Some NIL <a className="font-bold" href="https://docs.nillion.com/guide-testnet-faucet" target="_blank">(?)</a></li>
          </ul>
        </div>}
        <div className="flex-row flex justify-center mt-3">
          <button
            className={`border border-white bg-black ${authenticated ? "hover:bg-red-800/50" : "hover:bg-green-800/50"} hover:shadow-md hover:shadow-neutral-500 text-white font-bold py-1 px-3 rounded`}
            onClick={authenticated ? handleLogout : handleLogin}
            disabled={isLoading}
          >{isLoading ? "Loading..." : authenticated ? "Log out" : `Log in ${wordle.gmSeed ? "as gamemaker" : ""} with Keplr`}</button>
        </div>
        <div className="flex-row flex justify-center my-6">
          {authenticated && !isLoading && (wordle.gmSeed ? <WordleGamemakerWizard /> : <Wordle />)}
        </div>
      </div>
    </div>
  )
}
