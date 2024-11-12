import React from "react"
import {sql} from "@vercel/postgres"

export default async function Cart({
  params,
}: {
  params: {user: string}
}): Promise<JSX.Element> {
  const {rows} = await sql`select * from analytics where wallet=${params.user}`

  return (
    <div>
      {rows.map((row) => (
        <div key={row.id}>
          {row.id} - {row.quantity}
        </div>
      ))}
    </div>
  )
}
