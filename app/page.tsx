import { WelcomeContent } from "./components/WelcomeContent";
import { Login } from "./components/Login";
import Wordle from "./components/Wordle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full flex flex-col items-center font-mono text-sm">
        <WelcomeContent />
        <Login>
          <div className="w-full flex flex-col items-center max-w-4xl mx-auto mb-5">
            <Wordle />
          </div>
        </Login>
      </div>
    </main>
  );
}
