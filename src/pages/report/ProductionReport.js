import styled from "styled-components";
import { useMemo, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import TableStyle from "../../components/TableStyle";
import SearchDate from "../../components/SearchDate";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
import SideDrawer from "../../components/SideDrawer";
import ProductionReportDetail from "./ProductionReportDetail";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import {
  FiTrendingUp,
  FiTarget,
  FiAlertTriangle,
  FiBox,
  FiList,
} from "react-icons/fi";

const PROCESS = ["극판 적층", "COS 용접", "전해액 주입/화성", "최종 성능 검사"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeDaily() {
  const rows = [];
  for (let d = 50; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day.getDate()).padStart(2, "0")}`;

    const plan = rand(500, 900);
    const prod = plan - rand(-30, 120);
    const ng = Math.max(0, Math.floor(prod * (rand(5, 80) / 1000)));

    const defectRate = prod === 0 ? 0 : Math.round((ng / prod) * 100 * 10) / 10;

    rows.push({
      date: dateStr,
      productName: Math.random() > 0.5 ? "12V 소형 배터리" : "12V 중형 배터리",
      plan,
      prod,
      ok: Math.max(0, prod - ng),
      ng,
      yield: prod === 0 ? 0 : Math.round(((prod - ng) / prod) * 1000) / 10,
      defectRate,
    });
  }
  return rows;
}

function makeProcessToday() {
  return PROCESS.map((p) => {
    const input = rand(400, 900);
    const output = input - rand(0, 40);
    const ng = rand(0, 10);
    return {
      process: p,
      input,
      output,
      ng,
      fpY: input === 0 ? 0 : Math.round(((output - ng) / input) * 1000) / 10,
    };
  });
}

const formatDateString = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ProductionReport() {
  const [daily] = useState(() => makeDaily());
  const [processToday] = useState(() => makeProcessToday());

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const productOptions = useMemo(() => {
    const uniqueProducts = Array.from(
      new Set(daily.map((item) => item.productName)),
    );
    const options = uniqueProducts.map((name) => ({
      value: name,
      label: name,
    }));
    return [{ value: "all", label: "전체 제품" }, ...options];
  }, [daily]);

  //  필터링 (날짜 범위 + 제품명)
  const filteredDaily = useMemo(() => {
    let result = daily;

    // 날짜 검색
    if (dateRange.startDate && dateRange.endDate) {
      result = result.filter((r) => {
        return r.date >= dateRange.startDate && r.date <= dateRange.endDate;
      });
    }

    // 제품명 필터
    if (productFilter !== "all") {
      result = result.filter((r) => r.productName === productFilter);
    }

    return result;
  }, [daily, dateRange, productFilter]);

  const summary = useMemo(() => {
    const plan = filteredDaily.reduce((a, b) => a + b.plan, 0);
    const prod = filteredDaily.reduce((a, b) => a + b.prod, 0);
    const ng = filteredDaily.reduce((a, b) => a + b.ng, 0);
    const ok = Math.max(0, prod - ng);
    const yieldRate = prod === 0 ? 0 : Math.round((ok / prod) * 1000) / 10;
    const achievement = plan === 0 ? 0 : Math.round((prod / plan) * 100);

    return { plan, prod, ok, ng, yieldRate, achievement };
  }, [filteredDaily]);

  const chartDaily = useMemo(() => {
    return filteredDaily.map((r) => ({
      day: r.date.slice(5, 10),
      plan: r.plan,
      prod: r.prod,
      yield: r.yield,
      ng: r.ng,
    }));
  }, [filteredDaily]);

  const chartProcess = useMemo(() => {
    return processToday.map((r) => ({
      name: r.process,
      output: r.output,
      ng: r.ng,
    }));
  }, [processToday]);

  const columns = [
    { key: "date", label: "일자", width: 130 },
    { key: "productName", label: "제품명", width: 90 },
    { key: "plan", label: "계획", width: 90 },
    { key: "prod", label: "실적", width: 90 },
    { key: "ok", label: "양품", width: 90 },
    { key: "ng", label: "불량", width: 90 },
    { key: "yield", label: "수율(%)", width: 100 },
    { key: "defectRate", label: "불량률(%)", width: 100 },
  ];

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filteredDaily;
    return [...filteredDaily].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === "string")
        return sortConfig.direction === "asc"
          ? av.localeCompare(bv, "ko", { numeric: true })
          : bv.localeCompare(av, "ko", { numeric: true });
      return sortConfig.direction === "asc" ? av - bv : bv - av;
    });
  }, [filteredDaily, sortConfig]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sorted, currentPage]);

  const formattedData = useMemo(() => {
    return currentData.map((row) => ({
      ...row,
      defectRate:
        row.defectRate >= 3.0 ? (
          <span style={{ color: "var(--error)", fontWeight: "bold" }}>
            {row.defectRate}%
          </span>
        ) : (
          `${row.defectRate}%`
        ),
      yield: `${row.yield}%`,
    }));
  }, [currentData]);

  const onRowClick = (row) => {
    setSelectedDate(row.date);
    setDrawerOpen(true);
  };

  const handleDateChange = (start, end) => {
    setDateRange({
      startDate: formatDateString(start),
      endDate: formatDateString(end),
    });
    setCurrentPage(1);
  };

  const handleProductChange = (e) => {
    setProductFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Wrapper>
      <Header>
        <h2>생산 리포트</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiTarget />}
          label="계획 대비 달성"
          value={`${summary.achievement}%`}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiBox />}
          label="생산 실적"
          value={summary.prod.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiTrendingUp />}
          label="수율"
          value={`${summary.yieldRate}%`}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiAlertTriangle />}
          label="불량"
          value={summary.ng.toLocaleString()}
          color="var(--error)"
        />
      </SummaryGrid>

      <ChartGrid>
        <ChartCard>
          <h4>일자별 계획 vs 실적</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={chartDaily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="plan"
                  stroke="var(--main)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="prod"
                  stroke="var(--run)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>오늘 공정별 Output / NG</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={chartProcess}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="output" fill="var(--run)" />
                <Bar dataKey="ng" fill="var(--error)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>
      </ChartGrid>

      <FilterBar>
        <SearchDate
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateChange}
        />
        <SelectBar
          width="l"
          options={productOptions}
          value={productFilter}
          onChange={handleProductChange}
          placeholder="제품 선택"
        />
      </FilterBar>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={formattedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
        />
        {sorted.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ProductionReportDetail
          date={selectedDate}
          processRows={processToday}
        />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  h4 {
    font-size: var(--fontSm);
    margin-bottom: 20px;
    font-weight: var(--medium);
    color: var(--font);
  }
`;

const ChartBox = styled.div`
  height: 220px;
  padding-right: 20px;
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

const TableWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
