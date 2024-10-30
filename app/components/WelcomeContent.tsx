import {metadata} from "../layout"

export const WelcomeContent = () => <h1 className="text-3xl font-bold">{metadata.title as string}</h1>
