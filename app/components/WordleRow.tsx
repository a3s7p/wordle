import React, {FC, useId, useState} from "react"

import WordleChar from "./WordleChar"

const WordleRow: FC<{
  active: boolean
  chars: string[]
  correctMap?: boolean[]
  onCharAt: (x: number, c: string) => void
}> = ({active, chars, correctMap, onCharAt}) => {
  const key = useId()
  const [index, setIndex] = useState(0)

  return (
    <div key={key}>
      {chars.map((char, x) => {
        return (
          <WordleChar
            key={`{key}-char-${x}`}
            char={char}
            active={active}
            focus={active && x === index}
            isCorrect={correctMap ? correctMap[x] : null}
            onChange={(e) => {
              setIndex(x + 1)
              onCharAt(x, e.target.value)
            }}
          />
        )
      })}
    </div>
  )
}

export default WordleRow
