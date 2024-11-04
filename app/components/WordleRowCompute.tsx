import { NadaValue, NadaValues, NamedValue, PartyId, PartyName, ProgramBindings, ProgramId, StoreId } from "@nillion/client-core"
import { useNilCompute, useNilComputeOutput, useNillion } from "@nillion/client-react-hooks"
import { FC, useId, useState } from "react"

import { useWordle, useWordleDispatch } from "./WordleContext"
import WordleRow from "./WordleRow"

const WordleRowCompute: FC<{active: boolean}> = ({active}) => {
  const key = useId()
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const {client} = useNillion()
  const nilCompute = useNilCompute()
  const nilComputeOutput = useNilComputeOutput()
  const [chars, setChars] = useState(Array.from({length: wordle.length}, () => ""))
  const [correctMap, setCorrectMap] = useState<boolean[] | undefined>()
  const [isComplete, setIsComplete] = useState<boolean>()

  if (nilCompute.isIdle && chars.every((char) => char)) {
    const bindings = ProgramBindings.create(wordle.programId as ProgramId)
      .addInputParty(PartyName.parse("Gamemaker"), wordle.gmPartyId as PartyId)
      .addInputParty(PartyName.parse("Player"), client.partyId)
      .addOutputParty(PartyName.parse("Player"), client.partyId)

    nilCompute.execute({
      bindings,
      values: chars.reduce((acc, char, i) => acc.insert(
        NamedValue.parse(`guess_${i + 1}`),
        NadaValue.createSecretInteger(char.charCodeAt(0)),
      ), NadaValues.create()),
      storeIds: [wordle.gmStoreId as StoreId],
    })
  }

  if (nilCompute.isSuccess && nilComputeOutput.isIdle) {
    nilComputeOutput.execute({id: nilCompute.data})
  }

  if (nilComputeOutput.isSuccess && !correctMap) {
    setCorrectMap(Object.entries(nilComputeOutput.data).sort().map(([, v]) => Number(v) !== 0))
  }

  if (correctMap && !isComplete) {
    setIsComplete(true)
    setTimeout(() => wordleDispatch({"type": correctMap.every((b) => b) ? "winGame" : "nextRow", value: ""}))
  }

  return <WordleRow
    key={key}
    active={active && !isComplete && !(nilCompute.isLoading || nilComputeOutput.isLoading)}
    chars={chars}
    correctMap={correctMap}
    onCharAt={(x, c) => setChars(chars.map((v, i) => i === x ? c.toUpperCase() : v))}
  />
}

export default WordleRowCompute