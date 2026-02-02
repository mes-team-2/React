import styled from "styled-components";
import { useState } from "react";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import Button from "../../components/Button";
import ProcessDrawer from "./ProcessDrawer";

/* =========================
   공정 기준 관리 (Process Master)
========================= */
export default function Process() {
  const [processes, setProcesses] = useState([
    {
      processId: 1,
      seq: 1,
      processCode: "PROC-01",
      processName: "전극 공정",
      active: true,
    },
    {
      processId: 2,
      seq: 2,
      processCode: "PROC-02",
      processName: "조립 공정",
      active: true,
    },
    {
      processId: 3,
      seq: 3,
      processCode: "PROC-03",
      processName: "활성화 공정",
      active: true,
    },
    {
      processId: 4,
      seq: 4,
      processCode: "PROC-04",
      processName: "팩 공정",
      active: true,
    },
    {
      processId: 5,
      seq: 5,
      processCode: "PROC-05",
      processName: "최종 검사",
      active: true,
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null); // create | edit

  const [form, setForm] = useState({
    processId: null,
    seq: "",
    processCode: "",
    processName: "",
    active: true,
  });

  /* =========================
     Drawer 제어
  ========================= */
  const openCreate = () => {
    setForm({
      processId: null,
      seq: "",
      processCode: "",
      processName: "",
      active: true,
    });
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setForm(row);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
  };

  /* =========================
     CRUD
  ========================= */
  const handleCreate = () => {
    setProcesses((prev) => [
      ...prev,
      {
        ...form,
        processId: Date.now(),
        seq: Number(form.seq),
      },
    ]);
    closeDrawer();
  };

  const handleUpdate = () => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.processId === form.processId
          ? {
              ...p,
              processName: form.processName,
              active: form.active,
            }
          : p,
      ),
    );
    closeDrawer();
  };

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "seq", label: "순서", width: 80 },
    { key: "processCode", label: "공정 코드", width: 140 },
    { key: "processName", label: "공정명", width: 220 },
    {
      key: "active",
      label: "상태",
      width: 120,
      render: (v) => (
        <Status
          type={v ? "success" : "default"}
          label={v ? "사용중" : "중지"}
        />
      ),
    },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>공정 기준 관리</h2>
        <Button variant="ok" size="m" onClick={openCreate}>
          + 공정 등록
        </Button>
      </Header>

      <Table
        columns={columns}
        data={[...processes].sort((a, b) => a.seq - b.seq)}
        onRowClick={openEdit}
        selectable={false}
      />

      <ProcessDrawer
        open={drawerOpen}
        mode={drawerMode}
        form={form}
        setForm={setForm}
        onClose={closeDrawer}
        onSubmit={drawerMode === "create" ? handleCreate : handleUpdate}
      />
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }
`;
