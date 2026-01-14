import styled from "styled-components";
import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

/**
 * @param {Array} data - 표시할 데이터
 * @param {Array} columns - 컬럼 설정 (key, label, required 여부 등)
 * @param {Object} sortConfig - 정렬 상태
 * @param {Function} onSort - 정렬 핸들러
 * @param {Array} selectedIds - 선택된 행의 ID 배열
 * @param {Function} onSelectChange - 선택 상태 변경 핸들러
 */
const TableStyle = ({
  data = [],
  columns = [],
  sortConfig = { key: null, direction: null },
  onSort = () => {},
  selectedIds = [],
  onSelectChange,
}) => {
  const [widths, setWidths] = useState(
    columns.reduce(
      (acc, col) => {
        acc[col.key] = col.width || 150; // 기본 너비 150px
        return acc;
      },
      { check: 40 }
    ) // 체크박스 너비 기본 포함
  );

  const resizingColumn = useRef(null);

  // 마우스 클릭 시 조절 시작
  const onMouseDown = (e, column) => {
    resizingColumn.current = {
      column,
      startX: e.pageX,
      startWidth: widths[column],
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // 마우스 이동 시 실시간 너비 계산
  const onMouseMove = (e) => {
    if (!resizingColumn.current) return;
    const { column, startX, startWidth } = resizingColumn.current;
    const newWidth = startWidth + (e.pageX - startX);

    if (newWidth > 30) {
      // 최소 너비 제한
      setWidths((prev) => ({ ...prev, [column]: newWidth }));
    }
  };

  // 마우스 떼면 이벤트 제거
  const onMouseUp = () => {
    resizingColumn.current = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  // 전체 선택 체크박스 변경 핸들러
  const handleAllCheck = (e) => {
    if (e.target.checked) {
      // 현재 표시된 모든 데이터의 ID를 부모에게 전달함
      const allIds = data.map((item) => item.id);
      onSelectChange(allIds);
    } else {
      // 선택 해제
      onSelectChange([]);
    }
  };

  // 개별 선택 체크박스 변경 핸들러
  const handleSingleCheck = (id) => {
    if (selectedIds.includes(id)) {
      // 이미 선택된 경우 제거함
      onSelectChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      // 선택되지 않은 경우 추가함
      onSelectChange([...selectedIds, id]);
    }
  };

  const getSortIcon = (key) => {
    const active = sortConfig?.key === key;
    return (
      <SortIconWrapper active={active}>
        {active && sortConfig.direction === "asc" ? (
          <ChevronUp size={12} />
        ) : active && sortConfig.direction === "desc" ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronsUpDown size={12} />
        )}
      </SortIconWrapper>
    );
  };

  return (
    <TableWrapper>
      <StyledTable
        style={{ width: Object.values(widths).reduce((a, b) => a + b, 0) }}
      >
        <colgroup>
          <col style={{ width: widths.check }} />
          {columns.map((col) => (
            <col key={col.key} style={{ width: widths[col.key] }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleAllCheck}
                checked={data.length > 0 && selectedIds.length === data.length}
              />
              <Resizer onMouseDown={(e) => onMouseDown(e, "check")} />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.required ? "required" : ""}
                onClick={() => onSort(col.key)}
              >
                {col.label} {getSortIcon(col.key)}
                <Resizer onMouseDown={(e) => onMouseDown(e, col.key)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSingleCheck(item.id)}
                  />
                </td>
                {columns.map((col) => (
                  <td key={`${item.id}-${col.key}`}>{item[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1}>데이터가 존재하지 않습니다.</td>
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
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  background: white;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 컬럼 너비 고정을 위해 필수 */

  th {
    position: relative;
    background: var(--background2);
    border: 1px solid var(--border);
    padding: 6px;
    font-weight: bold;
    color: var(--font);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    &:hover {
      background: var(--background2);
    }
    &.required::before {
      content: "*";
      color: red;
      margin-right: 2px;
    }
  }

  td {
    border: 1px solid var(--border);
    padding: 4px;
    height: 25px;
    text-align: center;
    background: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Resizer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  z-index: 1;
`;

const SortIconWrapper = styled.span`
  display: inline-flex;
  margin-left: 4px;
  vertical-align: middle;
  color: ${(props) => (props.active ? "var(--main)" : "var(--font2)")};
`;
