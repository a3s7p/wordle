import {ChangeEventHandler, FC, useId} from "react"

const WordleChar: FC<{
  char: string
  focus: boolean
  active: boolean
  isCorrect: boolean | null
  onChange: ChangeEventHandler<HTMLInputElement>
}> = ({char, focus, active, isCorrect, onChange}) => {
  const key = useId()

  return (
    <input
      ref={(elt) => {
        if (active && focus) elt?.focus()
      }}
      key={key}
      className={`mx-1 my-1 w-[40px] h-[40px] text-black text-center text-3xl font-extrabold ${
        isCorrect !== null
          ? isCorrect
            ? "bg-green-300"
            : "bg-red-300"
          : active
            ? "bg-yellow-100"
            : "bg-purple-200"
      }`}
      value={char}
      onChange={onChange}
      maxLength={1}
      disabled={!active}
    />
  )
}

export default WordleChar
