import styled from "styled-components";
import { useMemo, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import SearchBar from "../../components/SearchBar";
import Table from "../../components/TableStyle";
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
  for (let d = 14; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day.getDate()).padStart(2, "0")}`;

    const plan = rand(500, 900);
    const prod = plan - rand(-30, 120); // 오버/언더
    const ng = Math.max(0, Math.floor(prod * (rand(5, 25) / 1000))); // 0.5~2.5%
    rows.push({
      date: dateStr,
      plan,
      prod,
      ok: Math.max(0, prod - ng),
      ng,
      yield: prod === 0 ? 0 : Math.round(((prod - ng) / prod) * 1000) / 10,
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

export default function ProductionReport() {
  const [daily] = useState(() => makeDaily());
  const [processToday] = useState(() => makeProcessToday());

  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const filteredDaily = useMemo(() => {
    if (!keyword.trim()) return daily;
    const k = keyword.toLowerCase();
    return daily.filter((r) => r.date.toLowerCase().includes(k));
  }, [daily, keyword]);

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
    { key: "plan", label: "계획", width: 90 },
    { key: "prod", label: "실적", width: 90 },
    { key: "ok", label: "양품", width: 90 },
    { key: "ng", label: "불량", width: 90 },
    { key: "yield", label: "수율(%)", width: 100 },
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

  const onRowClick = (row) => {
    setSelectedDate(row.date);
    setDrawerOpen(true);
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
        <SummaryCard
          icon={<FiList />}
          label="리포트 일수"
          value={filteredDaily.length.toLocaleString()}
          color="var(--waiting)"
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
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="일자 검색 (YYYY-MM-DD)"
          />
        </SearchWrap>
      </FilterBar>

      <TableWrap>
        <Table
          columns={columns}
          data={sorted}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
        />
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
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
