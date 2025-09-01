import React, { useState } from "react";
import Header from "./Components/Header";
import ControlsPanel from "./Components/ControlsPanel";
import ViewerWrapper from "./Components/ViewerWrapper";
import './Styles/styles.css';

function App() {
  const [schema, setSchema] = useState(null);
  const [dbml, setDbml] = useState(`Table users {
  id int [pk]
  name varchar
  email varchar [unique]
}

Table orders {
  id int [pk]
  user_id int [ref: > users.id]
  total decimal
}`);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setDbml(event.target?.result ?? "");
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!dbml.trim()) {
      alert("Please paste or upload a DBML schema first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbml }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`Server error: ${err?.detail || res.statusText || "Unknown error"}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setSchema(data);
    } catch (err) {
      console.error("Request failed:", err);
      alert("Failed to reach server — check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root p-6">
      <Header />
      <ControlsPanel
        dbml={dbml}
        setDbml={setDbml}
        handleFileUpload={handleFileUpload}
        handleGenerate={handleGenerate}
        loading={loading}
      />
      <ViewerWrapper schema={schema} />
    </div>
  );
}

export default App;
