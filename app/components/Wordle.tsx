"use client";

import React, { useEffect, useState } from "react";
import { ProgramId } from "@nillion/client-core";
import { useNilStoreProgram, useNilCompute, useNillion } from "@nillion/client-react-hooks";
import { WordleRowInput, WordleRowOutput } from "./WordleRow";

export default function Wordle({length = 5, tries = 6}) {
  // TODO make this generic
  const nilStoreProgram = useNilStoreProgram();
  const programPath = "http://localhost:3000/main.nada.bin";
  const [programId, setProgramId] = useState<null | ProgramId>();

  // this should only run once and assumes Nillion login is already done by ancestor
  const storeProgram = () => fetch(programPath).then((v) => v.arrayBuffer()).then((v) => nilStoreProgram.execute({
    name: "wordle",
    program: new Uint8Array(v),
  }));

  useEffect(() => {nilStoreProgram.isSuccess && setProgramId(nilStoreProgram.data)}, [nilStoreProgram.isSuccess]);
  const noLoad = programId || nilStoreProgram.isLoading || nilStoreProgram.isSuccess;

  const computes = Array.from({length: 1}, () => {
    const compute = useNilCompute();

    const input = <WordleRowInput length={length} programId={programId} compute={compute} />
    const output = <WordleRowOutput length={length} compute={compute} />

    return { input, output }
  })

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
      <h2 className="text-2xl text-center font-bold mb-3">Display Secret Letters</h2>
      {computes.map(({output}) => output)}
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Guess Secret Letters</h2>
      {computes.map(({input}) => input)}
    </div>
  )
}
