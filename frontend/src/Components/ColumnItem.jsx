import { KeyRound, GitBranch } from "lucide-react";

const ColumnItem = ({ col, tableName, showIcons, highlighted }) => {
  const isFk = !!col.foreign_key;
  const isHighlighted =
    (highlighted?.pk?.table === tableName && highlighted.pk.col === col.name) ||
    (highlighted?.fk?.table === tableName && highlighted.fk.col === col.name);

  return (
    <li className={`col-item ${isHighlighted ? "highlight" : ""}`}>
      <div className="col-left">
        <span className="col-name">{col.name}</span>
        {col.unique && <span className="pill">UQ</span>}
        {isFk && <span className="pill fk-pill">FK</span>}
      </div>
      <div className="col-right">
        <span className="col-type">{col.type}</span>
        {showIcons && col.pk && <KeyRound className="col-icon pk" />}
        {showIcons && isFk && <GitBranch className="col-icon fk" />}
      </div>
    </li>
  );
};

export default ColumnItem;
