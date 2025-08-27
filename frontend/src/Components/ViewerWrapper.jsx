import React from "react";
import ERDiagram from "./ERDViewer";

const ViewerWrapper = ({ schema }) => (
  <section className="viewer-wrapper">
    <div className="viewer-card">
      {schema ? (
        <ERDiagram schema={schema} />
      ) : (
        <div className="empty-state">
          <p>No diagram generated yet.</p>
          <p className="muted">Paste DBML and click Generate →</p>
        </div>
      )}
    </div>
  </section>
);

export default ViewerWrapper;
