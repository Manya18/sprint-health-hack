import React, { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [file, setFile] = useState("");

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
    }
  };

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/unique-sprints");
      console.log(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
    }
  };

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Загрузить файл</button>

      <button onClick={getData}>Получить все спринты</button>
    </div>
  );
}

export default App;
