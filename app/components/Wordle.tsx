"use client";

import React, { useState } from "react";
import { useNilStoreValue } from "@nillion/client-react-hooks";

export default function Wordle({ length = 5 }) {
  const letters = Array.from({length}, () => {
    const [secret, setSecret] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const nilStore = useNilStoreValue();

    return {
      secret,
      setSecret,
      copied,
      setCopied,
      nilStore,
    };
  });

  const any_loading = () => letters.find(({nilStore}) => nilStore.isLoading) !== undefined;
  const any_empty = () => letters.find(({secret}) => !secret) !== undefined;
  const ready_to_store = () => !(any_loading() || any_empty());

  const inputs = letters.map((v, i) => {
    return (<input
      key={"letter_" + i + 1}
      className="p-2 mx-1 border border-gray-300 rounded text-black w-[38px] text-center"
      value={v.secret || ""}
      onChange={(e) => v.setSecret(e.target.value.toUpperCase())}
      maxLength={1}
    />)
  });

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      <h2 className="text-2xl text-center font-bold mb-3">Store Secret Letters</h2>
      {inputs}
      <button
          className={`flex items-center justify-center w-40 px-4 py-2 mt-4 mx-auto text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 ${
            ready_to_store() ? "" : "opacity-50 cursor-not-allowed"
          }`}
          onClick={() => letters.forEach(({nilStore, secret}, i) => {
            // FIXME: fails without the timeout; race condition in SDK?
            setTimeout(
              () => nilStore.execute({ name: "data", data: secret.charCodeAt(0), ttl: 1 }),
              i * 200,
            )
          })}
          disabled={!ready_to_store()}
        >
          {!any_loading() ? (
            <>Store all</>
          ) : (
            <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          )}
      </button>
      <hr className="my-5"/>
      <ul className="mt-4">
        {
          letters.map((v, i) => (
            <li className="mt-2" key={"value_letter_" + i + 1}>
              <>Letter {i + 1}: </>
              {
                v.nilStore.status +  " / " + (v.nilStore.isSuccess ? (
                  v.nilStore.data?.substring(0, 6) + "..." + v.nilStore.data?.substring(v.nilStore.data.length - 6)
                ) : "-")
              }
              &nbsp;
              <button
                onClick={() => {
                  v.setCopied(true);
                  navigator.clipboard.writeText(v.nilStore.data);
                  setTimeout(() => v.setCopied(false), 2000);
                }}
              >
                {!v.copied ? " 📋" : " ✅"}
              </button>
            </li>
          ))
        }
      </ul>
    </div>
  )
}
