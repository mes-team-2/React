import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/TableStyle";
import SearchBar from "../components/SearchBar";
import SideDrawer from "../components/SideDrawer";
import WorkOrderDetail from "./WorkOrderDetail";

export default function WorkOrder() {
  /* =========================
     상태
  ========================= */
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  /* =========================
     컬럼 정의
  ========================= */
  const columns = [
    { key: "workOrderNo", label: "작업지시번호", width: 160 },
    { key: "productName", label: "제품명", width: 200 },
    { key: "plannedQty", label: "계획 수량", width: 120 },
    { key: "goodQty", label: "양품", width: 100 },
    { key: "badQty", label: "불량", width: 100 },
    { key: "status", label: "상태", width: 120 },
    { key: "startDate", label: "시작일", width: 160 },
    { key: "dueDate", label: "납기일", width: 160 },
  ];

  /* =========================
     더미 데이터 (API 대체)
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i + 1,
        workOrderNo: `WO-202601-${String(i + 1).padStart(3, "0")}`,
        productName: "12V 배터리 (중형)",
        plannedQty: 1000,
        goodQty: 800 + i * 5,
        badQty: 20 + i,
        status: i % 3 === 0 ? "WAIT" : i % 3 === 1 ? "IN_PROGRESS" : "DONE",
        startDate: "2026-01-05 09:00",
        dueDate: "2026-01-06 18:00",
      })),
    []
  );

  /* =========================
     실시간 검색
  ========================= */
  const filteredData = useMemo(() => {
    if (!keyword.trim()) return tableData;
    const lower = keyword.toLowerCase();

    return tableData.filter(
      (row) =>
        row.workOrderNo.toLowerCase().includes(lower) ||
        row.productName.toLowerCase().includes(lower)
    );
  }, [keyword, tableData]);

  useEffect(() => {
    setSelectedIds([]);
  }, [keyword]);

  /* =========================
     Row 클릭 → 상세 이동
  ========================= */
  const handleRowClick = (row) => {
    setSelectedWorkOrder(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>작업지시</h2>
      </Header>

      {/* ===== 검색 ===== */}
      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="작업지시번호 / 제품명 검색"
        />
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <ClickableTable
        onClick={(e) => {
          const tr = e.target.closest("tr");
          if (!tr) return;
        }}
      >
        <Table
          columns={columns}
          data={filteredData}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onRowClick={handleRowClick}
        />
      </ClickableTable>

      <Hint>※ 작업지시 행을 클릭하면 상세 화면으로 이동합니다.</Hint>
      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <WorkOrderDetail workOrder={selectedWorkOrder} />
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
  align-items: center;
`;

const ClickableTable = styled.div`
  tbody tr {
    cursor: pointer;

    &:hover {
      background: rgba(99, 102, 241, 0.08);
    }
  }
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
`;
