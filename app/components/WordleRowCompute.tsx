import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyId,
  PartyName,
  ProgramBindings,
  ProgramId,
  StoreId,
} from "@nillion/client-core"
import {
  useNilCompute,
  useNilComputeOutput,
  useNillion,
} from "@nillion/client-react-hooks"
import {FC, useId, useState} from "react"

import {useWordle} from "./WordleContext"
import WordleRow from "./WordleRow"
import {useWordleSessionDispatch} from "./WordleSessionContext"

const WordleRowCompute: FC<{active: boolean}> = ({active}) => {
  const key = useId()
  const wordle = useWordle()
  const wordleSessionDispatch = useWordleSessionDispatch()
  const {client} = useNillion()
  const nilCompute = useNilCompute()
  const nilComputeOutput = useNilComputeOutput()
  const [correctMap, setCorrectMap] = useState<boolean[] | undefined>()

  const onComplete = (chars: string[]) => {
    if (!nilCompute.isIdle) return

    const bindings = ProgramBindings.create(wordle.programId as ProgramId)
      .addInputParty(PartyName.parse("Gamemaker"), wordle.gmPartyId as PartyId)
      .addInputParty(PartyName.parse("Player"), client.partyId)
      .addOutputParty(PartyName.parse("Player"), client.partyId)

    nilCompute.execute({
      bindings,
      values: chars.reduce(
        (acc, char, i) =>
          acc.insert(
            NamedValue.parse(`guess_${i + 1}`),
            NadaValue.createSecretInteger(char.charCodeAt(0)),
          ),
        NadaValues.create(),
      ),
      storeIds: [wordle.gmStoreId as StoreId],
    })
  }

  if (nilCompute.isSuccess && nilComputeOutput.isIdle) {
    nilComputeOutput.execute({id: nilCompute.data})
  }

  if (nilComputeOutput.isSuccess && !correctMap) {
    const newCorrectMap = Object.entries(nilComputeOutput.data)
      .sort()
      .map(([, v]) => Number(v) !== 0)

    setCorrectMap(newCorrectMap)

    setTimeout(() =>
      wordleSessionDispatch(
        newCorrectMap.every((b) => b) ? "winGame" : "nextRow",
      ),
    )
  }

  return (
    <WordleRow
      key={key}
      active={active && !correctMap && nilCompute.isIdle}
      correctMap={correctMap}
      onComplete={onComplete}
    />
  )
}

export default WordleRowCompute
