"use client"

import React, {FC, MouseEventHandler, useId, useState} from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  StoreAcl,
  ProgramId,
  UserId,
  Days,
} from "@nillion/client-core"
import {
  useNilStoreProgram,
  useNilStoreValues,
} from "@nillion/client-react-hooks"
import {useWordle, useWordleDispatch} from "./WordleContext"
import WordleRow from "./WordleRow"

const PROGRAM_FILENAME = "wordle.nada.bin"

const Intro: FC<{onClick: MouseEventHandler<HTMLButtonElement>}> = ({
  onClick,
}) => (
  <div className="text-justify">
    <p className="mb-3 font-bold">Welcome to the Wordle gamemaker wizard!</p>
    <p className="mb-3">
      You will now be taken through the necessary steps to set up a game of
      Nillion Wordle:
    </p>
    <ul className="list-decimal list-inside mb-3">
      <li>Store Wordle Nada program</li>
      <li>Store Word of the Day</li>
      <li>Copy environment variables</li>
    </ul>
    <p className="mb-3">
      This will require you to spend some testnet NIL for the transactions.
    </p>
    <p className="mb-3">
      After restarting Wordle with the correct environment variables, it will be
      ready to play.
    </p>
    <button
      className="flex items-center justify-center px-3 py-1 border rounded text-black text-center my-1 bg-white hover:bg-gray-100 mx-auto"
      onClick={onClick}
    >
      Got it
    </button>
  </div>
)

const StoreProgram = () => {
  const wordleDispatch = useWordleDispatch()
  const nilStoreProgram = useNilStoreProgram()

  // assume the program is in public/wordle.nada.bin
  const programPath = `${window.location.origin}/${PROGRAM_FILENAME}`

  if (nilStoreProgram.isSuccess)
    wordleDispatch({type: "programId", value: nilStoreProgram.data})

  const storeProgram = async () =>
    nilStoreProgram.execute({
      name: "wordle",
      program: new Uint8Array(await (await fetch(programPath)).arrayBuffer()),
    })

  return (
    <div className="flex items-center justify-center mt-3">
      <button
        className={`flex items-center justify-center px-3 py-1 border rounded text-black text-center my-1 ${
          nilStoreProgram.isLoading
            ? "opacity-50 cursor-not-allowed bg-gray-200"
            : "bg-white hover:bg-gray-100"
        }`}
        onClick={storeProgram}
        disabled={!nilStoreProgram.isIdle}
      >
        {nilStoreProgram.isSuccess ? (
          "Stored!"
        ) : nilStoreProgram.isLoading ? (
          <div className="flex flex-row">
            <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin display-inline mr-3"></div>
            Waiting for transaction...
          </div>
        ) : (
          "Store program"
        )}
      </button>
    </div>
  )
}

const StoreWord = () => {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()

  const nilStore = useNilStoreValues()
  const [chars, setChars] = useState(
    Array.from({length: wordle.length}, () => ""),
  )

  if (nilStore.isSuccess)
    wordleDispatch({type: "gmStoreId", value: nilStore.data})

  const storeWord = () => {
    nilStore.execute({
      values: chars.reduce(
        (acc, c, i) =>
          acc.insert(
            NamedValue.parse(`correct_${i + 1}`),
            NadaValue.createSecretInteger(c?.charCodeAt(0)),
          ),
        NadaValues.create(),
      ),
      ttl: 8 as Days,
      acl: StoreAcl.create().allowCompute(
        [wordle.playerUserId as UserId],
        wordle.programId as ProgramId,
      ),
    })
  }

  return (
    <div>
      <WordleRow
        active={nilStore.isIdle}
        chars={chars}
        onCharAt={(x, c) =>
          setChars(chars.map((v, i) => (i === x ? c.toUpperCase() : v)))
        }
      />
      <div className="flex items-center justify-center mt-3">
        <button
          className={`flex items-center justify-center px-3 py-1 border rounded text-black text-center my-1 ${
            nilStore.isLoading
              ? "opacity-50 cursor-not-allowed bg-gray-200"
              : "bg-white hover:bg-gray-100"
          }`}
          onClick={storeWord}
          disabled={!nilStore.isIdle || !chars.every((c) => c)}
        >
          {nilStore.isSuccess ? (
            "Stored!"
          ) : nilStore.isLoading ? (
            <div className="flex flex-row">
              <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin display-inline mr-3"></div>
              Waiting for transaction...
            </div>
          ) : (
            "Store Word of the Day"
          )}
        </button>
      </div>
    </div>
  )
}

const Final = () => {
  const wordle = useWordle()
  const [copied, setCopied] = useState(false)

  const envvars = [
    `NEXT_PUBLIC_WORDLE_PROGRAM_ID=${wordle.programId}`,
    `NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED=${wordle.playerSeed}`,
    `NEXT_PUBLIC_WORDLE_GAMEMAKER_STORE_ID=${wordle.gmStoreId}`,
    `NEXT_PUBLIC_WORDLE_GAMEMAKER_PARTY_ID=${wordle.gmPartyId}`,
  ]

  const envvarsJoined = envvars.join("\n")

  const onClick = () => {
    setCopied(true)
    navigator.clipboard.writeText(envvarsJoined)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="text-left mb-3">
        Now pass <b>only</b> these environment variables to this app in{" "}
        <code>.env</code> or otherwise and restart:
      </p>
      <pre className="text-left rounded border py-2 px-3 mb-5">
        {envvarsJoined}
      </pre>
      <p className="text-left mb-3">
        <i>Note:</i> especially make sure that the{" "}
        <code>NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED</code> variable is
        commented out or otherwise not set.
      </p>
      <button
        className={`flex items-center justify-center px-3 py-1 border rounded text-black text-center my-1 mx-auto bg-white hover:bg-gray-100`}
        onClick={onClick}
      >
        {" "}
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  )
}

export default function WordleGamemakerWizard() {
  const key = useId()
  const wordle = useWordle()
  const [step, setStep] = useState(0)

  const steps = [
    <Intro key={`${key}-intro`} onClick={() => setStep(1)} />,
    <StoreProgram key={`${key}-program`} />,
    <StoreWord key={`${key}-word`} />,
    <Final key={`${key}-final`} />,
  ].map((content, i, all) => (
    <div key={`${key}-${i + 1}-outer`} className="mb-3">
      <div key={`${key}-${i + 1}-inner`} className="text-2xl font-bold mb-3">
        Step {i + 1}/{all.length}
      </div>
      {content}
    </div>
  ))

  if (step === 1 && wordle.programId) setStep(2)

  if (step === 2 && wordle.gmStoreId) setStep(3)

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full text-center">
      {steps.at(step)}
    </div>
  )
}
