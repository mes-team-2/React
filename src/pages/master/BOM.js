import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import BOMDetail from "./BOMDetail";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* =========================
   색상
========================= */
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

export default function Bom() {
  const [keyword, setKeyword] = useState("");
  const [selectedBom, setSelectedBom] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     BOM 데이터 (제품 기준)
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        productCode: `PROD-12V-${i + 1}`,
        productName:
          i % 3 === 0
            ? "12V 배터리 소형"
            : i % 3 === 1
              ? "12V 배터리 중형"
              : "12V 배터리 대형",
        materialCount: 5 + i,
        totalRequiredQty: 1200 + i * 80,
        updatedAt: "2026-01-06 10:00",
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
     차트 (자재 수 비율)
  ========================= */
  const chartData = useMemo(() => {
    const map = {};
    tableData.forEach((b) => {
      map[b.productName] = b.materialCount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tableData]);

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "productCode", label: "제품 코드", width: 160 },
    { key: "productName", label: "제품명", width: 220 },
    { key: "materialCount", label: "자재 수", width: 120 },
    { key: "totalRequiredQty", label: "총 소요량", width: 140 },
    { key: "updatedAt", label: "갱신 시각", width: 160 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>BOM 관리</h2>
      </Header>

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
          setSelectedBom(row);
          setOpen(true);
        }}
      />

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <BOMDetail bom={selectedBom} />
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
  height: 240px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
`;
