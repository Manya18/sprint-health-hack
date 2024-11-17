import { useState } from "react";
import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";
import Dashboard from "./components/dashboard/Dashboard";
import TimelineSlider from "./components/timelineSlider/TimelineSlider";
import BacklogTable from "./components/charts/backlogTable/BacklogTable";

function App() {
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);

  const handleSprintChange = (sprints: string[]) => {
    setSelectedSprints(sprints);
  };

  return (
    <div className="App">
      <h1 className="App-title">SprintHealth</h1>
      <FilesUpload />
      <ActionBar onSprintChange={handleSprintChange} />
      {selectedSprints[0] ? (
        <>
          <TimelineSlider sprintNames={selectedSprints} />
          <Dashboard selectedSprint={selectedSprints} />
          <BacklogTable sprintName={selectedSprints[0]} />
        </>
      ) : (
        <div className="App-span">Выберите спринт для анализа</div>
      )}
    </div>
  );
}

export default App;
