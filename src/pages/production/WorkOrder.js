// src/pages/production/WorkOrder.js
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import TableStyle from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import Status from "../../components/Status";

import WorkOrderDetail from "./WorkOrderDetail";
import WorkOrderCreate from "./WorkOrderCreate";

/* =========================
   MOCK
========================= */
const MOCK_WORK_ORDERS = [
  {
    id: "WO-202601-001",
    product: "12V 배터리 (소형)",
    planQty: 500,
    status: "WAIT",
    startDate: "2026-01-28",
    dueDate: "2026-01-31",
  },
  {
    id: "WO-202601-002",
    product: "12V 배터리 (중형)",
    planQty: 300,
    status: "IN_PROGRESS",
    startDate: "2026-01-28",
    dueDate: "2026-02-01",
  },
  {
    id: "WO-202601-003",
    product: "12V 배터리 (대형)",
    planQty: 200,
    status: "DONE",
    startDate: "2026-01-25",
    dueDate: "2026-01-27",
  },
];

export default function WorkOrder() {
  const [keyword, setKeyword] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const data = useMemo(() => {
    if (!keyword.trim()) return MOCK_WORK_ORDERS;
    const k = keyword.toLowerCase();
    return MOCK_WORK_ORDERS.filter(
      (row) =>
        row.id.toLowerCase().includes(k) ||
        row.product.toLowerCase().includes(k) ||
        String(row.planQty).includes(k),
    );
  }, [keyword]);

  const columns = useMemo(
    () => [
      { key: "id", label: "작업지시 번호", width: 160 },
      { key: "product", label: "제품", width: 200 },
      { key: "planQty", label: "계획 수량", width: 120 },
      {
        key: "status",
        label: "상태",
        width: 120,
        render: (row) => <Status value={row.status} />,
      },
      { key: "startDate", label: "시작 시간", width: 140 },
      { key: "dueDate", label: "종료 시간", width: 140 },
    ],
    [],
  );

  return (
    <Wrapper>
      {/* ===== 타이틀 영역 ===== */}
      <TitleRow>
        <div>
          <h2>작업지시 관리</h2>
          <p>작업지시 등록/조회 및 LOT 생성 흐름을 관리합니다.</p>
        </div>
      </TitleRow>

      {/* ===== 액션 바 (검색 + 등록 버튼) ===== */}
      <ActionBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="작업지시/제품 검색"
          />
        </SearchWrap>

        <CreateBtn onClick={() => setCreateOpen(true)}>작업지시 등록</CreateBtn>
      </ActionBar>

      {/* ===== 목록 테이블 ===== */}
      <Card>
        <TableStyle
          columns={columns}
          data={data}
          onRowClick={(row) => {
            setSelected(row);
            setDetailOpen(true);
          }}
        />
      </Card>

      {/* ===== 상세 Drawer ===== */}
      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkOrderDetail workOrder={selected} />
      </SideDrawer>

      {/* ===== 등록 Drawer ===== */}
      <SideDrawer open={createOpen} onClose={() => setCreateOpen(false)}>
        <WorkOrderCreate
          onSubmit={(payload) => {
            console.log("CREATE WORK ORDER:", payload);
            alert("작업지시가 등록되었습니다 (MOCK)");
            setCreateOpen(false);
          }}
        />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled (기존 톤 유지)
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }

  p {
    margin: 6px 0 0 0;
    font-size: 12px;
    opacity: 0.6;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 360px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const CreateBtn = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #004dfc;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #003ad6;
  }
`;
