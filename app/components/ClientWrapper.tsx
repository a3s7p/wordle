"use client"

import {ReactNode} from "react"

import {NillionProvider} from "@nillion/client-react-hooks"

export const ClientWrapper: React.FC<{children: ReactNode}> = ({children}) => {
  const network =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "photon" : "devnet"
  return <NillionProvider network={network}>{children}</NillionProvider>
}
