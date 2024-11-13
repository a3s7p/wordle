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
import {FC, useState} from "react"

import {useWordle} from "./WordleContext"
import WordleRow from "./WordleRow"
import {useWordleSessionDispatch} from "./WordleSessionContext"

const WordleRowCompute: FC<{active: boolean}> = ({active}) => {
  const wordle = useWordle()
  const wordleSessionDispatch = useWordleSessionDispatch()
  const {client} = useNillion()
  const nilCompute = useNilCompute()
  const nilComputeOutput = useNilComputeOutput()
  const [correctMap, setCorrectMap] = useState<number[] | undefined>()

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
      .map(([, v]) => Number(v))

    setCorrectMap(newCorrectMap)

    setTimeout(() =>
      wordleSessionDispatch(
        newCorrectMap.every((b) => b > 0) ? "winGame" : "nextRow",
      ),
    )
  }

  return (
    <div className="flex flex-row">
      <div
        className={`mr-3 my-auto w-5 h-5 display-inline border-white rounded-full ${
          nilCompute.isLoading || nilComputeOutput.isLoading
            ? "border border-r-0 animate-spin"
            : active
              ? "border animate-pulse"
              : nilCompute.isIdle
                ? ""
                : "border border-gray-700"
        }`}
      ></div>
      <WordleRow
        active={active && !correctMap && nilCompute.isIdle}
        correctMap={correctMap}
        onComplete={onComplete}
      />
    </div>
  )
}

export default WordleRowCompute
