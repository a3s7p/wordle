import { useNilCompute, useNilComputeOutput, useNillion } from "@nillion/client-react-hooks"
import React, { FC, useEffect, useState } from "react"

import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core"

// Wordle row input or output component.

type Props = {length: number, programId: ProgramId | null}

export const WordleRow: FC<Props> = ({length, programId}) => {
  const {client} = useNillion()
  const nilCompute = useNilCompute()
  const nilComputeOutput = useNilComputeOutput()
  const cells = Array.from({length}, () => useState(""))

  useEffect(() => {nilCompute.isSuccess && nilComputeOutput.execute({id: nilCompute.data})}, [nilCompute.isSuccess])

  useEffect(() => {if (nilComputeOutput.isSuccess)
    for (const [k, v] of Object.entries(nilComputeOutput.data))
      cells[Number(k.split("_").at(-1)) - 1][1](String.fromCharCode(Number(v)))
  }, [nilComputeOutput.isSuccess])

  useEffect(() => {
    if (!programId)
      return

    if (!nilCompute.isIdle)
      return

    if (cells.find(([c, _]) => !c) !== undefined)
      return

    // hardcoded parties for now
    const bindings = ProgramBindings.create(programId)
      .addInputParty(PartyName.parse("Gamemaker"), client.partyId)
      .addInputParty(PartyName.parse("Player"), client.partyId)
      .addOutputParty(PartyName.parse("Player"), client.partyId)

    // hardcoded word of the day for now
    const correctValues = NadaValues.create()
      .insert(NamedValue.parse("correct_1"), NadaValue.createSecretInteger(65)) // 'A'
      .insert(NamedValue.parse("correct_2"), NadaValue.createSecretInteger(66)) // 'B'
      .insert(NamedValue.parse("correct_3"), NadaValue.createSecretInteger(67)) // 'C'
      .insert(NamedValue.parse("correct_4"), NadaValue.createSecretInteger(68)) // 'D'
      .insert(NamedValue.parse("correct_5"), NadaValue.createSecretInteger(69)) // 'E'

    // but dynamic guess
    const values = cells.reduce((acc, [char, _], i) => acc.insert(
      NamedValue.parse(`guess_${i + 1}`),
      NadaValue.createSecretInteger(char?.charCodeAt(0)),
    ), correctValues)

    nilCompute.execute({bindings, values})
  }, [cells])

  return <div>{cells.map(([char, setChar]) => <input
    className={"p-2 mx-1 my-1 border border-gray-300 rounded text-black w-[38px] text-center"}
    value={char || ""}
    onChange={(e) => setChar(e.target.value.toUpperCase())}
    maxLength={1}
    disabled={!nilCompute.isIdle}
  />)}</div>
}

