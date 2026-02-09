import styled from "styled-components";
import { useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import SelectBar from "../../components/SelectBar";
import ProcessDrawer from "./ProcessDrawer";
import { ProcessAPI } from "../../api/AxiosAPI";

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "ACTIVE", label: "사용중" },
  { value: "INACTIVE", label: "중지" },
];

export default function Process() {
  const [processes, setProcesses] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

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

  // 프론트엔드 필터링 로직 (검색어 + 상태필터)
  const filteredProcesses = processes.filter((item) => {
    // 키워드 검색 (공정코드 or 공정명)
    const matchesKeyword =
      item.processName.toLowerCase().includes(keyword.toLowerCase()) ||
      item.processCode.toLowerCase().includes(keyword.toLowerCase());

    // 상태 필터 (SelectBar)
    let matchesType = true;
    if (typeFilter === "ACTIVE") matchesType = item.active === true;
    if (typeFilter === "INACTIVE") matchesType = item.active === false;

    return matchesKeyword && matchesType;
  });

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
      // true면 ACTIVE(사용중), false면 INACTIVE(중지) 상태 전달
      render: (v) => <Status status={v ? "ACTIVE" : "INACTIVE"} />,
    },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>공정 관리</h2>
      </Header>

      <FilterBar>
        <FilterGroup>
          <SelectBar
            width="s"
            options={STATUS_OPTIONS}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1); // 페이지 초기화
            }}
            placeholder="상태 선택"
          />
          <SearchBar
            width="l"
            placeholder="공정명 / 코드 검색"
            onChange={setKeyword}
            onSearch={(val) => {
              setKeyword(val);
              setPage(1);
            }}
          />
        </FilterGroup>
        <Button variant="ok" size="m" onClick={openCreate}>
          + 공정 등록
        </Button>
      </FilterBar>

      <Table
        columns={columns}
        data={filteredProcesses}
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
