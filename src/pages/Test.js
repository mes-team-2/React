import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import {
  FiSearch,
  FiFilter,
  FiActivity,
  FiBox,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


import TableStyle from "../components/TableStyle";
import SearchBar from "../components/SearchBar";
import SearchDate from "../components/SearchDate";
import Pagination from "../components/Pagination";
import Status from "../components/Status";
import SummaryCard from "../components/SummaryCard";
import SideDrawer from "../components/SideDrawer";



// 상세 컴포넌트는 기존에 만드신 것을 재사용하거나 새로 만드시면 됩니다.
// import LotDetail from "./LotDetail"; 

/* =========================================
   Mock Data Generation (DB Schema 기반)
   ========================================= */
const PROCESS_STEPS = ["조립(Assembly)", "활성화(Formation)", "검사(Inspection)", "포장(Packaging)"];
const LINES = ["Line-A", "Line-B", "Line-C"];

const makeLotData = () => {
  return Array.from({ length: 150 }).map((_, i) => {
    const statusRandom = Math.random();
    let status = "IN_PROGRESS";
    if (statusRandom > 0.8) status = "COMPLETED";
    else if (statusRandom > 0.7) status = "DEFECTIVE"; // 불량/Scrap
    else if (statusRandom > 0.6) status = "HOLD";      // 보류

    const initialQty = Math.floor(Math.random() * 500) + 100;
    // 진행 중이면 수량이 줄거나 그대로, 불량이면 일부 빠짐
    const currentQty = status === "COMPLETED" ? initialQty : initialQty - Math.floor(Math.random() * 10);
    const badQty = initialQty - currentQty;

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));
    const dateStr = date.toISOString().split("T")[0];

    return {
      id: i + 1,
      lotNo: `LOT-2601-${String(i + 1).padStart(4, "0")}`,
      productCode: i % 2 === 0 ? "BAT-12V-100A" : "BAT-12V-200A",
      productName: i % 2 === 0 ? "차량용 배터리 100Ah" : "산업용 배터리 200Ah",
      workOrderNo: `WO-2601-${String(Math.floor(i / 10) + 1).padStart(3, "0")}`,
      process: PROCESS_STEPS[Math.floor(Math.random() * PROCESS_STEPS.length)],
      line: LINES[Math.floor(Math.random() * LINES.length)],
      initialQty,
      currentQty,
      badQty,
      unit: "EA",
      status, // IN_PROGRESS, COMPLETED, DEFECTIVE, HOLD
      createdAt: `${dateStr} ${String(Math.floor(Math.random() * 14) + 8).padStart(2, "0")}:00`,
      operator: ["김생산", "이조립", "박공정"][Math.floor(Math.random() * 3)],
    };
  });
};

/* =========================================
   Main Component
   ========================================= */
