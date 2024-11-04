import {ChangeEventHandler, FC, useId} from "react"

const WordleChar: FC<{
  char: string
  className?: string
  focus: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}> = ({char, className, focus, onChange}) => {
  const key = useId()

  return (
    <input
      ref={(elt) => {
        if (elt && focus) {
          elt.focus()
        }
      }}
      key={key}
      className={`mx-1 my-1 w-[40px] h-[40px] text-black text-center text-3xl font-extrabold ${className}`}
      autoFocus={focus}
      value={char}
      onChange={onChange}
      maxLength={1}
    />
  )
}

export default WordleChar
