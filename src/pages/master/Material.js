import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import MaterialDetail from "./MaterialDetail";
import SideDrawer from "../../components/SideDrawer";
import MaterialCreate from "./MaterialCreate";
import Status from "../../components/Status";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function Material() {
  /* =========================
     상태
  ========================= */
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  /* =========================
     차트 더미 데이터
  ========================= */
  const inventoryStatus = [
    { name: "충분", value: 65 },
    { name: "부족", value: 25 },
    { name: "위험", value: 10 },
  ];

  const stockByMaterial = [
    { name: "납판", stock: 1200 },
    { name: "전해액", stock: 900 },
    { name: "케이스", stock: 1500 },
    { name: "터미널", stock: 700 },
    { name: "분리막", stock: 600 },
  ];

  const txTrend = [
    { date: "01-01", inbound: 300, outbound: 200 },
    { date: "01-02", inbound: 200, outbound: 260 },
    { date: "01-03", inbound: 420, outbound: 320 },
    { date: "01-04", inbound: 360, outbound: 280 },
    { date: "01-05", inbound: 520, outbound: 430 },
  ];

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "no", label: "No", width: 50 },
    { key: "materialCode", label: "자재 코드", width: 180 },
    { key: "materialName", label: "자재명", width: 180 },
    { key: "stockQty", label: "재고", width: 100 },
    { key: "safeQty", label: "안전재고", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "stockStatus", label: "재고상태",  width: 150, render: (value) => <Status status={value} /> },
    { key: "createdAt", label: "자재등록일자", width: 180 },
    { key: "inboundAt", label: "입고일자", width: 180 },
  ];

  /* =========================
     테이블 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const stock = 12345 - i * 300;
        const safe = 5000;

        let status = "SAFE"; // 안전
        if (stock < safe) status = "CAUTION"; // 주의
        if (stock < safe * 0.6) status = "DANGER"; // 위험

        return {
          id: i + 1,
          no: i + 1,
          materialCode: "MAT-260111-143522",
          materialName: "배터리 케이스 (L3)",
          stockQty: stock,
          safeQty: safe,
          unit: "EA",
          stockStatus: status,
          createdAt: "2026/01/01 12:23",
          inboundAt: "2026/01/05 14:22",
        };
      }),
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
        row.materialCode.toLowerCase().includes(lower) ||
        row.materialName.toLowerCase().includes(lower),
    );
  }, [keyword, tableData]);

  useEffect(() => {
    setSelectedIds([]);
  }, [keyword]);

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
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  /* =========================
     Row 클릭 → 상세
  ========================= */
  const handleRowClick = (row) => {
    setSelectedMaterial(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>자재 / 재고관리</h2>
      </Header>

      {/* ===== 차트 ===== */}
      <ChartGrid>
        <Card>
          <h4>자재 재고 상태</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                >
                  {inventoryStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>

        <Card>
          <h4>자재별 재고 현황</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={stockByMaterial}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>

        <Card>
          <h4>자재 입 / 출고 추이</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={txTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="inbound"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="outbound"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      {/* ===== 검색 + 등록 버튼 ===== */}
      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="자재명 / 자재코드 검색"
        />

        <CreateButton onClick={() => setCreateOpen(true)}>
          신규 자재 등록
        </CreateButton>
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <TableContainer>
        <Table
          columns={columns}
          data={sortedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onRowClick={handleRowClick}
        />
      </TableContainer>

      {/* ===== 상세 Drawer ===== */}
      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <MaterialDetail
          material={selectedMaterial}
          onClose={() => setOpen(false)}
        />
      </SideDrawer>

      {/* ===== 등록 Drawer ===== */}
      <SideDrawer open={createOpen} onClose={() => setCreateOpen(false)}>
        <MaterialCreate onClose={() => setCreateOpen(false)} />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */
const CreateButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--main);
  color: white;
  font-size: 13px;
  cursor: pointer;
`;

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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
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
  align-items: center;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;
