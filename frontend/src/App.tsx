import { useState } from "react";
import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";
import Dashboard from "./components/dashboard/Dashboard";
import TimelineSlider from "./components/timelineSlider/TimelineSlider";

interface ChartData {
  id: string;
  type: string;
  data: any;
  name: string;
  xAxisTitle: string;
  yAxisTitle: string;
  title: string;
  gridPosition: { x: number; y: number; w: number; h: number };
}

function App() {
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);

  const handleSprintChange = (sprints: string[]) => {
    setSelectedSprints(sprints);
  };

  return (
    <div className="App">
      <h1 className="App-title">SprintHealth</h1>
      <FilesUpload />
      <ActionBar
        onSprintChange={handleSprintChange}
        setCharts={setCharts}
      />
      {selectedSprints.length > 0 ? (
        <>
          <TimelineSlider sprintNames={selectedSprints} />
          <Dashboard selectedSprint={selectedSprints} chartsBase={charts} />
        </>
      ) : (
        <div className="App-span">Выберите спринт для анализа</div>
      )}
    </div>
  );
}

export default App;
