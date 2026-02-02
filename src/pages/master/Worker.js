import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Status from "../../components/Status";
import Button from "../../components/Button";
import WorkerDetail from "./WorkerDetail";

/* =========================
   작업자 관리 (Worker Master)
   - 그래프 없음
   - 공정/근무상태 컬럼 없음
   - 최소 CRUD: Create / Update / Active(soft)
========================= */
export default function Worker() {
  /* =========================
     state
  ========================= */
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [drawer, setDrawer] = useState({ open: false, mode: null }); // create | edit
  const [form, setForm] = useState({
    id: null,
    workerNo: "",
    name: "",
    position: "작업자",
    line: "라인-1",
    joinedAt: "",
    active: true,
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  /* =========================
     더미 데이터 (기준정보)
  ========================= */
  const [workers, setWorkers] = useState(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i + 1,
      workerNo: `W-2026-${String(i + 1).padStart(3, "0")}`,
      name: i % 3 === 0 ? "김현수" : i % 3 === 1 ? "이준호" : "박민지",
      position: i % 2 === 0 ? "작업자" : "반장",
      joinedAt: "2025/08/01",
      active: i % 7 !== 0, // 일부 비활성 더미
    })),
  );

  /* =========================
     columns (공정/근무상태 제거)
  ========================= */
  const columns = [
    { key: "workerNo", label: "작업자 번호", width: 160 },
    { key: "name", label: "이름", width: 140 },
    { key: "position", label: "직급", width: 120 },
    {
      key: "active",
      label: "근무 여부",
      width: 120,
      render: (v) => (
        <Status
          type={v ? "success" : "default"}
          label={v ? "사용중" : "중지"}
        />
      ),
    },
    { key: "joinedAt", label: "입사일", width: 140 },
  ];

  /* =========================
     sort
  ========================= */
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

      // 문자열 정렬(숫자 포함)
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      // boolean 정렬
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        const aa = aVal ? 1 : 0;
        const bb = bVal ? 1 : 0;
        return sortConfig.direction === "asc" ? aa - bb : bb - aa;
      }

      return 0;
    });
  }, [workers, sortConfig]);

  /* =========================
     drawer controls
  ========================= */
  const openCreate = () => {
    setForm({
      id: null,
      workerNo: "",
      name: "",
      position: "작업자",
      line: "라인-1",
      joinedAt: "2026/02/02",
      active: true,
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
     CRUD (최소)
  ========================= */
  const handleCreate = () => {
    if (!form.workerNo.trim() || !form.name.trim()) return;

    // 중복 코드 방지(프론트 기준)
    const exists = workers.some((w) => w.workerNo === form.workerNo.trim());
    if (exists) return;

    setWorkers((prev) => [
      ...prev,
      {
        ...form,
        id: Date.now(),
        workerNo: form.workerNo.trim(),
        name: form.name.trim(),
      },
    ]);
    closeDrawer();
  };

  const handleUpdate = () => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === form.id
          ? {
              ...w,
              // 수정 허용 범위만 반영
              name: form.name.trim(),
              position: form.position,
              line: form.line,
              active: form.active,
            }
          : w,
      ),
    );
    closeDrawer();
  };

  /* =========================
     render
  ========================= */
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
              <option value="반장">반장</option>
              <option value="관리자">관리자</option>
            </select>
          </Field>

          <Field>
            <label>입사일</label>
            <input value={form.joinedAt} disabled />
          </Field>

          <DrawerFooter>
            <Button variant="cancel" size="m" onClick={closeDrawer}>
              취소
            </Button>

            <Button
              variant="ok"
              size="m"
              onClick={drawer.mode === "create" ? handleCreate : handleUpdate}
              disabled={
                drawer.mode === "create"
                  ? !form.workerNo.trim() || !form.name.trim()
                  : !form.name.trim()
              }
            >
              {drawer.mode === "create" ? "등록" : "수정"}
            </Button>
          </DrawerFooter>

          {/* 안내(기준정보 철학) */}
          {drawer.mode === "edit" && (
            <Hint>
              ※ 작업자 번호/입사일은 기준 정보로 고정입니다. (필요 시 신규 등록
              권장)
            </Hint>
          )}
        </DrawerBody>
      </SideDrawer>
      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkerDetail
          worker={selectedWorker}
          onEdit={() => {
            setDetailOpen(false);
            openEdit(selectedWorker); // 기존 수정 Drawer 재사용
          }}
        />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled-components
========================= */

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

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;

  span {
    font-size: 12px;
    opacity: 0.7;
  }
`;

const MiniStatus = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.$active ? "var(--main)" : "#888")};
`;

const DrawerFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 6px;
  border-top: 1px solid var(--border);
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
  margin-top: 8px;
`;
