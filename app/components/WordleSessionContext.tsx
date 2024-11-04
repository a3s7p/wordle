"use client"

import React, {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react"

type WordleSessionAction = "nextRow" | "winGame"

const defaultContext = {
  index: 0,
  gameWon: false,
}

const defaultDispatch: Dispatch<WordleSessionAction> = () => {}

const WordleSessionContext = createContext(defaultContext)
const WordleSessionDispatchContext = createContext(defaultDispatch)

export function useWordleSession() {
  return useContext(WordleSessionContext)
}

export function useWordleSessionDispatch() {
  return useContext(WordleSessionDispatchContext)
}

export const WordleSessionProvider: FC<{children: ReactNode}> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(sessionReducer, defaultContext)

  return (
    <WordleSessionContext.Provider value={state}>
      <WordleSessionDispatchContext.Provider value={dispatch}>
        {children}
      </WordleSessionDispatchContext.Provider>
    </WordleSessionContext.Provider>
  )
}

const sessionReducer: Reducer<typeof defaultContext, WordleSessionAction> = (
  state,
  action,
) => {
  switch (action) {
    case "nextRow": {
      return {...state, index: state.index + 1}
    }
    case "winGame": {
      return {...state, gameWon: true}
    }
  }
}
