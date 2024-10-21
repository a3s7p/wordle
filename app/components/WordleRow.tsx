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

type Input = {
  length: number,
  programId: ProgramId,
  compute: ReturnType<typeof useNilCompute>,
}

export const WordleRowInput: FC<Input> = ({length, programId, compute}) => {
  const {client} = useNillion()
  const inputs = Array.from({length}, () => useState(""))
  const inputsReady = () => inputs.find(([c, _]) => !c) === undefined

  if (inputsReady() && compute.isIdle) {
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
    const values = inputs.reduce((acc, [char, _], i) => acc.insert(
      NamedValue.parse(`guess_${i + 1}`),
      NadaValue.createSecretInteger(char?.charCodeAt(0)),
    ), correctValues)

    compute.execute({bindings, values})
    inputs.forEach(([_, setChar]) => setChar(""))
  }

  return <div>{inputs.map(([char, setChar]) => <input
    className="p-2 mx-1 my-1 border border-gray-300 rounded text-black w-[38px] text-center"
    value={char || ""}
    onChange={(e) => setChar(e.target.value.toUpperCase())}
    maxLength={1}
  />)}</div>
}

type Output = {
  length: number,
  compute: ReturnType<typeof useNilCompute>,
}

export const WordleRowOutput: FC<Output> = ({length, compute}) => {
  const nilComputeOutput = useNilComputeOutput()
  const outputs = Array.from({length}, () => useState("-"))

  useEffect(() => {
    if (nilComputeOutput.isSuccess) {
      for (const [k, v] of Object.entries(nilComputeOutput.data))
        outputs[Number(k.split("_").at(-1)) - 1][1](String.fromCharCode(Number(v)))

    } else if (compute.isSuccess) {
      nilComputeOutput.execute({id: compute.data})
    }
  }, [compute.isSuccess, nilComputeOutput.isSuccess])

  return <div>
    {outputs.map(([char, _]) => <input
      className="p-2 mx-1 my-1 border border-gray-300 rounded text-black w-[38px] text-center"
      disabled={true}
      maxLength={1}
      value={char || "-"}
    />)}
  </div>
}
