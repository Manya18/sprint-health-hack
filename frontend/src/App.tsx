import { useState } from "react";
import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);

  const handleSprintChange = (sprints: string[]) => {
    setSelectedSprints(sprints);
  };

  return (
    <div className="App">
      <FilesUpload />
      <ActionBar onSprintChange={handleSprintChange} />
      <Dashboard selectedSprint={selectedSprints} />
    </div>
  );
}

export default App;
