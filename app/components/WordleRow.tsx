import React, { FC, useId } from "react"

// presentation role only, no state logic here

type Props = {
  y?: number,
  active?: boolean,
  chars: string[],
  onCharAt: (y: number, x: number, c: string) => void,
}

export const WordleRow: FC<Props> = ({y = 0, active = true, chars, onCharAt}) => {
  return <div key={useId()}>{chars.map((char, x) => <input
    className={`p-1 mx-1 my-1 w-[38px] h-[38px] border rounded text-black text-center text-4xl font-extrabold ${
      active ? "bg-yellow-100 border-gray-500" : "bg-purple-300 border-gray-300"
    }`}
    key={useId()}
    value={char}
    onChange={(e) => onCharAt(y, x, e.target.value)}
    maxLength={1}
    disabled={!active}
  />)}</div>
}
