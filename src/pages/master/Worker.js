import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Status from "../../components/Status";
import Button from "../../components/Button";
import WorkerDetail from "./WorkerDetail";
import { WorkerAPI } from "../../api/AxiosAPI";

export default function Worker() {
  const [workers, setWorkers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  /* =========================
     Drawer Controls
  ========================= */
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

  /* =========================
     CRUD
  ========================= */
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

  /* =========================
     Table Logic
  ========================= */
  const columns = [
    { key: "workerNo", label: "사원 번호", width: 160 },
    { key: "name", label: "이름", width: 140 },
    { key: "position", label: "직급", width: 120 },
    {
      key: "active",
      label: "근무 상태", // [수정] 재직 여부 -> 근무 상태
      width: 120,
      render: (v) => (
        // [핵심] active가 true면 ON(출근), false면 OFF(퇴근)
        <Status status={v ? "ON" : "OFF"} />
      ),
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

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return workers;
    return [...workers].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return 0;
    });
  }, [workers, sortConfig]);

  return (
    <Wrapper>
      <Header>
        <h2>작업자 관리</h2>
        <Button variant="ok" size="m" onClick={openCreate}>
          + 작업자 등록
        </Button>
      </Header>

      <Table
        columns={columns}
        data={sortedData}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }
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
