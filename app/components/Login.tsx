"use client"

import {createClient, NillionProvider} from "@nillion/client-react-hooks"
import {useState} from "react"

import Wordle from "./Wordle"
import WordleGamemakerWizard from "./WordleGamemaker"
import {useWordle, useWordleDispatch} from "./WordleContext"
import {WordleSessionProvider} from "./WordleSessionContext"
import {VmClient} from "@nillion/client-vms"

export default function Login() {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const [client, setClient] = useState<VmClient | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  if (!wordle.gmSeed && !wordle.playerSeed) {
    throw new Error(
      "Set either NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED or the player envvars!",
    )
  }

  const network =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "testnet" : "devnet"

  const handleLogin = async () => {
    try {
      setIsLoading(true)

      let playerSeed = wordle.playerSeed
      if (wordle.gmSeed && !playerSeed) playerSeed = crypto.randomUUID()

      // log in as player
      // also to get future player UID for GM -- is there a better way?..
      const playerClient = await createClient({
        network,
        seed: playerSeed,
        keplr: window.keplr,
      })

      const playerUid = playerClient.id.toHex()
      wordleDispatch({type: "playerUserId", value: playerUid})

      if (wordle.gmSeed) {
        // log in as GM
        const gamemakerClient = await createClient({
          network,
          seed: wordle.gmSeed,
          keplr: window.keplr,
        })

        const gamemakerUid = gamemakerClient.id.toHex()
        console.log(gamemakerUid)
        wordleDispatch({type: "gmPartyId", value: gamemakerUid})
        wordleDispatch({type: "playerSeed", value: playerSeed})

        setClient(gamemakerClient)
      } else {
        const need = {
          NEXT_PUBLIC_WORDLE_PROGRAM_ID: playerSeed,
          NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED: wordle.programId,
          NEXT_PUBLIC_WORDLE_GAMEMAKER_STORE_ID: wordle.gmStoreId,
          NEXT_PUBLIC_WORDLE_GAMEMAKER_PARTY_ID: wordle.gmPartyId,
        }

        for (const [k, v] of Object.entries(need))
          if (!v)
            throw new Error(`${k} is unset; cannot play Wordle without it!`)

        setClient(playerClient)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => setClient(undefined)
  const authenticated = client !== undefined

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto mb-5">
      <div>
        {authenticated || (
          <div className="my-5">
            <p className="font-bold mb-3">To play you will need:</p>
            <ul className="list-disc list-inside">
              <li>
                <a
                  className="font-bold text-sky-500 target-blank after:content-['_↗'] hover:underline"
                  href="https://docs.nillion.com/guide-testnet-connect"
                  target="_blank"
                >
                  Keplr wallet with testnet chain
                </a>
              </li>
              <li>
                <a
                  className="font-bold text-sky-500 target-blank after:content-['_↗'] hover:underline"
                  href="https://docs.nillion.com/guide-testnet-faucet"
                  target="_blank"
                >
                  Some NIL
                </a>
              </li>
            </ul>
          </div>
        )}
        <div className="flex-row flex justify-center mt-3">
          <button
            className={`border border-white bg-black ${authenticated ? "hover:bg-red-800/50" : "hover:bg-green-800/50"} hover:shadow-md hover:shadow-neutral-500 text-white font-bold py-1 px-3 rounded`}
            onClick={authenticated ? handleLogout : handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : authenticated
                ? "Log out"
                : `Log in ${wordle.gmSeed ? "as gamemaker" : ""} with Keplr`}
          </button>
        </div>
        <div className="flex-row flex justify-center my-6">
          {authenticated && !isLoading && (
            <NillionProvider client={client}>
              {wordle.gmSeed ? (
                <WordleGamemakerWizard />
              ) : (
                <WordleSessionProvider>
                  <Wordle />
                </WordleSessionProvider>
              )}
            </NillionProvider>
          )}
        </div>
      </div>
    </div>
  )
}
