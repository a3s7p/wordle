import {useNillion, useNilStoreValues} from "@nillion/client-react-hooks"
import {useWordle, useWordleDispatch} from "./WordleContext"
import WordleRow from "./WordleRow"
import {NadaValue, UserId, ValuesPermissionsBuilder} from "@nillion/client-vms"

export default function WordleRowStore() {
  const wordle = useWordle()
  const wordleDispatch = useWordleDispatch()
  const {client} = useNillion()
  const nilStore = useNilStoreValues()

  if (nilStore.isSuccess)
    wordleDispatch({type: "gmStoreId", value: nilStore.data})

  const storeWord = (word: string[]) => {
    const pUid = new UserId(
      Uint8Array.from(Buffer.from(wordle.playerUserId, "hex")),
    )

    console.log("Storing...")
    console.log("gm uid hex:", client.id.toHex())
    console.log("gm uid raw:", client.id)
    console.log("player uid hex:", wordle.playerUserId)
    console.log("player uid raw:", pUid)

    nilStore.execute({
      values: word.map((c, i) => ({
        name: `correct_${i + 1}`,
        value: NadaValue.new_secret_integer(c?.charCodeAt(0).toString()),
      })),
      ttl: 3,
      permissions: ValuesPermissionsBuilder.init()
        .owner(client.id)
        .grantCompute(pUid, wordle.programId)
        .build(),
    })
  }

  return <WordleRow active={nilStore.isIdle} onComplete={storeWord} />
}
