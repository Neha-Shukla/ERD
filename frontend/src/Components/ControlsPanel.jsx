import { Upload, FileText, Loader2 } from "lucide-react";

const ControlsPanel = ({ dbml, setDbml, handleFileUpload, handleGenerate, loading }) => (
  <section className="controls-panel">
    <div className="input-row">
      <label className="upload-btn">
        <Upload size={16} /> &nbsp; Upload DBML
        <input type="file" accept=".dbml,.txt" onChange={handleFileUpload} />
      </label>

      <div className="or-text">or</div>

      <div className="editor-hint">
        <FileText size={16} /> &nbsp; Enter in editor
      </div>
    </div>

    <textarea
      className="dbml-editor"
      value={dbml}
      onChange={(e) => setDbml(e.target.value)}
      placeholder="Paste your DBML schema here..."
    />

    <div className="actions-row">
      <button className="btn primary" onClick={handleGenerate} disabled={loading}>
        {loading ? <Loader2 className="spin" /> : "Generate Diagram"}
      </button>
      <div className="spacer" />
      <small className="muted">
        Tip: Drag nodes to rearrange, connect to create relations.
      </small>
    </div>
  </section>
);

export default ControlsPanel;
