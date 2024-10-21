"use client"

import React, { useEffect, useState } from "react"
import { ProgramId } from "@nillion/client-core"
import { useNilStoreProgram, useNilCompute, useNillion } from "@nillion/client-react-hooks"
import { WordleRow } from "./WordleRow"

export default function Wordle({length = 5, tries = 6}) {
  // TODO make this generic
  const nilStoreProgram = useNilStoreProgram()
  const programPath = "http://localhost:3000/main.nada.bin"
  const [programId, setProgramId] = useState<ProgramId | null>()

  // this should only run once and assumes Nillion login is already done by ancestor
  const storeProgram = () => fetch(programPath).then((v) => v.arrayBuffer()).then((v) => nilStoreProgram.execute({
    name: "wordle",
    program: new Uint8Array(v),
  }))

  useEffect(() => {nilStoreProgram.isSuccess && setProgramId(nilStoreProgram.data)}, [nilStoreProgram.isSuccess])
  const noLoad = programId || nilStoreProgram.isLoading

  const computes = Array.from({length: tries}, () => <WordleRow length={length} programId={programId} />)

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      <button
        className={`flex items-center justify-center px-4 py-2 border rounded text-black mb-4 ${
          noLoad ? "opacity-50 cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
        }`}
        onClick={storeProgram}
        disabled={noLoad}
      >
        {programId ? "Loaded!" : nilStoreProgram.isLoading ? "Loading program..." : "Load program"}
      </button>
      <hr className="my-5"/>
      {computes}
    </div>
  )
}
