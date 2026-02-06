import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import SummaryCard from "../../components/SummaryCard";
import TableStyle from "../../components/TableStyle";
import SearchDate from "../../components/SearchDate";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
// [핵심] AxiosAPI.js에 추가한 API 객체 import
import { ProductionReportAPI } from "../../api/AxiosAPI";

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

import { FiTrendingUp, FiTarget, FiAlertTriangle, FiBox } from "react-icons/fi";

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
  const [daily, setDaily] = useState([]);
  const [processToday, setProcessToday] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // [API 호출]
  const loadData = async () => {
    try {
      // 1. 일자별 리포트 API 호출
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const resDaily = await ProductionReportAPI.getDailyReport(params);
      setDaily(resDaily.data || []);

      // 2. 오늘 공정별 현황 API 호출
      const resProcess = await ProductionReportAPI.getProcessStatus();

      // 차트용 데이터 포맷 변환 (DTO -> Chart)
      const chartData = (resProcess.data || []).map((p) => ({
        name: p.processName,
        output: p.output,
        ng: p.ng,
      }));
      setProcessToday(chartData);
    } catch (err) {
      console.error("리포트 조회 실패:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

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

  // 클라이언트 측 제품명 필터링
  const filteredDaily = useMemo(() => {
    let result = daily;
    if (productFilter !== "all") {
      result = result.filter((r) => r.productName === productFilter);
    }
    return result;
  }, [daily, productFilter]);

  const summary = useMemo(() => {
    const plan = filteredDaily.reduce((a, b) => a + (b.plan || 0), 0);
    const prod = filteredDaily.reduce((a, b) => a + (b.prod || 0), 0);
    const ng = filteredDaily.reduce((a, b) => a + (b.ng || 0), 0);
    const ok = filteredDaily.reduce((a, b) => a + (b.ok || 0), 0);

    const yieldRate = prod === 0 ? 0 : Math.round((ok / prod) * 1000) / 10;
    const achievement = plan === 0 ? 0 : Math.round((prod / plan) * 100);

    return { plan, prod, ok, ng, yieldRate, achievement };
  }, [filteredDaily]);

  const chartDaily = useMemo(() => {
    const grouped = {};
    filteredDaily.forEach((r) => {
      if (!grouped[r.date])
        grouped[r.date] = { day: r.date.slice(5, 10), plan: 0, prod: 0 };
      grouped[r.date].plan += r.plan;
      grouped[r.date].prod += r.prod;
    });
    return Object.values(grouped).sort((a, b) => (a.day > b.day ? 1 : -1));
  }, [filteredDaily]);

  const columns = [
    { key: "date", label: "일자", width: 130 },
    { key: "productName", label: "제품명", width: 150 },
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
      prod: Number(row.prod).toLocaleString(),
      plan: Number(row.plan).toLocaleString(),
      ok: Number(row.ok).toLocaleString(),
      ng: Number(row.ng).toLocaleString(),
    }));
  }, [currentData]);

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

  const onRowClick = (row) => {
    // 상세 로직 필요 시 구현
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
                  name="계획"
                />
                <Line
                  dataKey="prod"
                  stroke="var(--run)"
                  strokeWidth={2}
                  dot={false}
                  name="실적"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>오늘 공정별 Output / NG</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={processToday}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="output"
                  fill="var(--main)"
                  radius={[9, 9, 0, 0]}
                  name="Output"
                />
                <Bar
                  dataKey="ng"
                  fill="var(--error)"
                  radius={[9, 9, 0, 0]}
                  name="NG"
                />
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

const TableWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
