"use client"

import { createSignerFromKey } from "@nillion/client-payments"
import { useNillionAuth, useNilStoreProgram, UserCredentials } from "@nillion/client-react-hooks"
import { createContext, FC, ReactNode, useEffect, useState } from "react"
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core"

export const LoginContext = createContext({
  programId: "",
})

export const Login: FC<{children: ReactNode}> = ({children}) => {
  // TODO make this generic
  const nilStoreProgram = useNilStoreProgram()
  const programPath = "http://localhost:3000/main.nada.bin"

  const [programId, setProgramId] = useState<ProgramId | string>("")

  useEffect(() => {if (nilStoreProgram.isSuccess)
    setProgramId(nilStoreProgram.data)
    setIsLoadingProgram(false)
  }, [nilStoreProgram.isSuccess])

  const {authenticated, login, logout} = useNillionAuth()
  // Feel free to set this to other values + useSetState
  const SEED = "example-secret-seed"
  const SECRET_KEY =
    "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5"

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProgram, setIsLoadingProgram] = useState(false)
  useEffect(() => {console.log("authenticated", authenticated)}, [authenticated])

  const handleLogin = async () => {
    try {
      setIsLoading(true)

      const credentials: UserCredentials = {
        userSeed: SEED,
        signer: () => createSignerFromKey(SECRET_KEY),
      }

      await login(credentials)

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
      <div className="flex-row flex my-6">
        {authenticated ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : isLoadingProgram ? "Loading program..." : "Logout"}
          </button>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login & load program"}
          </button>
        )}
      </div>
      <div className="flex-row flex my-6"> {
        authenticated && !isLoading && !isLoadingProgram &&
          <LoginContext.Provider value={{programId}}>{children}</LoginContext.Provider>
      } </div>
    </div>
  )
}
