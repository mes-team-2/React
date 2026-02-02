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

// 랜덤으로 담당자를 생성함 / ID 기반으로 항상 같은 담당자를 반환하는 함수
const getManagerById = (id) => {
  const managers = ["이현수", "김하린", "우민규", "양찬종"];
  // ID 문자열의 각 문자 코드를 더해서 숫자로 만듦
  let sum = 0;
  if (typeof id === "string") {
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
  } else if (typeof id === "number") {
    sum = id;
  }

  // 합계를 매니저 수로 나눈 나머지 인덱스 사용 -> 항상 같은 결과 보장
  return managers[sum % managers.length];
};

export default function WorkOrder() {
  // 상태 관리
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

      // 데이터 가공 (등록일, 담당자 추가)
      const formattedData = res.data.map((item) => ({
        ...item,
        startDate: safeFormatDate(item.startDate),
        endDate: safeFormatDate(item.endDate),
        dueDate: safeFormatDate(item.dueDate),
        // 등록일 (DB created_at 매핑 가정)
        createdAt: safeFormatDate(item.createdAt || new Date()),
        // 담당자 (랜덤으로 배정된 사람 id 불러옴)
        manager: getManagerById(item.id),
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

  // --- 필터링 로직 ---
  useEffect(() => {
    if (!workOrders.length) {
      setFilteredData([]);
      return;
    }

    let result = [...workOrders];

    // 키워드 검색 (지시번호, 제품명, 담당자)
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter(
        (row) =>
          row.id.toLowerCase().includes(k) ||
          row.product.toLowerCase().includes(k) ||
          row.manager.toLowerCase().includes(k), // 담당자 검색 추가
      );
    }

    // 날짜 검색 (등록일 기준)
    if (searchDateRange.start && searchDateRange.end) {
      const start = new Date(searchDateRange.start).setHours(0, 0, 0, 0);
      const end = new Date(searchDateRange.end).setHours(23, 59, 59, 999);

      result = result.filter((row) => {
        // 등록일(createdAt) 기준으로 필터링
        const rowDate = new Date(row.createdAt).getTime();
        return rowDate >= start && rowDate <= end;
      });
    }

    // 상태 필터
    if (statusFilter !== "ALL") {
      result = result.filter((row) => row.status === statusFilter);
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [keyword, searchDateRange, statusFilter, workOrders]);

  // --- 페이지네이션 ---
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- 테이블 컬럼 정의 ---
  const columns = useMemo(
    () => [
      { key: "id", label: "작업지시 번호", width: 140 },
      { key: "product", label: "제품", width: 180 },
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
      // [변경] 담당자 컬럼 추가
      { key: "manager", label: "담당자", width: 100 },
      // [변경] 등록일 컬럼 추가
      { key: "createdAt", label: "등록일", width: 150 },
      { key: "startDate", label: "시작 시간", width: 150 },
      { key: "dueDate", label: "납기일", width: 120 },
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
        <WorkOrderDetail workOrder={selected} />
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
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 3개 카드 균등 배치
  gap: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
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