export default function ProductLot() {
  // 1. Data & State
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  useEffect(() => {
    setData(makeLotData());
  }, []);

  // 2. Filtering
  const filteredData = useMemo(() => {
    let result = data;

    // Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter(item => item.status === statusFilter);
    }

    // Date Filter
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      result = result.filter(item => {
        const d = new Date(item.createdAt);
        return d >= start && d <= end;
      });
    }

    // Keyword Search
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter(item =>
        item.lotNo.toLowerCase().includes(lower) ||
        item.productCode.toLowerCase().includes(lower) ||
        item.workOrderNo.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [data, statusFilter, dateRange, keyword]);

  // 3. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 4. Pagination Slicing
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // 5. Statistics (Charts)
  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(d => d.status === "COMPLETED").length;
    const running = filteredData.filter(d => d.status === "IN_PROGRESS").length;
    const defective = filteredData.filter(d => d.status === "DEFECTIVE").length;

    // Pie Chart Data
    const pieData = [
      { name: "생산중", value: running, color: "#3b82f6" }, // blue
      { name: "완료", value: completed, color: "#10b981" }, // green
      { name: "불량", value: defective, color: "#ef4444" }, // red
      { name: "보류", value: total - (completed + running + defective), color: "#f59e0b" } // amber
    ];

    // Bar Chart Data (일자별 생성 수)
    const barMap = {};
    filteredData.forEach(d => {
      const date = d.createdAt.split(" ")[0].slice(5); // MM-DD
      if (!barMap[date]) barMap[date] = 0;
      barMap[date]++;
    });
    const barData = Object.keys(barMap).sort().map(k => ({ date: k, count: barMap[k] }));

    return { total, completed, running, defective, pieData, barData };
  }, [filteredData]);

  // Handlers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleRowClick = (row) => {
    setSelectedLot(row);
    setIsDrawerOpen(true);
  };

  /* =========================================
     Columns Definition (현업 MES 중요 항목)
     ========================================= */
  const columns = [
    { key: "status", label: "상태", width: 100, render: (val) => <Status status={val} /> },
    { key: "lotNo", label: "LOT 번호", width: 160, render: (val) => <Mono>{val}</Mono> },
    { key: "productName", label: "제품명", width: 180 },
    { key: "process", label: "현재 공정", width: 140, render: (val) => <Badge>{val}</Badge> },
    { key: "line", label: "생산라인", width: 100 },
    {
      key: "currentQty",
      label: "현재수량",
      width: 90,
      render: (val, row) => (
        // 불량이 발생했다면 색상 표시
        <QtyText $isBad={row.badQty > 0}>
          {val.toLocaleString()} <span style={{ fontSize: '11px', color: '#888' }}>/ {row.initialQty}</span>
        </QtyText>
      )
    },
    {
      key: "badQty",
      label: "불량",
      width: 70,
      render: (val) => val > 0 ? <BadBadge>{val}</BadBadge> : "-"
    },
    { key: "workOrderNo", label: "작업지시", width: 140, render: (val) => <Mono>{val}</Mono> },
    { key: "createdAt", label: "투입일시", width: 150 },
    { key: "operator", label: "작업자", width: 80 },
  ];

  return (
    <Container>
      <Header>
        <h2>생산 제품 LOT 관리</h2>
      </Header>

      {/* 1. 상단 요약 카드 & 차트 영역 */}
      <DashboardGrid>
        <SummarySection>
          <SummaryCard icon={<FiBox />} label="전체 LOT" value={stats.total} color="var(--font)" />
          <SummaryCard icon={<FiActivity />} label="생산 진행중" value={stats.running} color="var(--main)" />
          <SummaryCard icon={<FiCheckCircle />} label="생산 완료" value={stats.completed} color="var(--run)" />
          <SummaryCard icon={<FiAlertCircle />} label="불량 발생" value={stats.defective} color="var(--error)" />
        </SummarySection>

        <ChartSection>
          <ChartCard>
            <h4>상태별 점유율</h4>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={stats.pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <h4>일자별 LOT 생성 추이</h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={stats.barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill="var(--main)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartSection>
      </DashboardGrid>

      {/* 2. 검색 및 필터 바 */}
      <FilterBar>
        <Group>
          <SearchDate width="m" onChange={(start, end) => { setDateRange({ start, end }); setPage(1); }} />
          <StyledSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="ALL">전체 상태</option>
            <option value="IN_PROGRESS">진행중 (Running)</option>
            <option value="COMPLETED">완료 (Done)</option>
            <option value="DEFECTIVE">불량 (Defect)</option>
            <option value="HOLD">보류 (Hold)</option>
          </StyledSelect>
        </Group>
        <SearchBar
          width="l"
          placeholder="LOT 번호, 제품코드, 작업지시서 검색"
          onChange={(val) => { setKeyword(val); setPage(1); }}
        />
      </FilterBar>

      {/* 3. 데이터 테이블 */}
      <TableWrapper>
        <TableStyle
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={handleRowClick}
          selectable={false}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </TableWrapper>

      {/* 4. 상세 Drawer */}
      <SideDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="LOT 상세 정보">
        {selectedLot && (
          <div style={{ padding: '20px' }}>
            <h3>{selectedLot.lotNo}</h3>
            <p>상세 내용은 LotDetail 컴포넌트를 연결하여 구현합니다.</p>
            {/* <LotDetail lot={selectedLot} /> */}
          </div>
        )}
      </SideDrawer>

    </Container>
  );
}

/* =========================================
   Styled Components
   ========================================= */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;

const Header = styled.div`
  h2 { font-size: var(--fontXl); font-weight: bold; color: var(--font); margin: 0; }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--font2);
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
`;

const Group = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledSelect = styled.select`
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--font);
  background: var(--background);
  cursor: pointer;
  min-width: 140px;
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// 테이블 내부 스타일
const Mono = styled.span`
  font-family: monospace;
  font-weight: 600;
  color: var(--font);
`;

const Badge = styled.span`
  background: var(--background);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--font);
  border: 1px solid var(--border);
`;

const QtyText = styled.div`
  font-weight: bold;
  color: ${props => props.$isBad ? 'var(--warning)' : 'var(--font)'}; /* 불량 발생 시 주황색 경고 */
`;

const BadBadge = styled.span`
  background: #fee2e2;
  color: #ef4444;
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: bold;
`;