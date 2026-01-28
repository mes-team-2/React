import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import InventoryDetail from "./FgInventoryDetail";
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
   색상
========================= */
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function FgInventory() {
  const [keyword, setKeyword] = useState("");
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     재고 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i + 1,
        productCode: `FG-12V-${i + 1}`,
        productName: `12V 배터리 ${
          i % 3 === 0 ? "소형" : i % 3 === 1 ? "중형" : "대형"
        }`,
        stockQty: 800 - i * 20,
        safeQty: 300,
        status:
          800 - i * 20 > 400
            ? "SAFE"
            : 800 - i * 20 > 200
              ? "WARNING"
              : "DANGER",
        updatedAt: "2026-01-05 16:00",
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
        row.productCode.toLowerCase().includes(lower) ||
        row.productName.toLowerCase().includes(lower),
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
    tableData.forEach((row) => {
      map[row.status] = (map[row.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tableData]);

  const stockChart = useMemo(() => {
    return tableData.map((row) => ({
      name: row.productName,
      stock: row.stockQty,
    }));
  }, [tableData]);

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "productCode", label: "제품 코드", width: 160 },
    { key: "productName", label: "제품명", width: 200 },
    { key: "stockQty", label: "재고 수량", width: 120 },
    { key: "safeQty", label: "안전 재고", width: 120 },
    { key: "status", label: "상태", width: 120 },
    { key: "updatedAt", label: "갱신 시각", width: 160 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>완제품 재고</h2>
      </Header>

      {/* ===== 차트 ===== */}
      <ChartGrid>
        <Card>
          <h4>재고 상태 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusChart} dataKey="value" outerRadius={80}>
                  {statusChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>

        <Card>
          <h4>제품별 재고 수량</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={stockChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      {/* ===== 검색 ===== */}
      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="제품 코드 / 제품명 검색"
        />
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={(row) => {
          setSelectedInventory(row);
          setOpen(true);
        }}
      />

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <InventoryDetail inventory={selectedInventory} />
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
