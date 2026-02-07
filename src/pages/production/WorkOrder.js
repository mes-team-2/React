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

import WorkOrderCreate from "./WorkOrderCreate";
import { WorkOrderAPI } from "../../api/AxiosAPI";

// [유틸] 안전한 날짜 변환 함수
const safeFormatDate = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  // 백엔드에서 이미 포맷팅된 문자열("yyyy-MM-dd HH:mm")이 올 경우 그대로 반환
  if (dateStr.length === 16 && dateStr.includes("-") && dateStr.includes(":")) {
    return dateStr;
  }
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

  // 체크박스 선택 상태
  const [selectedIds, setSelectedIds] = useState([]);

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
        // [수정] 백엔드 데이터를 그대로 사용 (fallback 제거)
        createdAt: safeFormatDate(item.createdAt),
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

  // 선택된 항목 작업 시작 핸들러
  const handleStartWork = async () => {
    if (selectedIds.length === 0) {
      alert("작업을 시작할 항목을 선택해주세요.");
      return;
    }

    const invalidItems = workOrders.filter(
      (item) => selectedIds.includes(item.id) && item.status !== "WAIT",
    );

    if (invalidItems.length > 0) {
      alert("대기(WAIT) 상태인 작업만 시작할 수 있습니다.");
      return;
    }

    if (
      !window.confirm(
        `선택한 ${selectedIds.length}건의 작업을 시작하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((id) => WorkOrderAPI.startWork(id)));

      alert("작업이 시작되었습니다.");
      setSelectedIds([]); // 선택 초기화
      loadData(); // 데이터 갱신
    } catch (err) {
      console.error(err);
      alert("작업 시작 중 오류가 발생했습니다.");
    }
  };

  return (
    <Wrapper>
      <Header>
        <h2>작업지시 관리</h2>
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
            width="s"
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
            width="l"
            placeholder="지시번호/제품/담당자 검색"
            onChange={setKeyword}
            onSearch={(val) => console.log("검색:", val)}
          />
        </FilterBar>

        <ButtonGroup>
          <Button variant="ok" size="m" onClick={handleStartWork}>
            작업시작
          </Button>
          <Button variant="ok" size="m" onClick={() => setCreateOpen(true)}>
            작업지시 등록
          </Button>
        </ButtonGroup>
      </FilterGroup>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={paginatedData}
          selectable={true}
          selectedIds={selectedIds} // 체크박스 선택된 ID 목록
          onSelectChange={setSelectedIds} // 선택 변경 핸들러
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
