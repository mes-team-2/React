import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import WorkerDetail from "./WorkerDetail";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   차트 색상
========================= */
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function Worker() {
  /* =========================
     state
  ========================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [open, setOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  /* =========================
     작업자 더미 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i + 1,
        workerNo: `W-2026-${String(i + 1).padStart(3, "0")}`,
        name: i % 3 === 0 ? "김현수" : i % 3 === 1 ? "이준호" : "박민지",
        process: i % 3 === 0 ? "극판 적층" : i % 3 === 1 ? "COS 용접" : "화성",
        line: `라인-${(i % 4) + 1}`,
        position: i % 2 === 0 ? "작업자" : "반장",
        status:
          i % 4 === 0
            ? "근무중"
            : i % 4 === 1
              ? "휴식"
              : i % 4 === 2
                ? "오프라인"
                : "근무중",
        joinedAt: "2025/08/01",
      })),
    [],
  );

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "workerNo", label: "작업자 번호", width: 140 },
    { key: "name", label: "이름", width: 120 },
    { key: "process", label: "공정", width: 160 },
    { key: "line", label: "라인", width: 100 },
    { key: "position", label: "직급", width: 100 },
    { key: "status", label: "근무 상태", width: 120 },
    { key: "joinedAt", label: "입사일", width: 120 },
  ];

  /* =========================
     정렬
  ========================= */
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tableData;

    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [tableData, sortConfig]);

  /* =========================
     차트 데이터
  ========================= */
  const processChart = [
    { name: "극판 적층", value: 6 },
    { name: "COS 용접", value: 6 },
    { name: "화성", value: 6 },
  ];

  const statusChart = [
    { name: "근무중", value: 10 },
    { name: "휴식", value: 4 },
    { name: "오프라인", value: 4 },
  ];

  /* =========================
     관리 액션
  ========================= */
  const handleAssign = () => {
    console.log("공정 배치:", selectedIds);
  };

  const handleDeactivate = () => {
    console.log("비활성 처리:", selectedIds);
  };

  const handleRowClick = (row) => {
    setSelectedWorker(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>작업자 관리</h2>
      </Header>

      {/* ===== 차트 (있어도 부담 없는 수준) ===== */}
      <ChartGrid>
        <Card>
          <h4>공정별 작업자 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={processChart}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {processChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>

        <Card>
          <h4>근무 상태 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={statusChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      {/* ===== 관리 버튼 ===== */}
      <ActionBar>
        <span>선택 {selectedIds.length}명</span>
        <button onClick={handleAssign}>공정 배치</button>
        <button className="danger" onClick={handleDeactivate}>
          비활성
        </button>
      </ActionBar>

      {/* ===== 테이블 ===== */}
      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowClick={handleRowClick}
      />
      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <WorkerDetail worker={selectedWorker} onClose={() => setOpen(false)} />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled-components
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const ChartBox = styled.div`
  height: 220px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    font-size: 13px;
    opacity: 0.7;
  }

  button {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    background: var(--main);
    color: white;
    cursor: pointer;
  }

  .danger {
    background: #ef4444;
  }
`;
