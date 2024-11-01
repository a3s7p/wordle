import React, { ChangeEvent, FC, useEffect, useId, useRef } from "react"

type Props = {
  y?: number,
  active?: boolean,
  chars: [string, boolean | undefined][],
  onCharAt: (y: number, x: number, c: string) => void,
}

export const WordleRow: FC<Props> = ({y = 0, active = true, chars, onCharAt}) => {
  const last = chars.length - 1
  const refs = chars.map(() => useRef(null))

  const onChange = (e: ChangeEvent<HTMLInputElement>, x: number) => {
    if (x < last) {
      const next = refs[x + 1]
      if (next && next.current)
        (next.current as any).focus()
    }
    onCharAt(y, x, e.target.value)
  }

  useEffect(() => {active && (refs[0]?.current as any)?.focus()}, [active])

  const inputs = chars.map(([char, isCorrect], x) => <input
    key={useId()}
    ref={refs[x]}
    className={`mx-1 my-1 w-[40px] h-[40px] text-black text-center text-3xl font-extrabold ${
      isCorrect !== undefined
      ? isCorrect
        ? "bg-green-300"
        : "bg-red-300"
      : active
        ? "bg-yellow-100"
        : "bg-purple-200"
    }`}
    value={char}
    onChange={(e) => onChange(e, x)}
    maxLength={1}
    disabled={!active}
  />)

  return <div key={useId()}>{inputs}</div>
}
