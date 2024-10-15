"use client";

import { type FC, useState } from "react";
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core";
import { useNilCompute, useNillion } from "@nillion/client-react-hooks";

export const Compute: FC = () => {
  const { client } = useNillion();
  const nilCompute = useNilCompute();
  const [programId, setProgramId] = useState<ProgramId | string>("");
  const [copiedComputeOutputID, setCopiedComputeOutputID] = useState(false);

  const handleClick = () => {
    if (!programId) throw new Error("compute: program id required");

    const bindings = ProgramBindings.create(programId)
      .addInputParty(PartyName.parse("Gamemaker"), client.partyId)
      .addInputParty(PartyName.parse("Player"), client.partyId)
      .addOutputParty(PartyName.parse("Player"), client.partyId);

    const values = NadaValues.create()
      .insert(NamedValue.parse("correct_1"), NadaValue.createSecretInteger(65))  // 'A'
      .insert(NamedValue.parse("correct_2"), NadaValue.createSecretInteger(66))  // 'B'
      .insert(NamedValue.parse("correct_3"), NadaValue.createSecretInteger(67))  // 'C'
      .insert(NamedValue.parse("correct_4"), NadaValue.createSecretInteger(68))  // 'D'
      .insert(NamedValue.parse("correct_5"), NadaValue.createSecretInteger(69))  // 'E'
      .insert(NamedValue.parse("guess_1"), NadaValue.createSecretInteger(70))    // 'F'
      .insert(NamedValue.parse("guess_2"), NadaValue.createSecretInteger(70))    // 'F'
      .insert(NamedValue.parse("guess_3"), NadaValue.createSecretInteger(70))    // 'F'
      .insert(NamedValue.parse("guess_4"), NadaValue.createSecretInteger(70))    // 'F'
      .insert(NamedValue.parse("guess_5"), NadaValue.createSecretInteger(70));   // 'F'

    nilCompute.execute({ bindings, values });
  };

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Compute</h2>
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        placeholder="Program id"
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
      />
      <button
        className={`flex items-center justify-center px-4 py-2 border rounded text-black mb-4 ${
          nilCompute.isLoading || !programId
            ? "opacity-50 cursor-not-allowed bg-gray-200"
            : "bg-white hover:bg-gray-100"
        }`}
        onClick={handleClick}
        disabled={nilCompute.isLoading || !programId}
      >
        {nilCompute.isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        ) : (
          "Compute"
        )}
      </button>
      <p className="my-2 italic text-sm mt-2">
        Current values are:
      </p>
      <p className="my-2 italic text-sm mt-2">
        'A', 'B', 'C', 'D', 'E'
      </p>
      <p className="my-2 italic text-sm mt-2">
        a.k.a.
      </p>
      <p className="my-2 italic text-sm mt-2">
        65, 66, 67, 68, 69
      </p>
      <ul className="list-disc pl-5 mt-4">
        <li className="mt-2">Status: {nilCompute.status}</li>
        <li className="mt-2">
          Compute output id:
          {nilCompute.isSuccess ? (
            <>
              {`${nilCompute.data?.substring(0, 4)}...${nilCompute.data?.substring(nilCompute.data.length - 4)}`}
              <button
                onClick={() => {
                  setCopiedComputeOutputID(true);
                  navigator.clipboard.writeText(nilCompute.data);
                  setTimeout(() => setCopiedComputeOutputID(false), 2000);
                }}
              >
                {!copiedComputeOutputID ? " 📋" : " ✅"}
              </button>
            </>
          ) : (
            "idle"
          )}
        </li>
      </ul>
    </div>
  );
};
