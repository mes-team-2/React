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
import { WorkerAPI } from "../../api/AxiosAPI";

export default function Worker() {
  const [workers, setWorkers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const [drawer, setDrawer] = useState({ open: false, mode: null });
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

  const openEdit = (row) => {
    setForm(row);
    setDrawer({ open: true, mode: "edit" });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, mode: null });
  };

  const handleCreate = async () => {
    if (!form.workerNo.trim() || !form.name.trim()) return;
    try {
      await WorkerAPI.create({
        workerNo: form.workerNo,
        name: form.name,
        position: form.position,
      });
      alert("등록되었습니다.");
      closeDrawer();
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  const handleUpdate = async () => {
    try {
      await WorkerAPI.update(form.id, {
        name: form.name,
        position: form.position,
        active: form.active,
      });
      alert("수정되었습니다.");
      closeDrawer();
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
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
            width="140px"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="근무 상태"
          />

          <SearchBar
            width="280px"
            placeholder="사원번호 또는 이름을 입력하세요"
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

      <SideDrawer open={drawer.open} width={360} onClose={closeDrawer}>
        <DrawerBody>
          <DrawerTitle>
            {drawer.mode === "create" ? "작업자 등록" : "작업자 수정"}
          </DrawerTitle>

          <Field>
            <label>작업자 번호</label>
            <input
              value={form.workerNo}
              disabled={drawer.mode === "edit"}
              onChange={(e) =>
                setForm((p) => ({ ...p, workerNo: e.target.value }))
              }
              placeholder="예: OP-001"
            />
          </Field>

          <Field>
            <label>이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>

          <Field>
            <label>직급</label>
            <select
              value={form.position}
              onChange={(e) =>
                setForm((p) => ({ ...p, position: e.target.value }))
              }
            >
              <option value="작업자">작업자</option>
              <option value="관리자">관리자</option>
            </select>
          </Field>

          <Field>
            <label>입사일</label>
            <input value={form.joinedAt} disabled placeholder="자동 생성됨" />
          </Field>

          <DrawerFooter>
            <Button variant="cancel" size="m" onClick={closeDrawer}>
              취소
            </Button>
            <Button
              variant="ok"
              size="m"
              onClick={drawer.mode === "create" ? handleCreate : handleUpdate}
            >
              {drawer.mode === "create" ? "등록" : "수정"}
            </Button>
          </DrawerFooter>
        </DrawerBody>
      </SideDrawer>

      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkerDetail
          worker={selectedWorker}
          onClose={() => setDetailOpen(false)}
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

const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 6px;
`;
const DrawerTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: 12px;
    opacity: 0.7;
  }
  input,
  select {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: white;
  }
  input:disabled {
    opacity: 0.7;
    background: var(--background2);
  }
`;
const DrawerFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 6px;
  border-top: 1px solid var(--border);
`;
