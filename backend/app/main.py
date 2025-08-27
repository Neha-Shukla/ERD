from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
from pydbml import PyDBML

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GraphRequest(BaseModel):
    dbml: str


def _card_from_ref(ref) -> tuple[str, str]:
    print("refs",ref)
    if hasattr(ref, "endpoints"):
        left = ref.endpoints[0]
        right = ref.endpoints[1]
        l = "1" if getattr(left, "cardinality", None) in ("one", "1") else "*"
        r = "1" if getattr(right, "cardinality", None) in ("one", "1") else "*"
        return l, r

    t = getattr(ref, "type", None)
 
    if t == "-":
        return "1", "1"
    if t == "<":
        return "1", "*"
    if t == ">":
        return "*", "1"
    if t == "<>":
        return "*", "*"
    return "*", "*"


def parse_dbml_to_graph(dbml: str) -> Dict[str, Any]:
    try:
        parsed = PyDBML(dbml)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DBML parse error: {e}")
    print("parsed",parsed)
    fk_map: Dict[tuple, str] = {}
    for ref in getattr(parsed, "refs", []):
        if hasattr(ref, "endpoints"):
            left = ref.endpoints[0]
            right = ref.endpoints[1]

            left_cols = left.columns if isinstance(left.columns, list) else [left.columns]
            right_cols = right.columns if isinstance(right.columns, list) else [right.columns]

            for lc, rc in zip(left_cols, right_cols):
                if lc is not None and rc is not None:
                    fk_map[(left.table.name, lc.name)] = f"{right.table.name}.{rc.name}"
                    fk_map[(right.table.name, rc.name)] = f"{left.table.name}.{lc.name}"

        else:
            col1 = getattr(ref, "col1", None)
            col2 = getattr(ref, "col2", None)

            left_tbl = getattr(getattr(ref, "table1", None), "name", None)
            right_tbl = getattr(getattr(ref, "table2", None), "name", None)

            left_cols = col1 if isinstance(col1, list) else [col1]
            right_cols = col2 if isinstance(col2, list) else [col2]

            for lc, rc in zip(left_cols, right_cols):
                if lc is not None and rc is not None:
                    fk_map[(left_tbl, lc.name)] = f"{right_tbl}.{rc.name}"
                    fk_map[(right_tbl, rc.name)] = f"{left_tbl}.{lc.name}"

    tables: List[Dict[str, Any]] = []
    for t in getattr(parsed, "tables", []):
        cols = []
        for c in getattr(t, "columns", []):
            col_name = getattr(c, "name", None)
            col_type = getattr(c, "type", None)
            type_str = "" if col_type is None else str(col_type)

            fk_target = fk_map.get((t.name, col_name))

            cols.append(
                {
                    "name": col_name,
                    "type": type_str,
                    "pk": bool(getattr(c, "pk", False)),
                    "unique": bool(getattr(c, "unique", False)),
                    "not_null": bool(
                        getattr(c, "not_null", False) or getattr(c, "notnull", False)
                    ),
                    "foreign_key": fk_target,
                }
            )
        tables.append({"name": t.name, "columns": cols})

    relationships: List[Dict[str, Any]] = []
    for ref in getattr(parsed, "refs", []):
        left_tbl = None
        right_tbl = None
        left_cols: List[str] = []
        right_cols: List[str] = []

        if hasattr(ref, "endpoints"):
            left = ref.endpoints[0]
            right = ref.endpoints[1]
            left_tbl = getattr(getattr(left, "table", None), "name", None)
            right_tbl = getattr(getattr(right, "table", None), "name", None)

            left_cols_raw = left.columns if isinstance(left.columns, list) else [left.columns]
            right_cols_raw = right.columns if isinstance(right.columns, list) else [right.columns]

            left_cols = [c.name for c in left_cols_raw if hasattr(c, "name")]
            right_cols = [c.name for c in right_cols_raw if hasattr(c, "name")]

        else:
            left_tbl = getattr(getattr(ref, "table1", None), "name", None)
            right_tbl = getattr(getattr(ref, "table2", None), "name", None)

            col1 = getattr(ref, "col1", None)
            col2 = getattr(ref, "col2", None)

            left_cols_raw = col1 if isinstance(col1, list) else [col1]
            right_cols_raw = col2 if isinstance(col2, list) else [col2]

            left_cols = [c.name for c in left_cols_raw if hasattr(c, "name")]
            right_cols = [c.name for c in right_cols_raw if hasattr(c, "name")]

        if not left_tbl or not right_tbl:
            continue

        left_card, right_card = _card_from_ref(ref)

        relationships.append(
            {
                "from": left_tbl,
                "to": right_tbl,
                "left_columns": left_cols,
                "right_columns": right_cols,
                "multiplicity": [left_card,right_card],
                "constraint": f"{left_tbl}({','.join(left_cols)}) -> {right_tbl}({','.join(right_cols)})"
                if left_cols and right_cols
                else None,
            }
        )

    return {"tables": tables, "relationships": relationships}


@app.post("/graph", response_model=Dict[str, Any])
def graph_endpoint(req: GraphRequest):
    """POST { dbml: "..." } -> { tables: [...], relationships: [...] }"""
    return parse_dbml_to_graph(req.dbml)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "POST /graph"}
