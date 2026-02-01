import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { FiLayers, FiCheckCircle, FiActivity, FiAlertTriangle } from "react-icons/fi";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import Pagination from "../../components/Pagination";
import Status from "../../components/Status";
import SummaryCard from "../../components/SummaryCard";
import SideDrawer from "../../components/SideDrawer";
import LotDetail from "./LotDetail";
import SelectBar from "../../components/SelectBar";
import Progress from "../../components/Progress";


export default function ProductLot() {
  // 상태 관리
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // 드로어 상태
  const [lotOpen, setLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  // SelectBar에 들어갈 상태 옵션 정의
  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 상태" },
    { value: "LOT_RUN", label: "생산중" },
    { value: "LOT_OK", label: "생산완료" },
    { value: "LOT_ERR", label: "불량" },
    { value: "LOT_WAIT", label: "소진완료" },
  ];

  useEffect(() => {
    const mockData = Array.from({ length: 150 }).map((_, i) => {
      const rand = Math.random();
      let status = "LOT_RUN"; // 기본: 생산중

      if (rand > 0.8) status = "LOT_OK";      // 생산완료
      else if (rand > 0.7) status = "LOT_ERR"; // 불량
      else if (rand > 0.6) status = "LOT_WAIT"; // 소진완료(대기/종료)

      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 14));
      const dateStr = dateObj.toISOString().split("T")[0];

      const initialQty = Math.floor(Math.random() * 500) + 500; // 500 ~ 1000
      const badQty = status === "LOT_ERR" ? Math.floor(Math.random() * 50) : 0;

      // [수정 핵심] 상태에 따른 현재 수량(currentQty) 계산
      let currentQty = 0;

      if (status === "LOT_WAIT") {
        // 대기중: 아직 시작 안 함 (0%)
        currentQty = 0;
      } else if (status === "LOT_RUN") {
        // 생산중: 10% ~ 95% 사이 랜덤 진행
        const progressRate = 0.1 + Math.random() * 0.85;
        currentQty = Math.floor(initialQty * progressRate);
      } else {
        // 완료(LOT_OK) 혹은 불량(LOT_ERR): 거의 100% 완료된 상태
        currentQty = initialQty - badQty;
      }

      return {
        id: i + 1,
        lotNo: `LOT-2601-${String(i + 1).padStart(4, "0")}`,
        productCode: i % 2 === 0 ? "BAT-12V-100A" : "BAT-12V-200A",
        productName: i % 2 === 0 ? "차량용 배터리 100Ah" : "산업용 배터리 200Ah",
        process: ["조립", "화성", "검사", "포장"][Math.floor(Math.random() * 4)],
        line: ["Line-A", "Line-B"][Math.floor(Math.random() * 2)],
        initialQty,
        currentQty,
        badQty,
        status,
        workOrderNo: `WO-2601-${String(Math.floor(i / 10) + 1).padStart(3, "0")}`,
        createdAt: `${dateStr} ${String(Math.floor(Math.random() * 9) + 9).padStart(2, "0")}:00`,
        operator: ["김철수", "이영희", "박민수"][Math.floor(Math.random() * 3)],
      };
    });
    setData(mockData);
  }, []);

  // 필터링 로직 (검색어 + 날짜 + 상태)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 키워드 검색
      const k = keyword.toLowerCase();
      const matchKeyword =
        !keyword ||
        item.lotNo.toLowerCase().includes(k) ||
        item.productCode.toLowerCase().includes(k) ||
        item.productName.toLowerCase().includes(k) ||
        item.workOrderNo.toLowerCase().includes(k);

      // 날짜 검색
      let matchDate = true;
      if (dateRange.start && dateRange.end) {
        const itemDate = new Date(item.createdAt);
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        matchDate = itemDate >= start && itemDate <= end;
      }

      // 상태 필터
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchKeyword && matchDate && matchStatus;
    });
  }, [data, keyword, dateRange, statusFilter]);

  // 정렬 로직
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

  // 페이지네이션 데이터 슬라이싱
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // 통계 데이터 (차트용)
  const stats = useMemo(() => {
    const running = filteredData.filter(d => d.status === "LOT_RUN").length;
    const completed = filteredData.filter(d => d.status === "LOT_OK").length;
    const defective = filteredData.filter(d => d.status === "LOT_ERR").length;
    const exhausted = filteredData.filter(d => d.status === "LOT_END").length;

    // 파이 차트 데이터 키값도 맞춰줌 (COLORS 객체와 매칭)
    const pieData = [
      { name: "생산중", value: running, key: "LOT_RUN" },
      { name: "생산완료", value: completed, key: "LOT_OK" },
      { name: "불량", value: defective, key: "LOT_ERR" },
      { name: "소진완료", value: exhausted, key: "LOT_END" },
    ];

    // 라인 차트 데이터 (일자별 생산 실적)
    const lineMap = {};
    filteredData.forEach(d => {
      const date = d.createdAt.split(" ")[0].slice(5); // MM-DD
      if (!lineMap[date]) lineMap[date] = { date, target: 0, actual: 0 };
      lineMap[date].target += d.initialQty;
      lineMap[date].actual += d.currentQty;
    });
    const lineData = Object.values(lineMap).sort((a, b) => a.date.localeCompare(b.date));

    return { running, completed, defective, exhausted, pieData, lineData };
  }, [filteredData]);


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // 검색 시 페이지 리셋
  const handleKeywordChange = (val) => {
    setKeyword(val);
    // setPage(1);
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedLot(row);
    setLotOpen(true);
  };

  const columns = [
    {
      key: "status",
      label: "상태",
      width: 150,
      render: (val) => <Status status={val} type="basic" />
    },
    { key: "lotNo", label: "LOT 번호", width: 130 },
    { key: "productCode", label: "제품코드", width: 140 },
    { key: "productName", label: "제품명", width: 150 },
    { key: "process", label: "현재 공정", width: 70 },
    { key: "line", label: "생산 라인", width: 100 },
    {
      key: "currentQty",
      label: "실적/계획수량",
      width: 120,
      render: (val, row) => (
        <QtyDisplay>
          <strong className="current">{val.toLocaleString()}</strong>
          <span className="divider">/</span>
          <span className="initial">{row.initialQty.toLocaleString()}</span>
        </QtyDisplay>
      )
    },
    {
      key: "progress",
      label: "진행률",
      width: 150,
      render: (_, row) => {
        const rate = row.initialQty > 0 ? (row.currentQty / row.initialQty) * 100 : 0;
        return <Progress value={rate} width="100%" />;
      }
    },
    {
      key: "badQty",
      label: "불량",
      width: 80,
      render: (val) => <BadText $isBad={val > 0}>{val > 0 ? val : '-'}</BadText>
    },
    { key: "workOrderNo", label: "작업 지시", width: 140 },
    { key: "createdAt", label: "상태 변경 일시", width: 150 },
    { key: "operator", label: "작업자", width: 90 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>제품 LOT 관리</h2>
      </Header>

      {/* 차트 영역 */}
      <ChartGrid>
        <Card>
          <h4>일자별 생산 실적 (목표 vs 달성)</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={stats.lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="target" name="목표수량" stroke="var(--main)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="actual" name="생산수량" stroke="var(--run)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
        <SummaryGrid>
          <SummaryCard icon={<FiLayers />} label="전체 LOT" value={filteredData.length} color="var(--font)" />
          <SummaryCard icon={<FiActivity />} label="생산중" value={stats.running} color="var(--run)" />
          <SummaryCard icon={<FiCheckCircle />} label="생산완료" value={stats.completed} color="var(--main)" />
          <SummaryCard icon={<FiAlertTriangle />} label="불량" value={stats.defective} color="var(--error)" />
        </SummaryGrid>

      </ChartGrid>

      <FilterBar>
        <SelectBar
          width="140px"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="상태 선택"
        />

        <SearchDate
          width="m"
          onChange={handleDateChange}
          placeholder="기간 검색"
        />
        <SearchBar
          width="l"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder="LOT 번호 / 제품명 / 작업지시 검색"
        />
      </FilterBar>

      <TableWrapper>
        <TableStyle
          columns={columns}
          data={paginatedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={handleRowClick}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </TableWrapper>

      <SideDrawer open={lotOpen} onClose={() => setLotOpen(false)}>
        <LotDetail lot={selectedLot} />
      </SideDrawer>
    </Wrapper>
  );
}


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding-right: 20px;


  box-shadow: var(--shadow);

  h4 {
    font-size: var(--fontSm);
    margin: 15px;
    font-weight: var(--bold);
    color: var(--font);
  }
`;

const ChartBox = styled.div`
  height: 150px;
  font-size: var(--fontXxs);
  margin-top: 30px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const FilterBar = styled.div`
 display: flex;
  align-items: center;
  gap: 10px;
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const BadText = styled.span`
  color: ${props => props.$isBad ? "var(--error)" : "inherit"};
  font-weight: ${props => props.$isBad ? "bold" : "var(--medium)"};
`;

const QtyDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  .current {
    font-weight: bold;
    color: var(--main);
  }
  .divider {
    color: var(--border);
  }
  .initial {
    color: var(--font2);
  }
`;