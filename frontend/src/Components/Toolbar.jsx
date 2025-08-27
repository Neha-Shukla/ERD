import React from "react";

const Toolbar = ({ filter, setFilter, showIcons, setShowIcons, showRelations, setShowRelations,showRelationType,
  setShowRelationType }) => (
  <div className="toolbar">
    <button onClick={() => setFilter("all")}>All</button>
    <button onClick={() => setFilter("pk")}>Primary Keys</button>
    <button onClick={() => setFilter("fk")}>Foreign Keys</button>
    <button onClick={() => setShowIcons((s) => !s)}>
      {showIcons ? "Hide Icons" : "Show Icons"}
    </button>
    <button onClick={() => setShowRelations((s) => !s)}>
      {showRelations ? "Hide Relations" : "Show Relations"}
    </button>
    <button onClick={() => setShowRelationType(!showRelationType)}>
        {showRelationType ? "Hide Relation Type" : "Show Relation Type"}
      </button>
  </div>
);

export default Toolbar;
