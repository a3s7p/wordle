import {useNillion, useNilStoreValues} from "@nillion/client-react-hooks"
import {useWordle, useWordleDispatch} from "./WordleContext"
import WordleRow from "./WordleRow"
import {NadaValue, ValuesPermissionsBuilder} from "@nillion/client-vms"

export default function WordleRowStore() {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const {client} = useNillion()
  const nilStore = useNilStoreValues()

  if (nilStore.isSuccess)
    wordleDispatch({type: "gmStoreId", value: nilStore.data})

  const storeWord = (word: string[]) => {
    nilStore.execute({
      values: word.map((c, i) => ({
        name: `correct_${i + 1}`,
        value: NadaValue.new_secret_integer(c?.charCodeAt(0).toString()),
      })),
      ttl: 3,
      permissions: ValuesPermissionsBuilder.init()
        .owner(client.id)
        .grantCompute(wordle.playerUserId, wordle.programId)
        .build(),
    })
  }

  return <WordleRow active={nilStore.isIdle} onComplete={storeWord} />
}
