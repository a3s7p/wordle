import {useNilStoreValues} from "@nillion/client-react-hooks"
import {
  Days,
  NadaValue,
  NadaValues,
  NamedValue,
  ProgramId,
  StoreAcl,
  UserId,
} from "@nillion/client-core"

import {useWordle, useWordleDispatch} from "./WordleContext"
import WordleRow from "./WordleRow"

const WordleRowStore = () => {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const nilStore = useNilStoreValues()

  if (nilStore.isSuccess)
    wordleDispatch({type: "gmStoreId", value: nilStore.data})

  const storeWord = (word: string[]) => {
    nilStore.execute({
      values: word.reduce(
        (acc, c, i) =>
          acc.insert(
            NamedValue.parse(`correct_${i + 1}`),
            NadaValue.createSecretInteger(c?.charCodeAt(0)),
          ),
        NadaValues.create(),
      ),
      ttl: 3 as Days,
      acl: StoreAcl.create().allowCompute(
        [wordle.playerUserId as UserId],
        wordle.programId as ProgramId,
      ),
    })
  }

  return <WordleRow active={nilStore.isIdle} onComplete={storeWord} />
}

export default WordleRowStore
