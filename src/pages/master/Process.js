import styled from "styled-components";
import { useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import Button from "../../components/Button";
import ProcessDrawer from "./ProcessDrawer";
import { ProcessAPI } from "../../api/AxiosAPI";

export default function Process() {
  const [processes, setProcesses] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null);

  const [form, setForm] = useState({
    processId: null,
    seq: "",
    processCode: "",
    processName: "",
    active: true,
  });

  const fetchProcesses = async () => {
    try {
      const res = await ProcessAPI.getList();
      setProcesses(res.data);
    } catch (err) {
      console.error("공정 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

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
  const handleCreate = async () => {
    try {
      await ProcessAPI.create({
        seq: Number(form.seq),
        processCode: form.processCode,
        processName: form.processName,
        active: form.active,
      });
      alert("공정이 등록되었습니다.");
      closeDrawer();
      fetchProcesses();
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  const handleUpdate = async () => {
    try {
      await ProcessAPI.update(form.processId, {
        processName: form.processName,
        active: form.active,
      });
      alert("수정되었습니다.");
      closeDrawer();
      fetchProcesses();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  const columns = [
    { key: "seq", label: "순서", width: 80 },
    { key: "processCode", label: "공정 코드", width: 140 },
    { key: "processName", label: "공정명", width: 220 },
    {
      key: "active",
      label: "상태",
      width: 120,
      // [수정] true면 ACTIVE(사용중), false면 INACTIVE(중지) 상태 전달
      render: (v) => <Status status={v ? "ACTIVE" : "INACTIVE"} />,
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
        data={processes}
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
