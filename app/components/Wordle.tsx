"use client"

import React, { useEffect, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyId,
  PartyName,
  ProgramBindings,
  ProgramId,
  StoreId,
} from "@nillion/client-core"
import { useNilCompute, useNilComputeOutput, useNillion } from "@nillion/client-react-hooks"
import { WordleRow } from "./WordleRow"
import { useWordle } from "./WordleContext"

export default function Wordle() {
  const wordle = useWordle()
  const {client} = useNillion()

  // TODO add confetti
  const [gameWon, setGameWon] = useState<boolean>()

  const winGame = () => setGameWon(true)
  const loseGame = () => setGameWon(false)

  // 2D state array of rows x cols for letters
  const [curRow, setCurRow] = useState(0)

  const state = Array.from({length: wordle.tries}, (_, y) => {
    const nilCompute = useNilCompute()
    const nilComputeOutput = useNilComputeOutput()
    const chars = Array.from({length: wordle.length}, () => {
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
        const bindings = ProgramBindings.create(wordle.programId as ProgramId)
          .addInputParty(PartyName.parse("Gamemaker"), wordle.gmPartyId as PartyId)
          .addInputParty(PartyName.parse("Player"), client.partyId)
          .addOutputParty(PartyName.parse("Player"), client.partyId)

        row.nilCompute.execute({
          bindings,
          values: row.chars.reduce((acc, {char}, i) => acc.insert(
            NamedValue.parse(`guess_${i + 1}`),
            NadaValue.createSecretInteger(char.charCodeAt(0)),
          ), NadaValues.create()),
          storeIds: [wordle.gmStoreId as StoreId],
        })
        break
      case "computed":
        if (curRow + 1 >= wordle.tries)
          loseGame()
        setCurRow(curRow + 1)
        break
      case "computed_correct":
        winGame()
        setCurRow(-1)
        break
    }
  }

  return <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
    {gameWon !== undefined && <h3 className="text-xl font-bold uppercase mb-5">you {gameWon ? "win" : "lose"}!</h3>}
    {Array.from({length: wordle.tries}, (_, y) => <WordleRow
      y={y}
      active={y == curRow && !(state[y].nilCompute.isLoading || state[y].nilComputeOutput.isLoading)}
      chars={state[y].chars.map(({char, isCorrect}) => [char, isCorrect])}
      onCharAt={(y: number, x: number, c: string) => state[y].chars[x].setChar(c.toUpperCase())}
    />)}
  </div>
}
