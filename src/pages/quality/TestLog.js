import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import TestLogDetail from "./TestLogDetail";

import {
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiPercent,
  FiAlertTriangle,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

/* =========================
   더미: 검사 이력 데이터
   (실 연동 시 API로 교체)
========================= */
const DEFECT_CODES = [
  { code: "LOW_OCV", name: "전압 미달" },
  { code: "LEAK", name: "누액" },
  { code: "PRESS_FAIL", name: "내압 불량" },
  { code: "WELD_BAD", name: "용접 불량" },
];

const PROCESS_STEPS = [
  "극판 적층",
  "COS 용접",
  "전해액 주입/화성",
  "최종 성능 검사",
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMockRows() {
  // 최근 14일치 더미
  const rows = [];
  let id = 1;

  for (let d = 14; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const dateStr = `${day.getFullYear()}/${String(day.getMonth() + 1).padStart(
      2,
      "0",
    )}/${String(day.getDate()).padStart(2, "0")}`;

    const count = rand(8, 18);
    for (let i = 0; i < count; i++) {
      const lotNo = `LOT-202601-${String(rand(1, 80)).padStart(3, "0")}`;
      const woNo = `WO-202601-00${rand(1, 8)}`;
      const step = PROCESS_STEPS[rand(0, PROCESS_STEPS.length - 1)];

      // OCV는 최종 검사에서 의미 있는 값
      const ocv = Number((11.6 + Math.random() * 1.2).toFixed(2)); // 11.60~12.80
      const pressure = Number((1.0 + Math.random() * 0.9).toFixed(2)); // 1.00~1.90
      const leak = Math.random() < 0.08; // 누액 확률
      const ok =
        step !== "최종 성능 검사"
          ? Math.random() > 0.08
          : ocv >= 12.0 && pressure >= 1.5 && !leak;

      let defectCode = "";
      if (!ok) {
        // 대충 불량코드 선택
        if (leak) defectCode = "LEAK";
        else if (ocv < 12.0) defectCode = "LOW_OCV";
        else if (pressure < 1.5) defectCode = "PRESS_FAIL";
        else defectCode = "WELD_BAD";
      }

      const hh = String(rand(8, 18)).padStart(2, "0");
      const mm = String(rand(0, 59)).padStart(2, "0");

      rows.push({
        id: id++,
        inspectedAt: `${dateStr} ${hh}:${mm}`,
        productCode: "BAT-12V-60Ah",
        productName: "자동차 납축전지 12V",
        workOrderNo: woNo,
        lotNo,
        processStep: step,
        machine:
          step === "최종 성능 검사"
            ? "TEST-03"
            : step === "COS 용접"
              ? "COS-01"
              : "LINE-01",
        ocv,
        pressure,
        leak,
        result: ok ? "OK" : "NG",
        defectCode,
        inspector: `WK-${rand(101, 120)}`,
        note: ok ? "" : "검사 기준 미달",
      });
    }
  }
  return rows;
}

const RESULT_COLOR = {
  OK: "#22c55e",
  NG: "#ef4444",
};

export default function TestLog() {
  const [rows] = useState(() => makeMockRows());

  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL | OK | NG
  const [defectFilter, setDefectFilter] = useState("ALL"); // ALL | code
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // SearchBar onChange (value/event 모두 대응)
  const handleKeywordChange = (v) => {
    if (typeof v === "string") return setKeyword(v);
    if (v?.target?.value !== undefined) return setKeyword(v.target.value);
    setKeyword("");
  };

  /* =========================
     필터 적용
  ========================= */
  const filtered = useMemo(() => {
    let data = rows;

    if (resultFilter !== "ALL") {
      data = data.filter((r) => r.result === resultFilter);
    }
    if (defectFilter !== "ALL") {
      data = data.filter((r) => r.defectCode === defectFilter);
    }
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          r.lotNo.toLowerCase().includes(k) ||
          r.workOrderNo.toLowerCase().includes(k) ||
          r.productCode.toLowerCase().includes(k) ||
          r.productName.toLowerCase().includes(k) ||
          r.machine.toLowerCase().includes(k) ||
          r.inspector.toLowerCase().includes(k),
      );
    }
    return data;
  }, [rows, keyword, resultFilter, defectFilter]);

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
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortConfig]);

  /* =========================
     요약 카드
  ========================= */
  const summary = useMemo(() => {
    const total = filtered.length;
    const ok = filtered.filter((r) => r.result === "OK").length;
    const ng = total - ok;
    const okRate = total === 0 ? 0 : Math.round((ok / total) * 100);

    const defectMap = {};
    filtered.forEach((r) => {
      if (r.result === "NG")
        defectMap[r.defectCode || "UNKNOWN"] =
          (defectMap[r.defectCode || "UNKNOWN"] || 0) + 1;
    });

    const top = Object.entries(defectMap).sort((a, b) => b[1] - a[1])[0];
    const topDefect =
      top && top[0] !== "UNKNOWN"
        ? `${(DEFECT_CODES.find((d) => d.code === top[0]) || { name: top[0] }).name} (${top[1]})`
        : ng > 0
          ? `기타 (${ng})`
          : "-";

    return { total, ok, ng, okRate, topDefect };
  }, [filtered]);

  /* =========================
     차트 데이터
  ========================= */
  const dailyTrend = useMemo(() => {
    // inspectedAt: "YYYY/MM/DD HH:mm" -> day = "MM/DD"
    const map = {};
    filtered.forEach((r) => {
      const day = r.inspectedAt.slice(5, 10);
      if (!map[day]) map[day] = { day, OK: 0, NG: 0 };
      map[day][r.result] += 1;
    });
    return Object.values(map);
  }, [filtered]);

  const defectBar = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      if (r.result !== "NG") return;
      const code = r.defectCode || "UNKNOWN";
      const name =
        code === "UNKNOWN"
          ? "기타"
          : (DEFECT_CODES.find((d) => d.code === code) || { name: code }).name;
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [filtered]);

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "inspectedAt", label: "검사일시", width: 170 },
    { key: "result", label: "판정", width: 80 },
    { key: "defectCode", label: "불량코드", width: 120 },
    { key: "lotNo", label: "LOT", width: 160 },
    { key: "workOrderNo", label: "작업지시", width: 140 },
    { key: "processStep", label: "공정", width: 150 },
    { key: "machine", label: "설비", width: 120 },
    { key: "ocv", label: "OCV", width: 80 },
    { key: "pressure", label: "내압", width: 80 },
    { key: "inspector", label: "검사자", width: 110 },
  ];

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  // 필터 변경 시 정렬 초기화 (UX)
  useEffect(() => {
    setSortConfig({ key: null, direction: "asc" });
  }, [resultFilter, defectFilter]);

  return (
    <Wrapper>
      <Header>
        <h2>검사 이력</h2>
      </Header>

      {/* ===== 요약 ===== */}
      <SummaryGrid>
        <SummaryCard
          icon={<FiClipboard />}
          label="검사 건수"
          value={summary.total.toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="OK"
          value={summary.ok.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="NG"
          value={summary.ng.toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiPercent />}
          label="OK 비율"
          value={`${summary.okRate}%`}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiAlertTriangle />}
          label="최다 불량"
          value={summary.topDefect}
          color="var(--error)"
        />
      </SummaryGrid>

      {/* ===== 차트 ===== */}
      <ChartGrid>
        <ChartCard>
          <h4>일자별 OK/NG 추이</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="OK"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NG"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>불량 유형 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={defectBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>
      </ChartGrid>

      {/* ===== 필터바 ===== */}
      <FilterBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="LOT / 작업지시 / 제품 / 설비 / 검사자 검색"
          />
        </SearchWrap>

        <Select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
        >
          <option value="ALL">전체</option>
          <option value="OK">OK</option>
          <option value="NG">NG</option>
        </Select>

        <Select
          value={defectFilter}
          onChange={(e) => setDefectFilter(e.target.value)}
        >
          <option value="ALL">불량코드 전체</option>
          {DEFECT_CODES.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name} ({d.code})
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
          // TableStyle가 rowStyle 지원한다면, 판정 색 강조
          rowStyle={(row) => ({
            color: RESULT_COLOR[row.result] || "inherit",
          })}
        />
      </TableWrap>

      {/* ===== 상세 Drawer ===== */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <TestLogDetail row={selected} defectMap={DEFECT_CODES} />
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin: 0 0 10px 0;
  }
`;

const ChartBox = styled.div`
  height: 260px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
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
  min-width: 160px;
`;

const TableWrap = styled.div`
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
