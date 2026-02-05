import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiEdit, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
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
import { InventoryAPI2 } from "../../api/AxiosAPI2";

// 백엔드 데이터 프론트에 맞게 수정
const mapStatus = (s) => {
  if (s === "AVAILABLE") return "WAITING";
  if (s === "HOLD") return "RUNNING";
  if (s === "EXHAUSTED") return "EMPTY";
  return s;
};

// 프론트 데이터 백엔드에 맞게 수정
const toBackendStatus = (s) => {
  if (s === "WAITING") return "AVAILABLE";
  if (s === "RUNNING") return "HOLD";
  if (s === "EMPTY") return "EXHAUSTED";
  return undefined;
};

// 날짜 변환 함수
// Date → yyyy-MM-dd
const toLocalDate = (d) => {
  if (!d) return undefined;

  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

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
  const [list, setList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    waiting: 0,
    empty: 0,
  });

  // 상태 필터 관리
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 페이지네이션 상태
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // 상태 옵션 정의
  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 상태" },
    { value: "WAITING", label: "대기중" },
    { value: "RUNNING", label: "생산중" },
    { value: "EMPTY", label: "품절/불량" },
  ];

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
    console.log("날짜 변경:", start, end);
    setDateRange({ start, end });
    setPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  // 목록 조회
  const fetchList = async () => {
    try {
      const params = {
        page: page - 1,
        size: 20,
        keyword: keyword || undefined,
        status:
          statusFilter === "ALL" ? undefined : toBackendStatus(statusFilter),
        startDate: toLocalDate(dateRange.start),
        endDate: toLocalDate(dateRange.end),
      };

      console.log("fetchList params:", params); // 여기

      const res = await InventoryAPI2.getMaterialLotList(params);
      const data = res.data;

      // 백엔드 DTO → 프론트 구조 매핑
      const mapped = data.content.map((i) => ({
        id: i.id,
        inbound_date: i.inboundDate,
        status: mapStatus(i.status),
        lot_no: i.lotNo,
        code: i.materialCode,
        name: i.materialName,
        current: i.currentQty,
        production: i.productionQty,
        date: i.statusChangedAt,
      }));

      setList(mapped);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error("LOT 목록 조회 실패", e);
    }
  };

  // 합계 조회
  const fetchSummary = async () => {
    try {
      const res = await InventoryAPI2.getMaterialLotSummary();
      const s = res.data;

      setStats({
        total: s.total,
        waiting: s.waiting,
        running: s.running,
        empty: s.empty,
      });
      console.log("summary raw", res.data);
    } catch (e) {
      console.error("LOT 요약 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, keyword, statusFilter, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // 테이블 컬럼
  const columns = [
    { key: "id", label: "No", width: 50, render: (v) => v },
    {
      key: "inbound_date",
      label: "입고일자",
      width: 150,
      render: (v) => formatDate(v),
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
      render: (v) => v.toLocaleString(),
    },
    {
      key: "production",
      label: "생산투입",
      width: 90,
      render: (v) => v.toLocaleString(),
    },
    {
      key: "usage_rate",
      label: "자재 소진율",
      width: 140,
      render: (_, row) => {
        // 소진율 계산 로직 변경 production / current (현재 재고가 총량일 경우)
        const rate = row.current > 0 ? (row.production / row.current) * 100 : 0;
        return <Progress value={rate} width="100%" color="var(--main)" />;
      },
    },
    {
      key: "date",
      label: "상태변경일시",
      width: 150,
      render: (v) => formatDate(v),
    },
  ];

  return (
    <Container>
      <Title>자재 LOT 관리</Title>

      <Cards>
        <SummaryCard
          icon={<FiEdit />}
          label="전체 LOT"
          value={stats.total}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiRefreshCw />}
          label="생산중(투입)"
          value={stats.running}
          color="var(--run)"
        />
        <SummaryCard
          icon={<LuHourglass />}
          label="대기중"
          value={stats.waiting}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiAlertTriangle />}
          label="품절/불량"
          value={stats.empty}
          color="var(--error)"
        />
      </Cards>

      <FilterBar>
        <SearchDate
          width="m"
          onChange={handleDateChange}
          placeholder="기간 검색"
        />
        <SelectBar
          width="s"
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
          onSearch={() => {}}
        />
      </FilterBar>

      <TableContainer>
        <TableStyle
          columns={columns}
          data={list}
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
  margin-top: 20px;
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
