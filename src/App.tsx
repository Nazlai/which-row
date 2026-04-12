import { Instructions } from "./components/Instructions/Instructions";
import { Navigation } from "./components/Navigation/Navigation";
import { FindRow } from "./screens/FindRow/FindRow";

function App() {
  return (
    <div className="h-screen bg-neutral-900 text-zinc-100">
      <Navigation />
      <Instructions />
      <FindRow />
    </div>
  );
}

export default App;
