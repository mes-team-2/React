import styled from "styled-components";
import { useMemo, useState } from "react";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import MaterialLogDetail from "./MaterialLogDetail";
import SearchDate from "../../components/SearchDate";

import { FiArchive, FiLogIn, FiLogOut } from "react-icons/fi";


const TYPES = {
  IN: "입고",
  OUT: "출고",
  USE: "공정투입",
};

const MATERIAL_LOGS = [
  {
    id: 1,
    occurredAt: "2026-01-20 09:12",
    materialCode: "MAT-LEAD",
    materialName: "납판",
    lotNo: "LOT-202601-001",
    type: "IN",
    qty: 500,
    operator: "WK-101",
  },
  {
    id: 2,
    occurredAt: "2026-01-20 11:40",
    materialCode: "MAT-LEAD",
    materialName: "납판",
    lotNo: "LOT-202601-001",
    type: "USE",
    qty: -120,
    operator: "WK-103",
  },
  {
    id: 3,
    occurredAt: "2026-01-21 14:05",
    materialCode: "MAT-ELEC",
    materialName: "전해액",
    lotNo: "LOT-202601-014",
    type: "IN",
    qty: 1000,
    operator: "WK-102",
  },
  {
    id: 4,
    occurredAt: "2026-01-21 16:30",
    materialCode: "MAT-ELEC",
    materialName: "전해액",
    lotNo: "LOT-202601-014",
    type: "OUT",
    qty: -300,
    operator: "WK-104",
  },
];

export default function MaterialLog() {
  const [rows] = useState(MATERIAL_LOGS);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // 날짜 검색상태

  // 필터 로직 (키워드 + 날짜)
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      // 키워드 검색
      const k = keyword.toLowerCase();
      const matchesKeyword =
        !keyword ||
        r.materialCode.toLowerCase().includes(k) ||
        r.materialName.toLowerCase().includes(k) ||
        r.lotNo.toLowerCase().includes(k);

      // 날짜 검색
      let matchesDate = true;
      if (r.occurredAt) {
        const logDate = new Date(r.occurredAt);
        logDate.setHours(0, 0, 0, 0); // 시간 초기화

        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (logDate < startDate) matchesDate = false;
        }

        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(0, 0, 0, 0);
          if (logDate > endDate) matchesDate = false;
        }
      }

      return matchesKeyword && matchesDate;
    });
  }, [rows, keyword, dateRange]);

  // Summary 계산
  const summary = useMemo(() => {

    const targetData = filtered;

    const total = targetData.length;

    const inQty = targetData
      .filter((r) => r.type === "IN")
      .reduce((a, b) => a + b.qty, 0);

    const outUseQty = targetData
      .filter((r) => r.type !== "IN")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

    return { total, inQty, outUseQty };
  }, [filtered]);

  // 테이블
  const columns = [
    { key: "occurredAt", label: "일시", width: 160 },
    { key: "materialCode", label: "자재코드", width: 140 },
    { key: "materialName", label: "자재명", width: 140 },
    { key: "lotNo", label: "LOT 번호", width: 160 },
    {
      key: "type",
      label: "유형",
      width: 100,
      render: (v) => TYPES[v],
    },
    { key: "qty", label: "수량", width: 100 },
    { key: "operator", label: "작업자", width: 100 },
  ];

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
  };

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>자재 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiArchive />}
          label="자재 이동 이력"
          value={summary.total.toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiLogIn />}
          label="입고된 자재 수량"
          value={summary.inQty.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiLogOut />}
          label="출고 · 공정 투입"
          value={summary.outUseQty.toLocaleString()}
          color="var(--waiting)"
        />
      </SummaryGrid>

      <FilterBar>
        <SearchDate width="m" onChange={handleDateChange} placeholder="일자 검색" />
        <SearchBar
          width="l"
          placeholder="자재명 / 코드 / LOT 검색"
          onChange={setKeyword} // 키워드 상태 업데이트
          onSearch={() => { }}
        />
      </FilterBar>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={filtered}
          selectable={false}
          onRowClick={onRowClick}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && <MaterialLogDetail row={selected} />}
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
`;
