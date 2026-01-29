import { useMemo, useState } from "react";
import styled from "styled-components";

import TableStyle from "../../components/TableStyle";
import Status from "../../components/Status";

/* =========================
   MOCK DATA (process_step)
========================= */
const PROCESS_STEPS = [
  {
    process_step_id: 1,
    step_code: "PROC-01",
    step_name: "전극공정",
    seq: 1,
    is_active: true,
  },
  {
    process_step_id: 2,
    step_code: "PROC-02",
    step_name: "조립공정",
    seq: 2,
    is_active: true,
  },
  {
    process_step_id: 3,
    step_code: "PROC-03",
    step_name: "활성화공정",
    seq: 3,
    is_active: true,
  },
  {
    process_step_id: 4,
    step_code: "PROC-04",
    step_name: "팩공정",
    seq: 4,
    is_active: true,
  },
  {
    process_step_id: 5,
    step_code: "PROC-05",
    step_name: "최종 검사",
    seq: 5,
    is_active: true,
  },
];

export default function Process() {
  /* =========================
     sort state
  ========================= */
  const [sortConfig, setSortConfig] = useState({
    key: "seq",
    direction: "asc", // asc | desc
  });

  /* =========================
     useMemo: sorted data
  ========================= */
  const sortedData = useMemo(() => {
    const data = [...PROCESS_STEPS];

    if (!sortConfig.key) return data;

    return data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  /* =========================
     column click handler
  ========================= */
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  /* =========================
     Table Columns
  ========================= */
  const columns = [
    {
      key: "seq",
      label: "공정 순서",
      width: 120,
      sortable: true,
      onSort: () => handleSort("seq"),
    },
    {
      key: "step_code",
      label: "공정 코드",
      width: 160,
      sortable: true,
      onSort: () => handleSort("step_code"),
    },
    {
      key: "step_name",
      label: "공정명",
      sortable: true,
      onSort: () => handleSort("step_name"),
    },
    {
      key: "is_active",
      label: "상태",
      width: 140,
      sortable: true,
      onSort: () => handleSort("is_active"),
      render: (v) => <Status value={v ? "ACTIVE" : "INACTIVE"} />,
    },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>공정 정보 (Master Data)</h2>
        <Desc>생산 흐름의 기준이 되는 공정 단계 정의 정보입니다.</Desc>
      </Header>

      <TableStyle columns={columns} data={sortedData} />
    </Wrapper>
  );
}

/* =========================
   styles
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 {
    margin: 0;
  }
`;

const Desc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
`;
