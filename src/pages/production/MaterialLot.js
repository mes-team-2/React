import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
  FiEdit,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";
import { LuHourglass } from "react-icons/lu";
import Status from "../../components/Status";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import SummaryCard from "../../components/SummaryCard";
import SideDrawer from "../../components/SideDrawer";
import MaterialLotDetail from "./MaterialLotDetail";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
import Progress from "../../components/Progress";

const MATERIAL_DATA = [
  {
    id: 1,
    inbound_date: "2025-12-20 12:23",
    status: "WAITING",
    lot_no: "LOT-260101-090901",
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 5000,
    production: 0,
    available: 5000,
    date: "2026/01/01 12:23",
  },
  {
    id: 2,
    inbound_date: "2025-12-21 12:23",
    status: "RUNNING",
    lot_no: "LOT-260101-090902",
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 4000,
    production: 4000, // 50% 소진 가정
    available: 0,
    date: "2026/01/01 12:23",
  },
  {
    id: 3,
    inbound_date: "2025-12-22 12:23",
    status: "WAITING",
    lot_no: "LOT-260101-090903",
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 9900,
    production: 0,
    available: 9900,
    date: "2026/01/01 12:23",
  },
  {
    id: 4,
    inbound_date: "2025-12-23 12:23",
    status: "EMPTY",
    lot_no: "LOT-260101-090904",
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 0,
    production: 0,
    available: 0,
    date: "2026/01/01 12:23",
  },
  {
    id: 5,
    inbound_date: "2025-12-24 12:23",
    status: "RUNNING",
    lot_no: "LOT-260101-090905",
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 4500,
    production: 500,
    available: 4000,
    date: "2026/01/01 12:23",
  },
  ...Array.from({ length: 30 }).map((_, i) => ({
    id: i + 6,
    inbound_date: "2025-12-25 12:23",
    status: i % 2 === 0 ? "WAITING" : "RUNNING",
    lot_no: `LOT-260101-${String(i + 6).padStart(6, '0')}`,
    code: "MAT-260101-090901",
    name: "배터리 케이스 (L3)",
    current: 5000 + i * 10,
    production: i % 2 !== 0 ? 1000 : 0,
    available: 5000 + i * 10,
    date: "2026/01/01 12:23",
  })),
];

// 날짜 포맷 함수 (yyyy-MM-dd HH:mm)
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

export default function MaterialLot() {
  // 상태 관리
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 상태 필터 관리
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 페이지당 20개씩 보여주기

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // 상태 옵션 정의
  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 상태" },
    { value: "WAITING", label: "대기중" },
    { value: "RUNNING", label: "생산중" },
    { value: "EMPTY", label: "품절/불량" },
  ];

  // 필터링 로직
  const filteredList = useMemo(() => {
    return MATERIAL_DATA.filter((item) => {
      // 키워드 검색
      const k = keyword.toLowerCase();
      const matchSearch =
        !keyword ||
        item.name.toLowerCase().includes(k) ||
        item.code.toLowerCase().includes(k) ||
        item.lot_no.toLowerCase().includes(k);

      // 날짜 검색
      let matchDate = true;
      if (item.date && (dateRange.start || dateRange.end)) {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (itemDate < startDate) matchDate = false;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(0, 0, 0, 0);
          if (itemDate > endDate) matchDate = false;
        }
      }

      // 상태 필터링
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchDate && matchStatus;
    });
  }, [keyword, dateRange, statusFilter]);

  // 정렬 로직
  const sortedList = useMemo(() => {
    let sortableItems = [...filteredList];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          // 숫자 비교
        } else {
          aValue = String(aValue);
          bValue = String(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredList, sortConfig]);

  // 현재 페이지 데이터 슬라이싱
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedList.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedList, page]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);

  // 통계 데이터
  const stats = useMemo(() => {
    return {
      total: MATERIAL_DATA.length,
      running: MATERIAL_DATA.filter((i) => i.status === "RUNNING").length,
      waiting: MATERIAL_DATA.filter((i) => i.status === "WAITING").length,
      error: MATERIAL_DATA.filter((i) => i.status === "EMPTY").length,
    };
  }, []);

  // 정렬 핸들러
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 필터 변경 시 페이지 리셋 핸들러
  const handleKeywordChange = (v) => {
    setKeyword(v);
    setPage(1);
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  // 테이블 컬럼
  const columns = [
    { key: "id", label: "No", width: 50, render: (v) => v },
    {
      key: "inbound_date",
      label: "입고일자",
      width: 150,
      render: (v) => formatDate(v)
    },
    {
      key: "status",
      label: "LOT 상태",
      width: 120,
      render: (v) => {
        let statusKey = "DEFAULT";
        if (v === "WAITING") statusKey = "LOT_WAIT";
        else if (v === "RUNNING") statusKey = "LOT_RUN";
        else if (v === "EMPTY") statusKey = "LOT_ERR";
        return <Status status={statusKey} type="basic" />;
      },
    },
    { key: "lot_no", label: "LOT번호", width: 160 },
    { key: "code", label: "자재코드", width: 150 },
    { key: "name", label: "자재명", width: 170 },
    {
      key: "current",
      label: "총 재고",
      width: 90,
      render: (v) => v.toLocaleString()
    },
    { key: "production", label: "생산투입", width: 90, render: (v) => v.toLocaleString() },
    {
      key: "usage_rate",
      label: "자재 소진율",
      width: 140,
      render: (_, row) => {
        // 소진율 계산 로직 변경 production / current (현재 재고가 총량일 경우)
        const rate = row.current > 0 ? (row.production / row.current) * 100 : 0;
        return <Progress value={rate} width="100%" color="var(--main)" />;
      }
    },
    {
      key: "date",
      label: "상태변경일시",
      width: 150,
      render: (v) => formatDate(v)
    },
  ];

  return (
    <Container>
      <Title>자재 LOT 관리</Title>

      <Cards>
        <SummaryCard icon={<FiEdit />} label="전체 LOT" value={stats.total} color="var(--main)" />
        <SummaryCard icon={<FiRefreshCw />} label="생산중(투입)" value={stats.running} color="var(--run)" />
        <SummaryCard icon={<LuHourglass />} label="대기중" value={stats.waiting} color="var(--waiting)" />
        <SummaryCard icon={<FiAlertTriangle />} label="품절/불량" value={stats.error} color="var(--error)" />
      </Cards>

      <FilterBar>
        <SearchDate
          width="m"
          onChange={handleDateChange}
          placeholder="기간 검색"
        />
        <SelectBar
          width="140px"
          placeholder="상태 선택"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        />
        <SearchBar
          width="l"
          placeholder="LOT번호 / 자재명 / 코드 검색"
          onChange={handleKeywordChange}
          onSearch={() => { }}
        />
      </FilterBar>


      <TableContainer>
        <TableStyle
          columns={columns}
          data={paginatedData}
          selectable={false}
          onRowClick={handleRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </TableContainer>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="자재 LOT 상세 조회"
      >
        {selectedRow && <MaterialLotDetail row={selectedRow} />}
      </SideDrawer>
    </Container>
  );
}


const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  font-size: var(--fontHd);
  font-weight: var(--bold);
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
 gap: 20px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;