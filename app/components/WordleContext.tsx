"use client"

import React, { Context, createContext, FC, ReactNode, useContext, useReducer } from 'react'

const defaultContext = {
  tries: 6,
  length: 5,
  programId: process.env.NEXT_PUBLIC_WORDLE_PROGRAM_ID,
  gmSeed: process.env.NEXT_PUBLIC_WORDLE_GAMEMAKER_USER_SEED,
  gmPartyId: process.env.NEXT_PUBLIC_WORDLE_GAMEMAKER_PARTY_ID,
  gmStoreId: process.env.NEXT_PUBLIC_WORDLE_GAMEMAKER_STORE_ID,
  playerSeed: process.env.NEXT_PUBLIC_WORDLE_PLAYER_USER_SEED,
  playerUserId: process.env.NEXT_PUBLIC_WORDLE_PLAYER_USER_ID,
}

const WordleContext = createContext(defaultContext)
const WordleDispatchContext: Context<any> = createContext(null)

export function useWordle() {return useContext(WordleContext)}
export function useWordleDispatch() {return useContext(WordleDispatchContext)}

export const WordleProvider: FC<{children: ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(stateReducer, defaultContext)

  return (
    <WordleContext.Provider value={state}>
      <WordleDispatchContext.Provider value={dispatch}>
        {children}
      </WordleDispatchContext.Provider>
    </WordleContext.Provider>
  )
}

type WordleAction = {type: string, value: string}

const stateReducer = (state: any, action: WordleAction) => {
  switch (action.type) {
    case 'gmPartyId': { return {...state, gmPartyId: action.value } }
    case 'gmStoreId': { return {...state, gmStoreId: action.value } }
    case 'programId': { return {...state, programId: action.value } }
    case 'playerSeed': { return {...state, playerSeed: action.value } }
    case 'playerUserId': { return {...state, playerUserId: action.value } }
    default: { throw Error('Unknown action: ' + action.type) }
  }
}

