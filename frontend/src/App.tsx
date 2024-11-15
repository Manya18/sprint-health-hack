// import React, { useState } from "react";
import "./App.css";
import ActionBar from "./components/actionBar/ActionBar";
import FilesUpload from "./components/filesUpload/FilesUpload";

function App() {
  return(
    <div className="App">
      <FilesUpload/>
      <ActionBar/>
    </div>
  )
}

export default App;
