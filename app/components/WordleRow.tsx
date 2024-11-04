import React, {FC, useId, useState} from "react"

import WordleChar from "./WordleChar"
import {useWordle} from "./WordleContext"

const WordleRow: FC<{
  active?: boolean
  correctMap?: boolean[]
  onComplete: (s: string[]) => void
}> = ({active = true, correctMap, onComplete}) => {
  const key = useId()
  const wordle = useWordle()
  const [index, setIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [chars, setChars] = useState(
    Array.from({length: wordle.length}, () => ""),
  )

  return (
    <fieldset key={key} disabled={!active}>
      {chars.map((char, x) => {
        return (
          <WordleChar
            key={`{key}-char-${x}`}
            char={char}
            className={
              correctMap
                ? correctMap[x]
                  ? "bg-green-300"
                  : "bg-red-300"
                : active
                  ? "bg-yellow-100"
                  : "bg-purple-200"
            }
            focus={!isComplete && active && x === index}
            onChange={(e) => {
              setIndex(x + 1)

              const newChars = chars.map((c, i) =>
                i === x ? e.target.value.toUpperCase() : c,
              )
              setChars(newChars)

              if (!isComplete && newChars.every((c) => c)) {
                setIsComplete(true)
                onComplete(newChars)
              }
            }}
          />
        )
      })}
    </fieldset>
  )
}

export default WordleRow
