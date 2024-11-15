import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <div className="App">
      <FilesUpload />
      <ActionBar />
      <Dashboard />

    </div>
  )
}

export default App;

