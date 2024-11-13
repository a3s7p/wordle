"use server"

import {NilChainAddress} from "@nillion/client-core"
import {sql} from "@vercel/postgres"

export async function recordGuess(walletAddress: NilChainAddress) {
  await sql`INSERT INTO analytics (wallet) VALUES (${walletAddress}) ON CONFLICT (date, wallet) DO UPDATE SET guesses = analytics.guesses + 1;`
}
