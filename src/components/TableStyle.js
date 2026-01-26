import styled from "styled-components";
import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const TableStyle = ({
  data = [],
  columns = [],
  sortConfig = { key: null, direction: null },
  onSort = () => { },
  selectedIds = [],
  onSelectChange = () => { },
  onRowClick,
  selectable = false,
}) => {
  const [widths, setWidths] = useState(() => {
    const initialWidths = columns.reduce((acc, col) => {
      acc[col.key] = col.width || 150;
      return acc;
    }, {});

    // selectable이 true일 때만 체크박스 컬럼 너비 추가
    if (selectable) {
      initialWidths.check = 42;
    }
    return initialWidths;
  });

  const resizingColumn = useRef(null);

  /* =========================
     컬럼 리사이즈
  ========================= */
  const onMouseDown = (e, key) => {
    resizingColumn.current = {
      key,
      startX: e.pageX,
      startWidth: widths[key],
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!resizingColumn.current) return;
    const { key, startX, startWidth } = resizingColumn.current;
    const nextWidth = startWidth + (e.pageX - startX);
    if (nextWidth > 40) {
      setWidths((prev) => ({ ...prev, [key]: nextWidth }));
    }
  };

  const onMouseUp = () => {
    resizingColumn.current = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  /* =========================
     체크박스
  ========================= */
  const handleAllCheck = (e) => {
    if (e.target.checked) {
      onSelectChange(data.map((d) => d.id));
    } else {
      onSelectChange([]);
    }
  };

  const handleSingleCheck = (id) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((v) => v !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const getSortIcon = (key) => {
    const active = sortConfig.key === key;
    return (
      <SortIcon active={active}>
        {active && sortConfig.direction === "asc" ? (
          <ChevronUp size={12} />
        ) : active && sortConfig.direction === "desc" ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronsUpDown size={12} />
        )}
      </SortIcon>
    );
  };

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString(); // 1000 -> 1,000
    }
    return value;
  };

  return (
    <TableWrapper>
      <StyledTable>
        <colgroup>
          {selectable && <col style={{ width: widths.check }} />}
          {columns.map((col) => (
            <col key={col.key} style={{ width: widths[col.key] }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {selectable && (
              <th>
                <input
                  type="checkbox"
                  onChange={handleAllCheck}
                  checked={
                    data.length > 0 && selectedIds.length === data.length
                  }
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} onClick={() => onSort(col.key)}>
                {col.label}
                {getSortIcon(col.key)}
                <Resizer onMouseDown={(e) => onMouseDown(e, col.key)} />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)}>
                {selectable && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSingleCheck(row.id)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={`${row.id}-${col.key}`}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : formatValue(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
                데이터가 존재하지 않습니다.
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default TableStyle;



const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  background: white;
  border-radius: 15px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    position: relative;
    background: var(--background2);
    border: 1px solid var(--border);
    padding: 8px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    user-select: none;
  }

  td {
    border: 1px solid var(--border);
    padding: 6px;
    font-size: 12px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Resizer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
`;

const SortIcon = styled.span`
  margin-left: 4px;
  color: ${({ active }) => (active ? "var(--main)" : "var(--font2)")};
`;
