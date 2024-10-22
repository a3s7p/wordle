"use client"

import React, { useContext, useEffect, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core"
import { useNilStoreProgram, useNilCompute, useNillion } from "@nillion/client-react-hooks"
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

  const [isWordSet, setIsWordSet] = useState(false);

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Set Word</h2>
      <p>...</p>
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Guess Word</h2>
      {isWordSet ? Array.from({length: tries}, () => <WordleRow
        length={length}
        bindings={bindings}
        values={values}
      />) : <p><i>Please set a word first.</i></p>}
    </div>
  )
}
