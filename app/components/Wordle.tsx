"use client"

import React, { useContext, useEffect, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  StoreId,
  StoreAcl,
  PartyId,
  ProgramId,
} from "@nillion/client-core"
import { useNilCompute, useNilComputeOutput, useNillion, useNilStoreValues } from "@nillion/client-react-hooks"
import { WordleRow } from "./WordleRow"
import { LoginContext } from "./Login"

export default function Wordle({length = 5, tries = 6}) {
  const {client} = useNillion()
  const ctx = useContext(LoginContext)

  // TODO add confetti
  const [gameWon, setGameWon] = useState<boolean>()

  const winGame = () => setGameWon(true)
  const loseGame = () => setGameWon(false)

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
      acl: StoreAcl.create().allowCompute([client.userId], ctx.programId as ProgramId),
    })
  }

  const wordStoreReady = () => nilStore.isIdle && wordOfTheDay.every(([c, _]) => c)

  // player input
  // 2D state array of rows x cols for letters
  const [curRow, setCurRow] = useState(0)

  const state = Array.from({length: tries}, (_, y) => {
    const nilCompute = useNilCompute()
    const nilComputeOutput = useNilComputeOutput()
    const chars = Array.from({length}, () => {
      const [isCorrect, setIsCorrect] = useState<boolean>()
      const [char, setChar] = useState("")

      return {char, setChar, isCorrect, setIsCorrect}
    })

    const [status, setStatus] = useState("idle")

    useEffect(() => {if (nilCompute.isSuccess) nilComputeOutput.execute({id: nilCompute.data})}, [nilCompute.isSuccess])

    useEffect(() => {if (nilComputeOutput.isSuccess) {
      const letters = Object.entries(nilComputeOutput.data).sort()
      if (letters.every(([_, c]) => Number(c) !== 0))
        setStatus("computed_correct")
      else
        setStatus("computed")

      letters.forEach(([_, c], x) => chars[x].setIsCorrect(c != 0))
    }}, [nilComputeOutput.isSuccess])

    const wasFilled = () => status == "idle" && chars.every(({char}) => char)

    useEffect(() => {checkStatus(y)}, [status])
    useEffect(() => {wasFilled() && setStatus("guessed")}, [chars])

    return {nilCompute, nilComputeOutput, chars, status, setStatus}
  })

  // 1-way state flow for player rows
  const checkStatus = (y: number) => {
    const row = state[y]

    switch (row.status) {
      case "guessed":
        const bindings = ProgramBindings.create(ctx.programId)
          .addInputParty(PartyName.parse("Gamemaker"), client.partyId)
          .addInputParty(PartyName.parse("Player"), client.partyId)
          .addOutputParty(PartyName.parse("Player"), client.partyId)

        row.nilCompute.execute({
          bindings,
          values: row.chars.reduce((acc, {char}, i) => acc.insert(
            NamedValue.parse(`guess_${i + 1}`),
            NadaValue.createSecretInteger(char.charCodeAt(0)),
          ), NadaValues.create()),
          storeIds: [wordStoreId],
        })
        break
      case "computed":
        if (curRow + 1 >= tries)
          loseGame()
        setCurRow(curRow + 1)
        break
      case "computed_correct":
        winGame()
        setCurRow(-1)
        break
    }
  }

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      {ctx.isGamemaker ? <div>
        <h3 className="text-xl font-bold mb-3">Word of the Day</h3>
        <WordleRow
          active={nilStore.isIdle}
          chars={wordOfTheDay.map(([c, _]) => [c, undefined])}
          onCharAt={(_, x, c) => wordOfTheDay[x][1](c.toUpperCase())}
        />
        <div className="flex items-center justify-center mt-3">
          <button className={`flex items-center justify-center px-3 py-1 border rounded text-black text-center my-1 ${
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
              : "Store word"
          }</button>
        </div>
      </div> : <div>
        {gameWon !== undefined && <h3 className="text-xl font-bold uppercase mb-5">you {gameWon ? "win" : "lose"}!</h3>}
        {Array.from({length: tries}, (_, y) => <WordleRow
          y={y}
          active={wordStoreId.length > 0 && y == curRow && !(state[y].nilCompute.isLoading || state[y].nilComputeOutput.isLoading)}
          chars={state[y].chars.map(({char, isCorrect}) => [char, isCorrect])}
          onCharAt={(y: number, x: number, c: string) => state[y].chars[x].setChar(c.toUpperCase())}
        />)}
      </div>}
    </div>
  )
}
