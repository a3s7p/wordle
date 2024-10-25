"use client"

import React, { useContext, useEffect, useId, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  StoreId,
  StoreAcl,
  ProgramId,
} from "@nillion/client-core"
import { useNilCompute, useNilComputeOutput, useNillion, useNilStoreValues } from "@nillion/client-react-hooks"
import { WordleRow } from "./WordleRow"
import { LoginContext } from "./Login"

export default function Wordle({length = 5, tries = 6}) {
  const {client} = useNillion()
  const ctx = useContext(LoginContext)

  // set up basic Nillion data
  // hardcoded parties for now
  const bindings = ProgramBindings.create(ctx.programId)
    .addInputParty(PartyName.parse("Gamemaker"), client.partyId)
    .addInputParty(PartyName.parse("Player"), client.partyId)
    .addOutputParty(PartyName.parse("Player"), client.partyId)

  // TODO add confetti
  const winGame = () => window.alert("YOU WON")
  const loseGame = () => window.alert("YOU LOST")

  const isFilled = (chars: [string, any][]) => chars.find(([c, _]) => !c) === undefined

  // gamemaker input
  const nilStore = useNilStoreValues()
  const wordOfTheDay = Array.from({length}, () => useState(""))
  const [wordStoreId, setWordStoreId] = useState<StoreId | string>("")

  useEffect(() => {nilStore.isSuccess && setWordStoreId(nilStore.data)}, [nilStore.isSuccess])

  const storeWord = () => {
    nilStore.execute({
      values: wordOfTheDay.reduce((acc, [c, _], i) => acc.insert(
        NamedValue.parse(`correct_${i + 1}`),
        NadaValue.createSecretInteger(c?.charCodeAt(0)),
      ), NadaValues.create()),
      ttl: (1 as any),
      acl: StoreAcl.create().allowCompute([client.userId], ctx.programId as any),
    })
  }

  const wordStoreReady = () => nilStore.isIdle && isFilled(wordOfTheDay)

  // player input
  // 2D state array of rows x cols for letters
  const [curRow, setCurRow] = useState(0)

  const state = Array.from({length: tries}, (_, y) => {
    const nilCompute = useNilCompute()
    const nilComputeOutput = useNilComputeOutput()
    const chars = Array.from({length}, () => useState(""))

    const [status, setStatus] = useState("idle")

    useEffect(() => {if (nilCompute.isSuccess) nilComputeOutput.execute({id: nilCompute.data})}, [nilCompute.isSuccess])

    useEffect(() => {if (nilComputeOutput.isSuccess) {
      const letters = Object.entries(nilComputeOutput.data).sort()
      chars.forEach(([_, setChar]) => setChar("-"))

      if (letters.filter(([_, c]) => Number(c) !== 0).length === length)
        setStatus("computed_correct")
      else
        setStatus("computed")

      letters.forEach(([_, c], x) => c != 0 && chars[x][1](String.fromCharCode(Number(c))))
    }}, [nilComputeOutput.isSuccess])

    const wasFilled = () => status == "idle" && isFilled(chars)

    useEffect(() => {checkStatus(y)}, [status])
    useEffect(() => {wasFilled() && setStatus("guessed")}, [chars])

    return {nilCompute, nilComputeOutput, chars, status, setStatus}
  })

  // 1-way state flow for player rows
  const checkStatus = (y: number) => {
    const row = state[y]

    switch (row.status) {
      case "guessed":
        row.chars.forEach(([_, setChar]) => setChar("?"))
        row.nilCompute.execute({
          bindings,
          values: row.chars.reduce((acc, [c, _], i) => acc.insert(
            NamedValue.parse(`guess_${i + 1}`),
            NadaValue.createSecretInteger(c?.charCodeAt(0)),
          ), NadaValues.create()),
          storeIds: [wordStoreId],
          })
        break
      case "computed":
        if (curRow + 1 >= tries)
          // hacky schedule after row re-render with new state
          setTimeout(() => loseGame(), 1000)
        else
          setCurRow(curRow + 1)
        break
      case "computed_correct":
        // hacky schedule after row re-render with new state
        setTimeout(() => winGame(), 1000)
        break
    }
  }

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Set Word</h2>
      <WordleRow
        key={useId()}
        active={nilStore.isIdle}
        chars={wordOfTheDay.map(([c, _]) => c)}
        onCharAt={(_, x, c) => wordOfTheDay[x][1](c.toUpperCase())}
      />
      <div className="flex items-center justify-center mt-3">
        <button className={`flex items-center justify-center px-4 py-2 border rounded text-black text-center mb-4 ${
          wordStoreReady()
            ? "bg-white hover:bg-gray-100"
            : "opacity-50 cursor-not-allowed bg-gray-200"
          }`}
          onClick={storeWord}
          disabled={!wordStoreReady()}
        >{
          wordStoreId
          ? "Stored!"
          : nilStore.isLoading
            ? <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            : "Store"
        }</button>
      </div>
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Guess Word</h2>
      <p className={`text-italic mb-3 ${wordStoreId ? "hidden" : ""}`}>Please set the word first.</p>
      {Array.from({length: tries}, (_, y) => <WordleRow
        key={useId()}
        y={y}
        active={wordStoreId.length > 0 && y == curRow && !(state[y].nilCompute.isLoading || state[y].nilComputeOutput.isLoading)}
        chars={state[y].chars.map(([c, _]) => c)}
        onCharAt={(y: number, x: number, c: string) => state[y].chars[x][1](c.toUpperCase())}
      />)}
    </div>
  )
}
