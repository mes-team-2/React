import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import ProcessLogDetail from "./ProcessLogDetail";

export default function ProcessLog() {
  const [keyword, setKeyword] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "processStep", label: "공정", width: 160 },
    { key: "machine", label: "설비", width: 160 },
    { key: "status", label: "상태", width: 120 },
    { key: "startTime", label: "시작 시간", width: 200 },
    { key: "endTime", label: "종료 시간", width: 200 },
    { key: "workerCode", label: "작업자 사번" },
  ];

  /* =========================
     더미 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        lotNo: `LOT-202601-${String(i + 1).padStart(3, "0")}`,
        processStep:
          i % 5 === 0
            ? "전극 공정"
            : i % 5 === 1
              ? "조립 공정"
              : i % 5 === 2
                ? "활성화 공정"
                : i % 5 === 3
                  ? "팩 공정"
                  : "기능 검사",
        machine: `설비-${String.fromCharCode(65 + (i % 4))}`,
        status: i % 3 === 0 ? "DONE" : i % 3 === 1 ? "IN_PROGRESS" : "WAIT",
        startTime: "2026-01-06 09:00",
        endTime: i % 3 === 0 ? "2026-01-06 10:20" : "-",
        workerCode: "OP-00" + i,
      })),
    [],
  );

  /* =========================
     검색
  ========================= */
  const filteredData = useMemo(() => {
    if (!keyword.trim()) return tableData;
    const lower = keyword.toLowerCase();
    return tableData.filter(
      (row) =>
        row.lotNo.toLowerCase().includes(lower) ||
        row.processStep.toLowerCase().includes(lower) ||
        row.machine.toLowerCase().includes(lower),
    );
  }, [keyword, tableData]);

  /* =========================
     정렬
  ========================= */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Wrapper>
      <Header>
        <h2>공정 이력 (Process Log)</h2>
      </Header>

      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="LOT / 공정 / 설비 검색"
        />
      </FilterBar>

      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={(row) => {
          setSelectedLog(row);
          setOpen(true);
        }}
      />

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <ProcessLogDetail log={selectedLog} />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
`;
