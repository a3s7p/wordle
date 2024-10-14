import Image from "next/image";

export const WelcomeContent = () => {
  return (
    <>
      <h1 className="text-3xl font-bold">Nillion Secret Wordle 🆆🤫</h1>
      <p className="mt-3">Make sure you are running <code className="bg-gray-700 rounded-md p-1 mx-1">nillion-devnet</code> in a separate terminal <i>for now</i>.</p>
    </>
  );
};
