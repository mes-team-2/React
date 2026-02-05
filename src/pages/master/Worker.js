import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Status from "../../components/Status";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import SelectBar from "../../components/SelectBar";
import Button from "../../components/Button";
import WorkerDetail from "./WorkerDetail";
import WorkerCreate from "./WorkerCreate";
import { WorkerAPI } from "../../api/AxiosAPI";

export default function Worker() {
  const [workers, setWorkers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Drawer 상태 관리
  const [drawer, setDrawer] = useState({ open: false, mode: null });
  const [selectedRow, setSelectedRow] = useState(null); // 수정할 데이터 임시 저장

  const [form, setForm] = useState({
    id: null,
    workerNo: "",
    name: "",
    position: "작업자",
    joinedAt: "",
    active: true,
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const fetchWorkers = async () => {
    try {
      const res = await WorkerAPI.getList();
      setWorkers(res.data);
    } catch (err) {
      console.error("작업자 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const statusOptions = [
    { value: "all", label: "전체 상태" },
    { value: "true", label: "출근" },
    { value: "false", label: "퇴근" },
  ];

  // 검색 옵션
  const filteredData = useMemo(() => {
    return workers.filter((item) => {
      // 날짜 필터 (입사일 joinedAt 기준)
      if (dateRange.start && dateRange.end) {
        const itemDate = new Date(item.joinedAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        itemDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      // 근무 상태 필터
      if (statusFilter !== "all") {
        const isActive = statusFilter === "true";
        if (item.active !== isActive) {
          return false;
        }
      }

      // 검색어 필터
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const matchWorkerNo = (item.workerNo || "")
          .toLowerCase()
          .includes(lowerTerm);
        const matchName = (item.name || "").toLowerCase().includes(lowerTerm);

        // 둘 중 하나라도 포함되면 통과
        if (!matchWorkerNo && !matchName) {
          return false;
        }
      }

      return true;
    });
  }, [workers, dateRange, searchTerm, statusFilter]);

  // 정렬 (필터링된 데이터 기준)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const openCreate = () => {
    setForm({
      id: null,
      workerNo: "",
      name: "",
      position: "작업자",
      joinedAt: new Date().toISOString().split("T")[0],
      active: true, // 기본 출근 상태
    });
    setDrawer({ open: true, mode: "create" });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, mode: null });
  };

  const columns = [
    { key: "workerNo", label: "사원 번호", width: 160 },
    { key: "name", label: "사원명", width: 140 },
    { key: "position", label: "직급", width: 120 },
    {
      key: "active",
      label: "근무 상태",
      width: 120,
      render: (v) => <Status status={v ? "ON" : "OFF"} />,
    },
    { key: "joinedAt", label: "입사일", width: 140 },
  ];

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  return (
    <Wrapper>
      <Header>
        <h2>작업자 관리</h2>
      </Header>

      <FilterBar>
        <FilterGroup>
          <SearchDate onChange={(start, end) => setDateRange({ start, end })} />

          <SelectBar
            width="s"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="근무 상태"
          />

          <SearchBar
            width="l"
            placeholder="사원번호 / 사원명 검색"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </FilterGroup>

        <Button variant="ok" size="m" onClick={openCreate}>
          + 작업자 등록
        </Button>
      </FilterBar>

      <Table
        columns={columns}
        data={sortedData} // 필터링 + 정렬된 데이터를 넣어줌
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={(row) => {
          setSelectedWorker(row);
          setDetailOpen(true);
        }}
      />

      <WorkerCreate
        open={drawer.open}
        mode={drawer.mode}
        initialData={selectedRow}
        onClose={closeDrawer}
        onSuccess={fetchWorkers}
      />

      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkerDetail
          worker={selectedWorker}
          onClose={() => setDetailOpen(false)}
          onEdit={() => {
            setDetailOpen(false);
            setSelectedRow(selectedWorker);
            setDrawer({ open: true, mode: "edit" });
          }}
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

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
