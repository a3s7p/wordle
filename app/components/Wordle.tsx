"use client"

import React, { useContext, useEffect, useId, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
} from "@nillion/client-core"
import { useNilCompute, useNilComputeOutput, useNillion } from "@nillion/client-react-hooks"
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

  // hardcoded word of the day for now
  const values = NadaValues.create()
    .insert(NamedValue.parse("correct_1"), NadaValue.createSecretInteger(65)) // 'A'
    .insert(NamedValue.parse("correct_2"), NadaValue.createSecretInteger(66)) // 'B'
    .insert(NamedValue.parse("correct_3"), NadaValue.createSecretInteger(67)) // 'C'
    .insert(NamedValue.parse("correct_4"), NadaValue.createSecretInteger(68)) // 'D'
    .insert(NamedValue.parse("correct_5"), NadaValue.createSecretInteger(69)) // 'E'

  // TODO add confetti
  const winGame = () => window.alert("YOU WON")
  const loseGame = () => window.alert("YOU LOST")

  const isFilled = (chars: [string, any][]) => chars.find(([c, _]) => !c) === undefined

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
        row.nilCompute.execute({bindings, values: row.chars.reduce((acc, [c, _], i) => acc.insert(
          NamedValue.parse(`guess_${i + 1}`),
          NadaValue.createSecretInteger(c?.charCodeAt(0)),
        ), values)})

        row.chars.forEach(([_, setChar]) => setChar("?"))
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
      <p>...</p>
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Guess Word</h2>
      {Array.from({length: tries}, (_, y) => <WordleRow
        key={useId()}
        y={y}
        active={y == curRow}
        chars={state[y].chars.map(([c, _]) => c)}
        onCharAt={(y: number, x: number, c: string) => state[y].chars[x][1](c.toUpperCase())}
      />)}
    </div>
  )
}
