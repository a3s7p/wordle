import {FC, useState} from "react"
import {NadaValue, UserId} from "@nillion/client-vms"
import {
  useNilInvokeCompute,
  useNillion,
  useNilRetrieveComputeResults,
} from "@nillion/client-react-hooks"

import {useWordle} from "./WordleContext"
import WordleRow from "./WordleRow"
import {useWordleSessionDispatch} from "./WordleSessionContext"
import {recordGuess} from "../actions"

const WordleRowCompute: FC<{active: boolean}> = ({active}) => {
  const wordle = useWordle()
  const wordleSessionDispatch = useWordleSessionDispatch()
  const {client} = useNillion()
  const nilCompute = useNilInvokeCompute()
  const nilComputeOutput = useNilRetrieveComputeResults()
  const [correctMap, setCorrectMap] = useState<number[] | undefined>()

  if (nilCompute.isError) {
    console.log(nilCompute.error)
  }

  if (nilComputeOutput.isError) {
    console.log(nilComputeOutput.error.message)
  }

  const onComplete = (chars: string[]) => {
    if (!nilCompute.isIdle) return

    const gmUid = new UserId(
      Uint8Array.from(Buffer.from(wordle.gmPartyId, "hex")),
    )

    console.log("Computing...")
    console.log("gm uid hex:", wordle.gmPartyId)
    console.log("gm uid raw:", gmUid)
    console.log("player uid hex:", client.id.toHex())
    console.log("player uid raw:", client.id)
    console.log("state:", wordle)

    nilCompute.execute({
      programId: wordle.programId,
      inputBindings: [
        {party: "Player", user: client.id},
        {party: "Gamemaker", user: gmUid},
      ],
      outputBindings: [{party: "Player", users: [client.id]}],
      computeTimeValues: chars.map((char, i) => ({
        name: `guess_${i + 1}`,
        value: NadaValue.new_secret_integer(char.charCodeAt(0).toString()),
      })),
      valueIds: [wordle.gmStoreId],
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
    const nextEvent = newCorrectMap.every((b) => b > 0) ? "winGame" : "nextRow"

    setTimeout(() => {
      wordleSessionDispatch(nextEvent)
      recordGuess.bind(null, client.payer.chain.address)()
    })
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
