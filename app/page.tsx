import Login from "./components/Login";
import { WelcomeContent } from "./components/WelcomeContent";
import { WordleProvider } from "./components/WordleContext";

export default function Home() {
  return <main className="flex min-h-screen flex-col items-center justify-center p-24">
    <div className="w-full flex flex-col items-center font-mono text-sm">
      <WelcomeContent />
      <WordleProvider>
        <Login />
      </WordleProvider>
    </div>
  </main>
}
