import React, { ChangeEvent, FC, useEffect, useId, useRef } from "react"

// presentation role only, no state logic here

type Props = {
  y?: number,
  active?: boolean,
  chars: string[],
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

  useEffect(() => {if (active)
    (refs[0].current as any).focus()
  }, [active])

  const inputs = chars.map((char, x) => <input
    ref={refs[x]}
    className={`p-1 mx-1 my-1 w-[38px] h-[38px] border rounded text-black text-center text-4xl font-extrabold ${
      active ? "bg-yellow-100 border-gray-500" : "bg-purple-300 border-gray-300"
    }`}
    key={useId()}
    value={char}
    onChange={(e) => onChange(e, x)}
    maxLength={1}
    disabled={!active}
  />)

  return <div key={useId()}>{inputs}</div>
}
