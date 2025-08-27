import ColumnItem from "./ColumnItem";

const TableCard = ({ table, filter, showIcons, highlighted }) => {
  const cols = (table.columns || []).filter((col) => {
    const isPk = !!col.pk;
    const isFk = !!col.foreign_key;
    if (filter === "pk") return isPk;
    if (filter === "fk") return isFk;
    return true;
  });

  return (
    <div className="table-card">
      <div className="table-header">
        <div className="table-name">{table.name}</div>
      </div>
      <ul className="col-list">
        {cols.map((col) => (
          <ColumnItem
            key={col.name}
            col={col}
            tableName={table.name}
            showIcons={showIcons}
            highlighted={highlighted}
          />
        ))}
      </ul>
    </div>
  );
};

export default TableCard;
