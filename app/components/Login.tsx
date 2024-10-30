"use client"

import { useNillionAuth, useNilStoreProgram } from "@nillion/client-react-hooks"
import { createContext, FC, ReactNode, useEffect, useState } from "react"
import { PartyId, ProgramId, StoreId, UserId } from "@nillion/client-core"

export const LoginContext = createContext<{
  gamemakerId: PartyId | string,
  programId: ProgramId | string,
  wordStoreId: StoreId | string,
  isGamemaker: boolean,
}>({
  gamemakerId: "",
  programId: "",
  wordStoreId: "",
  isGamemaker: true,
})

export const Login: FC<{children: ReactNode}> = ({children}) => {
  // TODO make this generic
  const nilStoreProgram = useNilStoreProgram()
  const programPath = "http://localhost:3000/main.nada.bin"

  const [gamemakerId, setGamemakerId] = useState<UserId | string>("")
  const [programId, setProgramId] = useState<ProgramId | string>("")
  const [wordStoreId, setWordStoreId] = useState<StoreId | string>("")
  const [isGamemaker, setIsGamemaker] = useState(true)

  useEffect(() => {
    if (nilStoreProgram.isSuccess)
      setProgramId(nilStoreProgram.data)
    setIsLoadingProgram(false)
  }, [nilStoreProgram.isSuccess])

  const {authenticated, login, logout} = useNillionAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProgram, setIsLoadingProgram] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await login({userSeed: "wordle-user-seed"})

      setIsLoadingProgram(true)
      nilStoreProgram.execute({
        name: "wordle",
        program: new Uint8Array(await (await fetch(programPath)).arrayBuffer())
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex-row flex justify-center my-6">
        <button
          className={`border border-white bg-black ${(authenticated && programId) ? "hover:bg-red-800/50" : "hover:bg-green-800/50"} hover:shadow-md hover:shadow-neutral-500 text-white font-bold py-1 px-3 rounded`}
          onClick={authenticated ? handleLogout : handleLogin}
          disabled={isLoading || isLoadingProgram}
        >
          {isLoading ? "Loading..." : isLoadingProgram ? "Loading program..." : authenticated ? "Log out" : "Log in with Keplr"}
        </button>
      </div>
      {authenticated && !(isLoading || isLoadingProgram) ? <div className="flex-row flex justify-center my-6">
        <button
          className={`border border-white bg-black hover:bg-purple-800/50 hover:shadow-md hover:shadow-neutral-500 text-white font-bold py-1 px-3 rounded`}
          onClick={() => setIsGamemaker(!isGamemaker)}
        >
          Switch role to {isGamemaker ? "player" : "gamemaker"}
        </button>
      </div> : <></>}
      <div className="flex-row flex justify-center my-6"> {
        authenticated && !isLoading && !isLoadingProgram &&
          <LoginContext.Provider value={{
            programId,
            gamemakerId,
            wordStoreId,
            isGamemaker,
          }}>{children}</LoginContext.Provider>
      } </div>
    </div>
  )
}
