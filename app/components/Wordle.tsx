"use client"

import React, {useId} from "react"

import {useWordle} from "./WordleContext"
import WordleRowCompute from "./WordleRowCompute"

export default function Wordle() {
  const key = useId()
  const wordle = useWordle()

  return (
    <div
      key={key}
      className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center"
    >
      {wordle.gameWon ? (
        <h3 className="text-xl font-bold uppercase mb-5">you won!</h3>
      ) : wordle.index >= wordle.tries ? (
        <h3 className="text-xl font-bold uppercase mb-5">you lost!</h3>
      ) : null}
      {Array.from({length: wordle.tries}, (_, y) => (
        <WordleRowCompute key={`${key}-row-${y}`} active={y == wordle.index} />
      ))}
    </div>
  )
}
