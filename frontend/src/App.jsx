import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login with GitHub</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-black text-white rounded-lg"
      >
        Login with GitHub
      </button>
    </div>
  );
}

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/repo-files", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) navigate("/");
        return res.json();
      })
      .then((data) => setFiles(data));
  }, [navigate]);

  const handleFileClick = async (filename) => {
  setSelectedFile(filename);
  const res = await fetch(
    `http://localhost:5000/api/repo-file/${encodeURIComponent(filename)}`,
    { credentials: "include" }
  );
  const data = await res.json();
  if (data.content) {
    setFileContent(data.content);
  } else {
    setFileContent("// Error loading file");
  }
};

  return (
    <div className="flex h-screen">
      {/* Left: File List */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Repo .js Files</h1>
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              onClick={() => handleFileClick(file)}
              className={`p-2 cursor-pointer rounded ${
                selectedFile === file
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {file}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: File Content */}
      <div className="w-2/3 p-4">
        <h2 className="text-lg font-semibold mb-2">
          {selectedFile || "Select a file"}
        </h2>
        <textarea
          className="w-full h-[90%] border rounded p-2 font-mono text-sm"
          value={fileContent}
          readOnly
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
