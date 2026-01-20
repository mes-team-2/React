import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import LotDetail from "./LotDetail";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   색상
========================= */
const COLORS = {
  IN_PROCESS: "#3b82f6",
  DONE: "#22c55e",
  HOLD: "#f59e0b",
};

export default function Lot() {
  const [keyword, setKeyword] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [open, setOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  /* =========================
     LOT 테이블 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        lotNo: `LOT-202601-${String(i + 1).padStart(3, "0")}`,
        product: "12V 배터리 (중형)",
        qty: 500,
        status: i % 3 === 0 ? "IN_PROCESS" : i % 3 === 1 ? "DONE" : "HOLD",
        workOrderNo: `WO-202601-00${(i % 5) + 1}`,
        createdAt: `2026-01-${String((i % 5) + 1).padStart(2, "0")} 09:00`,
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
        row.workOrderNo.toLowerCase().includes(lower),
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

  /* =========================
     차트 데이터
  ========================= */
  const statusChart = useMemo(() => {
    const map = {};
    tableData.forEach((lot) => {
      map[lot.status] = (map[lot.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tableData]);

  const dailyChart = useMemo(() => {
    const map = {};
    tableData.forEach((lot) => {
      const day = lot.createdAt.slice(5, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({
      date,
      count,
    }));
  }, [tableData]);

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "lotNo", label: "LOT No", width: 160 },
    { key: "product", label: "제품", width: 180 },
    { key: "qty", label: "수량", width: 100 },
    { key: "status", label: "상태", width: 120 },
    { key: "workOrderNo", label: "작업지시", width: 160 },
    { key: "createdAt", label: "생성일", width: 160 },
  ];

  const handleRowClick = (row) => {
    setSelectedLot(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>LOT 관리</h2>
      </Header>

      {/* ===== 차트 ===== */}
      <ChartGrid>
        <Card>
          <h4>LOT 상태 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {statusChart.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>

        <Card>
          <h4>일자별 LOT 생성</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={dailyChart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      {/* ===== 검색 ===== */}
      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="LOT No / 작업지시 검색"
        />
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={handleRowClick}
      />
      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <LotDetail lot={selectedLot} />
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
  gap: 22px;
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

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

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

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
`;
