import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

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
    { key: "no", label: "No", width: 60 },
    { key: "materialCode", label: "Material Code", width: 140 },
    { key: "materialName", label: "Material Name", width: 200 },
    { key: "unit", label: "Unit", width: 80 },
    { key: "stock", label: "Stock", width: 100 },
    { key: "updatedAt", label: "재고갱신일자", width: 160 },
  ];

  /* =========================
     테이블 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        no: i + 1,
        materialCode: `MAT-10${i}`,
        materialName: `배터리 자재 ${i + 1}`,
        unit: "EA",
        stock: 1200 - i * 45,
        updatedAt: "2026-01-05 14:22",
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
        row.materialCode.toLowerCase().includes(lower) ||
        row.materialName.toLowerCase().includes(lower)
    );
  }, [keyword, tableData]);

  useEffect(() => {
    setSelectedIds([]);
  }, [keyword]);

  /* =========================
     정렬 핸들러
  ========================= */
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  /* =========================
     정렬 데이터 (⭐ 자연 정렬)
  ========================= */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // 문자열 + 숫자 섞인 경우 → 자연 정렬
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      // 숫자 / 기타
      if (aVal > bVal) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      if (aVal < bVal) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  return (
    <Wrapper>
      <Header>
        <h2>자재 / 재고관리</h2>
      </Header>

      {/* ===== 차트 영역 ===== */}
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
                  focusable={false}
                  activeShape={null}
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
                <Bar dataKey="stock" fill="#6366f1" focusable={false} />
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
                  activeDot={false}
                />
                <Line
                  dataKey="outbound"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
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
          placeholder="자재명 / 자재코드 검색"
        />
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />
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
