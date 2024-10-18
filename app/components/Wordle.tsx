"use client";

import React, { useEffect, useState } from "react";
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core";
import { useNilStoreValue, useNilStoreProgram, useNilCompute, useNillion } from "@nillion/client-react-hooks";

function abbrevId(id: string) { return id.substring(0, 6) + "..." + id.substring(id.length - 6) };

export default function Wordle({ length = 5, tries = 6 }) {
  // TODO make this generic
  const nilStoreProgram = useNilStoreProgram();
  const programPath = "http://localhost:3000/main.nada.bin";
  const [programId, setProgramId] = useState<null | ProgramId>();

  // this should only run once and assumes Nillion login is already done by ancestor
  const storeProgram = () => fetch(programPath).then((v) => v.arrayBuffer()).then((v) => nilStoreProgram.execute({
    name: "wordle",
    program: new Uint8Array(v),
  }));

  useEffect(() => {
    nilStoreProgram.isSuccess && setProgramId(nilStoreProgram.data);
    console.log(nilStoreProgram)
  }, [nilStoreProgram.isSuccess]);

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
  const ready_to_store = () => programId && !any_empty();
  const no_load = programId || nilStoreProgram.isLoading || nilStoreProgram.isSuccess;

  const inputs = letters.map((v, i) => <input
    key={"letter_input_" + i + 1}
    className="p-2 mx-1 border border-gray-300 rounded text-black w-[38px] text-center"
    value={v.secret || ""}
    onChange={(e) => v.setSecret(e.target.value.toUpperCase())}
    maxLength={1}
  />);

  const outputs = Array.from({ length: tries }, (_, i) => <div key={`div-${i + 1}`}> {Array.from({ length }, (_, j) => <input
    key={`letter_display_${i + 1}_${j + 1}`}
    className="p-2 mx-1 my-1 border border-gray-300 rounded text-black w-[38px] text-center"
    value="X"
    maxLength={1}
    disabled
  />)}</div>);

  const { client } = useNillion();
  const nilCompute = useNilCompute();

  const compute = () => {
    if (!programId) throw new Error("compute: program id required");

    // hardcoded parties for now
    const bindings = ProgramBindings.create(programId)
      .addInputParty(PartyName.parse("Gamemaker"), client.partyId)
      .addInputParty(PartyName.parse("Player"), client.partyId)
      .addOutputParty(PartyName.parse("Player"), client.partyId);

    // hardcoded word of the day for now
    const correctValues = NadaValues.create()
      .insert(NamedValue.parse("correct_1"), NadaValue.createSecretInteger(65))  // 'A'
      .insert(NamedValue.parse("correct_2"), NadaValue.createSecretInteger(66))  // 'B'
      .insert(NamedValue.parse("correct_3"), NadaValue.createSecretInteger(67))  // 'C'
      .insert(NamedValue.parse("correct_4"), NadaValue.createSecretInteger(68))  // 'D'
      .insert(NamedValue.parse("correct_5"), NadaValue.createSecretInteger(69)); // 'E'

    // but dynamic guess!
    const values = letters.reduce((acc, {secret}, i) => acc.insert(
      NamedValue.parse(`guess_${i + 1}`),
      NadaValue.createSecretInteger(secret.charCodeAt(0)),
    ), correctValues);

    nilCompute.execute({ bindings, values });
  }

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md text-center">
      <button
        className={`flex items-center justify-center px-4 py-2 border rounded text-black mb-4 ${
          no_load ? "opacity-50 cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
        }`}
        onClick={storeProgram}
        disabled={no_load}
      >
        { programId ? "Loaded!" : nilStoreProgram.isLoading ? "Loading program..." : "Load program"}
      </button>
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mb-3">Display Secret Letters</h2>
      {outputs}
      <hr className="my-5"/>
      <h2 className="text-2xl text-center font-bold mt-2 mb-3">Guess Secret Letters</h2>
      {inputs}
      <button
          className={`flex items-center justify-center w-40 px-4 py-2 mt-4 mx-auto text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 ${
            ready_to_store() ? "" : "opacity-50 cursor-not-allowed"
          }`}
          onClick={compute}
          disabled={!ready_to_store()}
        >
          {!any_loading() ? (
            <>Take a guess</>
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
                v.nilStore.status +  " / " + (v.nilStore.isSuccess ? abbrevId(v.nilStore.data) : "-")
              }
              &nbsp;
              <button
                onClick={() => {
                  v.setCopied(true);
                  navigator.clipboard.writeText((v.nilStore as any).data);
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
