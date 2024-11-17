import { useState } from "react";
import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";
import Dashboard from "./components/dashboard/Dashboard";
import SprintSuccessRate from "./components/charts/sprintSuccessRate/SprintSuccessRate";
import TimelineSlider from "./components/timelineSlider/TimelineSlider";

function App() {
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);

  const handleSprintChange = (sprints: string[]) => {
    setSelectedSprints(sprints);
  };

  return (
    <div className="App">
      <FilesUpload />
      <ActionBar onSprintChange={handleSprintChange} />
      <TimelineSlider sprintNames={selectedSprints}/>
      <Dashboard selectedSprint={selectedSprints} />
      <SprintSuccessRate sprintName={selectedSprints[0]}/>
    </div>
  );
}

export default App;
