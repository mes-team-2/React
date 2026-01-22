import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import MaterialLogDetail from "./MaterialLogDetail";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* =========================
   더미 데이터
========================= */

const MATERIALS = [
  { code: "MAT-CASE", name: "배터리 케이스" },
  { code: "MAT-LEAD", name: "납판" },
  { code: "MAT-ELEC", name: "전해액" },
  { code: "MAT-SEP", name: "분리막" },
];

const TYPES = {
  IN: "입고",
  OUT: "출고",
  USE: "공정투입",
  ADJ: "재고조정",
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMockRows() {
  const rows = [];
  let id = 1;

  for (let d = 14; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);

    const dateStr = `${day.getFullYear()}/${String(day.getMonth() + 1).padStart(
      2,
      "0",
    )}/${String(day.getDate()).padStart(2, "0")}`;

    const count = rand(6, 14);

    for (let i = 0; i < count; i++) {
      const mat = MATERIALS[rand(0, MATERIALS.length - 1)];
      const typeKeys = Object.keys(TYPES);
      const type = typeKeys[rand(0, typeKeys.length - 1)];

      const qty =
        type === "IN"
          ? rand(100, 500)
          : type === "OUT"
            ? rand(50, 300)
            : type === "USE"
              ? rand(10, 120)
              : rand(-50, 50);

      const hh = String(rand(8, 18)).padStart(2, "0");
      const mm = String(rand(0, 59)).padStart(2, "0");

      rows.push({
        id: id++,
        occurredAt: `${dateStr} ${hh}:${mm}`,
        materialCode: mat.code,
        materialName: mat.name,
        lotNo: `LOT-202601-${String(rand(1, 80)).padStart(3, "0")}`,
        type,
        typeName: TYPES[type],
        qty,
        remainQty: rand(200, 2000),
        process:
          type === "USE" ? ["극판 적층", "COS 용접", "화성"][rand(0, 2)] : "-",
        workOrderNo: type === "USE" ? `WO-202601-00${rand(1, 8)}` : "-",
        operator: `WK-${rand(101, 120)}`,
        note: type === "ADJ" ? "실사 조정" : "",
      });
    }
  }
  return rows;
}

const TYPE_COLOR = {
  IN: "#2563eb",
  OUT: "#7c3aed",
  USE: "#16a34a",
  ADJ: "#f59e0b",
};

export default function MaterialLog() {
  const [rows] = useState(() => makeMockRows());

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [materialFilter, setMaterialFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleKeywordChange = (v) => {
    if (typeof v === "string") return setKeyword(v);
    if (v?.target?.value !== undefined) return setKeyword(v.target.value);
    setKeyword("");
  };

  /* =========================
     필터
  ========================= */
  const filtered = useMemo(() => {
    let data = rows;

    if (typeFilter !== "ALL") {
      data = data.filter((r) => r.type === typeFilter);
    }
    if (materialFilter !== "ALL") {
      data = data.filter((r) => r.materialCode === materialFilter);
    }
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          r.materialCode.toLowerCase().includes(k) ||
          r.materialName.toLowerCase().includes(k) ||
          r.lotNo.toLowerCase().includes(k) ||
          r.workOrderNo.toLowerCase().includes(k) ||
          r.operator.toLowerCase().includes(k),
      );
    }
    return data;
  }, [rows, keyword, typeFilter, materialFilter]);

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

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "string")
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortConfig]);

  /* =========================
     Summary (기존 그대로)
  ========================= */
  const summary = useMemo(() => {
    const total = filtered.length;
    const inQty = filtered
      .filter((r) => r.type === "IN")
      .reduce((a, b) => a + b.qty, 0);
    const outQty = filtered
      .filter((r) => r.type !== "IN")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

    return { total, inQty, outQty };
  }, [filtered]);

  /* =========================
     차트
  ========================= */
  const dailyChart = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const d = r.occurredAt.slice(5, 10);
      if (!map[d]) map[d] = { day: d, IN: 0, OUT: 0, USE: 0 };
      if (r.type === "IN") map[d].IN += r.qty;
      if (r.type === "OUT") map[d].OUT += Math.abs(r.qty);
      if (r.type === "USE") map[d].USE += Math.abs(r.qty);
    });
    return Object.values(map);
  }, [filtered]);

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "occurredAt", label: "일시", width: 170 },
    { key: "typeName", label: "유형", width: 110 },
    { key: "materialCode", label: "자재코드", width: 140 },
    { key: "materialName", label: "자재명", width: 160 },
    { key: "lotNo", label: "LOT", width: 160 },
    { key: "qty", label: "수량", width: 90 },
    { key: "remainQty", label: "잔량", width: 90 },
    { key: "process", label: "공정", width: 120 },
    { key: "workOrderNo", label: "작업지시", width: 140 },
    { key: "operator", label: "작업자", width: 110 },
  ];

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  useEffect(() => {
    setSortConfig({ key: null, direction: "asc" });
  }, [typeFilter, materialFilter]);

  return (
    <Wrapper>
      <Header>
        <h2>자재 이력 조회</h2>
      </Header>

      {/* ===== SummaryCard (아이콘 + 설명 추가) ===== */}
      <SummaryGrid>
        <SummaryCard
          title="이력 건수"
          value={summary.total.toLocaleString()}
          icon="🕘"
          description="선택된 조건에서 발생한 자재 이동 기록"
        />
        <SummaryCard
          title="입고 수량"
          value={summary.inQty.toLocaleString()}
          icon="📥"
          description="외부에서 입고된 자재의 누적 수량"
        />
        <SummaryCard
          title="출고 · 투입"
          value={summary.outQty.toLocaleString()}
          icon="🏭"
          description="공정 투입 및 출고로 사용된 자재 수량"
        />
      </SummaryGrid>

      {/* ===== 차트 ===== */}
      <ChartCard>
        <h4>일자별 자재 이동</h4>
        <ChartBox>
          <ResponsiveContainer>
            <LineChart data={dailyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="IN" stroke={TYPE_COLOR.IN} />
              <Line dataKey="OUT" stroke={TYPE_COLOR.OUT} />
              <Line dataKey="USE" stroke={TYPE_COLOR.USE} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
      </ChartCard>

      {/* ===== 필터 ===== */}
      <FilterBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="자재 / LOT / 작업지시 / 작업자 검색"
          />
        </SearchWrap>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">전체 유형</option>
          {Object.entries(TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
        >
          <option value="ALL">전체 자재</option>
          {MATERIALS.map((m) => (
            <option key={m.code} value={m.code}>
              {m.name}
            </option>
          ))}
        </Select>
      </FilterBar>

      {/* ===== 테이블 ===== */}
      <TableWrap>
        <Table
          columns={columns}
          data={sorted}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
          rowStyle={(row) => ({
            color: TYPE_COLOR[row.type] || "inherit",
          })}
        />
      </TableWrap>

      {/* ===== 상세 ===== */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MaterialLogDetail row={selected} />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled (❗ 기존 그대로)
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const ChartBox = styled.div`
  height: 260px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchWrap = styled.div`
  flex: 1;
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  min-width: 150px;
`;

const TableWrap = styled.div`
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
