import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import ProductDetail from "./ProductDetail";
import SummaryCard from "../../components/SummaryCard";

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
   차트 색상
========================= */
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function Product() {
  const [keyword, setKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);

  /* =========================
     🔹 차트 더미 데이터
  ========================= */
  const stockStatusData = [
    { name: "정상", value: 65 },
    { name: "부족", value: 25 },
    { name: "위험", value: 10 },
  ];

  const stockByProduct = [
    { name: "소형", stock: 1200 },
    { name: "중형", stock: 900 },
    { name: "대형", stock: 600 },
  ];

  const inOutTrend = [
    { date: "01-01", inbound: 300, outbound: 200 },
    { date: "01-02", inbound: 420, outbound: 260 },
    { date: "01-03", inbound: 380, outbound: 310 },
    { date: "01-04", inbound: 520, outbound: 430 },
    { date: "01-05", inbound: 460, outbound: 390 },
  ];

  /* =========================
     🔹 테이블 컬럼
  ========================= */
  const columns = [
    { key: "productCode", label: "제품 코드", width: 140 },
    { key: "productName", label: "제품명", width: 200 },
    { key: "type", label: "유형", width: 120 },
    { key: "stockQty", label: "재고 수량", width: 120 },
    { key: "status", label: "재고 상태", width: 120 },
    { key: "updatedAt", label: "갱신일", width: 160 },
  ];

  /* =========================
     🔹 테이블 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        productCode: `PRD-12V-${i + 1}`,
        productName: `12V 배터리 ${["소형", "중형", "대형"][i % 3]}`,
        type: "완제품",
        stockQty: 1000 - i * 60,
        status: i % 3 === 0 ? "정상" : i % 3 === 1 ? "부족" : "위험",
        updatedAt: "2026-01-05 14:30",
      })),
    [],
  );

  /* =========================
     🔹 검색 필터
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
     🔹 Row 클릭
  ========================= */
  const handleRowClick = (row) => {
    setSelectedProduct(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>제품 관리</h2>
      </Header>

      {/* ===== 차트 카드 ===== */}
      <ChartGrid>
        {/* 재고 상태 */}
        <ChartCard>
          <h4>제품 재고 상태 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                >
                  {stockStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        {/* 재고 현황 */}
        <ChartCard>
          <h4>제품 재고 현황</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={stockByProduct}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        {/* 입출고 추이 */}
        <ChartCard>
          <h4>제품 입 / 출고 추이</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={inOutTrend}>
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
        </ChartCard>
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
        data={filteredData}
        selectable={false}
        onRowClick={handleRowClick}
      />

      {/* ===== 상세 Drawer ===== */}
      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <ProductDetail product={selectedProduct} />
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

const ChartCard = styled.div`
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

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
