import { useNilCompute, useNilComputeOutput, useNillion } from "@nillion/client-react-hooks"
import React, { FC, useContext, useEffect, useState } from "react"

import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core"
import { LoginContext } from "./Login"

// Wordle row input or output component.

type Props = {
  length: number,
  bindings: ProgramBindings,
  values: NadaValues,
}

export const WordleRow: FC<Props> = ({length, bindings, values}) => {
  const ctx = useContext(LoginContext)
  const nilCompute = useNilCompute()
  const nilComputeOutput = useNilComputeOutput()
  const cells = Array.from({length}, () => useState(""))

  useEffect(() => {nilCompute.isSuccess && nilComputeOutput.execute({id: nilCompute.data})}, [nilCompute.isSuccess])

  useEffect(() => {if (nilComputeOutput.isSuccess)
    for (const [k, v] of Object.entries(nilComputeOutput.data))
      cells[Number(k.split("_").at(-1)) - 1][1](String.fromCharCode(Number(v)))
  }, [nilComputeOutput.isSuccess])

  useEffect(() => {
    if (!nilCompute.isIdle)
      return

    if (cells.find(([c, _]) => !c) !== undefined)
      return

    nilCompute.execute({bindings, values: cells.reduce((acc, [char, _], i) => acc.insert(
      NamedValue.parse(`guess_${i + 1}`),
      NadaValue.createSecretInteger(char?.charCodeAt(0)),
    ), values)})
  }, [cells])

  return <div>{cells.map(([char, setChar]) => <input
    className={"p-2 mx-1 my-1 border border-gray-300 rounded text-black w-[38px] text-center"}
    value={char || ""}
    onChange={(e) => setChar(e.target.value.toUpperCase())}
    maxLength={1}
    disabled={!nilCompute.isIdle}
  />)}</div>
}
