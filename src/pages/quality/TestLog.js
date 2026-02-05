import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import TestLogDetail from "./TestLogDetail";
import Pagination from "../../components/Pagination";
import { LogAPI2 } from "../../api/AxiosAPI2";

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

import SearchDate from "../../components/SearchDate";

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
  const [rows, setRows] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL | OK | NG
  const [defectFilter, setDefectFilter] = useState("ALL"); // ALL | code
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(null);

  // SearchBar onChange (value/event 모두 대응)
  const handleKeywordChange = (v) => {
    if (typeof v === "string") return setKeyword(v);
    if (v?.target?.value !== undefined) return setKeyword(v.target.value);
    setKeyword("");
  };

  const defectOptions = useMemo(() => {
    if (!dashboard?.defects) return [];

    return dashboard.defects.map((d) => ({
      code: d.defectType,
      name: d.defectType, // 이름 없으면 코드 그대로
    }));
  }, [dashboard]);

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

  // 검사이력 페이지용
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const params = {
          page: page - 1,
          keyword: keyword || null,
          isOk: resultFilter === "ALL" ? null : resultFilter === "OK",
          defectType: defectFilter === "ALL" ? null : defectFilter,
        };

        const res = await LogAPI2.getTestLogs(params);

        // Spring Page 구조
        const content = res.data.content;

        const mapped = content.map((item, idx) => ({
          id: idx,
          inspectedAt: item.endedAt?.replace("T", " ").slice(0, 16),
          productCode: item.productName, // 없으면 productName으로 대체
          productName: item.productName,
          workOrderNo: item.workOrderNo,
          lotNo: item.lotNo,
          processStep: item.processStepName,
          machine: item.machineName,
          voltage: item.voltage, // 전압
          humidity: item.humidity, // 임시
          temperature: item.temperature,
          leak: false, // 데이터 없으면 false
          result: item.isOk ? "OK" : "NG",
          defectCode: item.defectType,
          inspector: item.workerCode,
          note: "",
        }));

        setRows(mapped);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        console.error("검사 이력 조회 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, keyword, resultFilter]);

  // 통계용
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const params = {
          keyword: keyword || null,
          isOk: resultFilter === "ALL" ? null : resultFilter === "OK",
          defectType: defectFilter === "ALL" ? null : defectFilter,
        };

        const res = await LogAPI2.getTestSummaryLogs(params);
        setDashboard(res.data);
      } catch (e) {
        console.error("대시보드 조회 실패", e);
      }
    };

    fetchDashboard();
  }, [keyword, resultFilter]);

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

  /* =========================
     차트 데이터
  ========================= */
  const dailyTrend = dashboard?.daily ?? [];

  const defectBar = dashboard?.defects ?? [];

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
    { key: "voltage", label: "전압", width: 80 },
    { key: "humidity", label: "습도", width: 80 },
    { key: "temperature", label: "온도", width: 80 },
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

  useEffect(() => {
    setPage(1);
  }, [resultFilter, defectFilter, keyword, sortConfig]);

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
          value={(dashboard?.totalCount ?? 0).toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="OK"
          value={(dashboard?.okCount ?? 0).toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="NG"
          value={(dashboard?.ngCount ?? 0).toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiPercent />}
          label="OK 비율"
          value={`${dashboard?.okRate ?? 0}%`}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiAlertTriangle />}
          label="최다 불량"
          value={dashboard?.topDefectType ?? "-"}
          color="var(--error)"
        />
      </SummaryGrid>

      {/* ===== 차트 ===== */}
      <ChartGrid>
        <ChartCard>
          <h4>일자별 OK/NG 추이</h4>
          <ChartBox>
            {dashboard && (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dashboard.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ok"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ng"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>불량 유형 분포</h4>
          <ChartBox>
            {dashboard && dashboard.defects && (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboard.defects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="defectType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
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

        <SearchDate
          type="single"
          width="m"
          onChange={(d) => {
            setDate(d);
            setPage(1);
          }}
        />

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
          {defectOptions.map((d) => (
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
          data={rows}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
        />
      </TableWrap>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ===== 상세 Drawer ===== */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <TestLogDetail row={selected} defectMap={defectOptions} />
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
  margin-top: 20px;
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
