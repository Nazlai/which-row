import { Instructions } from "./components/Instructions/Instructions";
import { Navigation } from "./components/Navigation/Navigation";
import { FindRow } from "./screens/FindRow/FindRow";

function App() {
  return (
    <div className="h-full text-zinc-100 mb-10">
      <Navigation />
      <Instructions />
      <FindRow />
    </div>
  );
}

export default App;
