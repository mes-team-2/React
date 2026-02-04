import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { LuHourglass } from "react-icons/lu";

import TableStyle from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Status from "../../components/Status";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import SelectBar from "../../components/SelectBar";
import Pagination from "../../components/Pagination";
import SummaryCard from "../../components/SummaryCard";
import Button from "../../components/Button";

import WorkOrderDetail from "./WorkOrderDetail";
import WorkOrderCreate from "./WorkOrderCreate";
import { WorkOrderAPI } from "../../api/AxiosAPI";

// [유틸] 안전한 날짜 변환 함수
const safeFormatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return format(date, "yyyy-MM-dd HH:mm");
};

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // 검색 조건
  const [keyword, setKeyword] = useState("");
  const [searchDateRange, setSearchDateRange] = useState({
    start: null,
    end: null,
  });
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 모달/드로어 상태
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // 데이터 로드
  const loadData = async () => {
    try {
      const res = await WorkOrderAPI.getList();

      if (!res.data || !Array.isArray(res.data)) {
        console.error("데이터 형식이 배열이 아닙니다.");
        return;
      }

      // 데이터 가공
      const formattedData = res.data.map((item) => ({
        ...item,
        startDate: safeFormatDate(item.startDate),
        endDate: safeFormatDate(item.endDate),
        dueDate: safeFormatDate(item.dueDate),
        createdAt: safeFormatDate(item.createdAt || new Date()),
        manager: item.manager || "-",
      }));

      setWorkOrders(formattedData);
    } catch (err) {
      console.error("작업지시 목록 로드 실패:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 상태별 카운트 계산
  const summaryCounts = useMemo(() => {
    const counts = { WAIT: 0, IN_PROGRESS: 0, DONE: 0 };
    workOrders.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    return counts;
  }, [workOrders]);

  // 필터링 로직
  useEffect(() => {
    if (!workOrders.length) {
      setFilteredData([]);
      return;
    }

    let result = [...workOrders];

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter(
        (row) =>
          row.id.toLowerCase().includes(k) ||
          row.product.toLowerCase().includes(k) ||
          row.manager.toLowerCase().includes(k),
      );
    }

    if (searchDateRange.start && searchDateRange.end) {
      const start = new Date(searchDateRange.start).setHours(0, 0, 0, 0);
      const end = new Date(searchDateRange.end).setHours(23, 59, 59, 999);

      result = result.filter((row) => {
        const rowDate = new Date(row.createdAt).getTime();
        return rowDate >= start && rowDate <= end;
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter((row) => row.status === statusFilter);
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [keyword, searchDateRange, statusFilter, workOrders]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const columns = useMemo(
    () => [
      { key: "id", label: "작업지시 번호", width: 140 },
      { key: "product", label: "제품명", width: 180 },
      { key: "planQty", label: "지시 수량", width: 90 },
      {
        key: "status",
        label: "상태",
        width: 150,
        render: (status) => {
          let statusKey = "DEFAULT";
          if (status === "WAIT") statusKey = "WAIT";
          else if (status === "IN_PROGRESS") statusKey = "RUN";
          else if (status === "DONE") statusKey = "COMPLETE";
          return <Status status={statusKey} />;
        },
      },
      { key: "manager", label: "담당자", width: 100 },
      { key: "createdAt", label: "등록일", width: 150 },
      { key: "startDate", label: "시작 시간", width: 150 },
      { key: "dueDate", label: "작업기한", width: 120 },
    ],
    [],
  );

  const handleDateChange = (start, end) => {
    setSearchDateRange({ start, end });
  };

  const handleCreateSubmit = (payload) => {
    console.log("Registered:", payload);
    setCreateOpen(false);
    loadData();
  };

  return (
    <Wrapper>
      <Header>
        <div>
          <h2>작업지시 관리</h2>
          <p>작업지시 등록/조회 및 LOT 생성 흐름을 관리합니다.</p>
        </div>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<LuHourglass />}
          label="대기중"
          value={`${summaryCounts.WAIT}건`}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiRefreshCw />}
          label="진행중"
          value={`${summaryCounts.IN_PROGRESS}건`}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="완료"
          value={`${summaryCounts.DONE}건`}
          color="var(--main)"
        />
      </SummaryGrid>

      <FilterGroup>
        <FilterBar>
          <SearchDate width="m" onChange={handleDateChange} />
          <SelectBar
            width="120px"
            placeholder="상태 전체"
            options={[
              { value: "ALL", label: "전체" },
              { value: "WAIT", label: "대기" },
              { value: "IN_PROGRESS", label: "진행중" },
              { value: "DONE", label: "완료" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <SearchBar
            width="250px"
            placeholder="지시번호/제품/담당자 검색"
            onChange={setKeyword}
            onSearch={(val) => console.log("검색:", val)}
          />
        </FilterBar>

        <Button variant="ok" size="m" onClick={() => setCreateOpen(true)}>
          작업지시 등록
        </Button>
      </FilterGroup>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={paginatedData}
          onRowClick={(row) => {
            setSelected(row);
            setDetailOpen(true);
          }}
        />
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </TableWrap>

      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkOrderDetail workOrder={selected} onStatusChange={loadData} />
      </SideDrawer>

      <SideDrawer open={createOpen} onClose={() => setCreateOpen(false)}>
        <WorkOrderCreate
          onSubmit={handleCreateSubmit}
          onClose={() => setCreateOpen(false)}
        />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
  p {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: var(--font2);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
