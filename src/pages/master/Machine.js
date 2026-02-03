import { useEffect, useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SummaryCard from "../../components/SummaryCard";
import Status from "../../components/Status";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import SelectBar from "../../components/SelectBar";
import MachineFormDrawer from "./MachineFormDrawer";
import styled from "styled-components";
import { MachineAPI } from "../../api/AxiosAPI";

import { AlertTriangle, PauseCircle } from "lucide-react";
import { LuHourglass } from "react-icons/lu";
import { FiRefreshCw } from "react-icons/fi";

export default function Machine() {
  const [machines, setMachines] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Detail 제거: detailOpen/selectedMachine 제거
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // "create" | "edit"

  // ✅ active는 프론트에서 boolean으로 통일
  const [form, setForm] = useState({
    machineId: null,
    machineCode: "",
    machineName: "",
    processCode: "",
    active: true,
  });

  /* =========================
     목록 조회
  ========================= */
  const fetchMachines = async () => {
    try {
      const res = await MachineAPI.getList();
      setMachines(res.data);
    } catch (err) {
      console.error("설비 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 5000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     저장(Create/Update) - ✅ MachineAPI 유지
  ========================= */
  const handleSave = async () => {
    if (!form.machineCode || !form.machineName) {
      alert("설비 코드와 설비명은 필수입니다.");
      return;
    }

    try {
      if (formMode === "create") {
        await MachineAPI.create({
          machineCode: form.machineCode,
          machineName: form.machineName,
          processCode: form.processCode,
          active: form.active, // boolean 전송
        });
        alert("설비가 등록되었습니다.");
      } else {
        await MachineAPI.update(form.machineId, {
          machineName: form.machineName,
          processCode: form.processCode,
          active: form.active, // boolean 전송
        });
        alert("수정되었습니다.");
      }

      setFormOpen(false);
      fetchMachines();
    } catch (err) {
      console.error(err);
      alert("저장 실패: " + (err.response?.data || "오류 발생"));
    }
  };

  /* =========================
     필터링 + 정렬 (기존 유지)
  ========================= */
  const filteredAndSortedData = useMemo(() => {
    let result = machines.filter((m) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        (m.machineCode || "").toLowerCase().includes(s) ||
        (m.machineName || "").toLowerCase().includes(s) ||
        (m.processCode || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "all" ? true : m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key] || "");
        const bVal = String(b[sortConfig.key] || "");
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      });
    }
    return result;
  }, [machines, searchTerm, statusFilter, sortConfig]);

  /* =========================
     요약 카드 (기존 유지)
  ========================= */
  const summaryData = useMemo(() => {
    const counts = { WAIT: 0, RUN: 0, ERROR: 0, STOP: 0 };
    machines.forEach((m) => {
      if (counts[m.status] !== undefined) counts[m.status]++;
    });

    return [
      {
        label: "대기중",
        value: counts.WAIT,
        color: "var(--waiting)",
        icon: <LuHourglass />,
      },
      {
        label: "가동중",
        value: counts.RUN,
        color: "var(--run)",
        icon: <FiRefreshCw />,
      },
      {
        label: "불량",
        value: counts.ERROR,
        color: "var(--error)",
        icon: <AlertTriangle />,
      },
      {
        label: "중지",
        value: counts.STOP,
        color: "var(--stop)",
        icon: <PauseCircle />,
      },
    ];
  }, [machines]);

  const errorLogs = useMemo(() => {
    return machines
      .filter((m) => m.status === "ERROR")
      .map((m) => ({ code: `ERROR - ${m.machineCode}`, message: m.errorLog }));
  }, [machines]);

  /* =========================
     테이블 컬럼 (active: YES/NO, boolean 둘 다 대응)
  ========================= */
  const columns = [
    { key: "machineId", label: "ID", width: 50 },
    {
      key: "active",
      label: "사용",
      width: 150,
      render: (value) => {
        // 목록 조회가 "YES"/"NO"로 오든, boolean으로 오든 둘 다 처리
        const isActive = value === true || value === "YES";
        return <Status type="active" status={isActive} />;
      },
    },
    { key: "machineCode", label: "설비 코드", width: 120 },
    { key: "machineName", label: "설비명", width: 180 },
    { key: "processCode", label: "공정 코드", width: 120 },
    {
      key: "status",
      label: "설비상태",
      width: 150,
      render: (value) => (
        <Status type="machine" status={String(value || "").toUpperCase()} />
      ),
    },
    { key: "errorLog", label: "메시지", width: 220 },
  ];

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const openEdit = (row) => {
    setForm({
      machineId: row.machineId,
      machineCode: row.machineCode,
      machineName: row.machineName,
      processCode: row.processCode,
      // "YES"/"NO" → boolean 변환
      active: row.active === true || row.active === "YES",
    });
    setFormMode("edit");
    setFormOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>설비 관리</h2>
      </Header>

      <SummaryGrid>
        {summaryData.map((item) => (
          <SummaryCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </SummaryGrid>

      {/* 에러 로그 */}
      {errorLogs.length > 0 && (
        <ErrorSection>
          {errorLogs.map((log, idx) => (
            <ErrorBox key={idx}>
              <strong>{log.code}</strong>
              <p style={{ marginTop: 4 }}>{log.message}</p>
            </ErrorBox>
          ))}
        </ErrorSection>
      )}

      <FilterBar>
        <FilterGroup>
          <SelectBar
            width="s"
            label="설비 상태"
            options={[
              { value: "all", label: "전체 상태" },
              { value: "RUN", label: "가동 중" },
              { value: "WAIT", label: "대기 중" },
              { value: "ERROR", label: "에러" },
              { value: "STOP", label: "중지" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <SearchBar
            width="l"
            placeholder="설비코드, 설비명, 공정코드로 검색..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </FilterGroup>

        <Button
          variant="ok"
          size="m"
          onClick={() => {
            setForm({
              machineId: null,
              machineCode: "",
              machineName: "",
              processCode: "",
              active: true,
            });
            setFormMode("create");
            setFormOpen(true);
          }}
        >
          + 설비 추가
        </Button>
      </FilterBar>

      <Table
        columns={columns}
        data={filteredAndSortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowClick={openEdit}
      />

      <MachineFormDrawer
        open={formOpen}
        mode={formMode}
        form={form}
        setForm={setForm}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
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
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
`;
const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const ErrorBox = styled.div`
  background: var(--bgError);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: var(--shadow);
  strong {
    font-size: var(--fontSm);
    color: var(--error);
  }
  p {
    font-size: var(--fontXxs);
    margin-top: 4px;
  }
`;
const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
