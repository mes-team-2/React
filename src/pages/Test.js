import styled from "styled-components";
import { useMemo, useState } from "react";
import TableStyle from "../components/TableStyle";
import SearchBar from "../components/SearchBar";
import SearchDate from "../components/SearchDate";
import SideDrawer from "../components/SideDrawer";
import SummaryCard from "../components/SummaryCard";
import MaterialLogDetail from "./master/MaterialLogDetail";

// 아이콘 변경 (직관성 강화)
import { FiArrowDownCircle, FiArrowUpCircle, FiAlertCircle } from "react-icons/fi";

const TYPES = {
  IN: "입고",
  USE: "공정투입",
  OUT: "기타출고",
  RETURN: "반품",
};

// [개선] 현업 필수 필드 추가 (위치, 잔량, 작업지시서, 단위)
const MATERIAL_LOGS = [
  {
    id: 1,
    occurredAt: "2026-01-20 09:12",
    materialCode: "MAT-LEAD",
    materialName: "납판",
    lotNo: "LOT-202601-001",
    type: "IN",
    qty: 500,
    remainQty: 500, // 잔량
    unit: "EA",
    fromLocation: "협력사(ABC메탈)", // 출발지
    toLocation: "자재창고 A-01",     // 도착지
    workOrderNo: "-",              // 입고라 없음
    operator: "WK-101",
    note: "정기 입고",
  },
  {
    id: 2,
    occurredAt: "2026-01-20 11:40",
    materialCode: "MAT-LEAD",
    materialName: "납판",
    lotNo: "LOT-202601-001",
    type: "USE",
    qty: -120,
    remainQty: 380, // 500 - 120
    unit: "EA",
    fromLocation: "자재창고 A-01",
    toLocation: "생산 1라인",
    workOrderNo: "WO-202601-005", // [중요] 어떤 작업지시에 투입됐는지
    operator: "WK-103",
    note: "",
  },
  {
    id: 3,
    occurredAt: "2026-01-21 14:05",
    materialCode: "MAT-ELEC",
    materialName: "전해액",
    lotNo: "LOT-202601-014",
    type: "IN",
    qty: 1000,
    remainQty: 1000,
    unit: "L",
    fromLocation: "협력사(케미칼X)",
    toLocation: "위험물 창고 B-02",
    workOrderNo: "-",
    operator: "WK-102",
    note: "",
  },
  {
    id: 4,
    occurredAt: "2026-01-21 16:30",
    materialCode: "MAT-ELEC",
    materialName: "전해액",
    lotNo: "LOT-202601-014",
    type: "USE",
    qty: -300,
    remainQty: 700,
    unit: "L",
    fromLocation: "위험물 창고 B-02",
    toLocation: "생산 2라인",
    workOrderNo: "WO-202601-008",
    operator: "WK-104",
    note: "",
  },
];

export default function Test() {
  const [rows] = useState(MATERIAL_LOGS);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 필터 로직
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const k = keyword.toLowerCase();
      const matchesKeyword =
        !keyword ||
        r.materialCode.toLowerCase().includes(k) ||
        r.materialName.toLowerCase().includes(k) ||
        r.lotNo.toLowerCase().includes(k) ||
        r.workOrderNo.toLowerCase().includes(k); // 작업지시 번호 검색 추가

      let matchesDate = true;
      if (r.occurredAt) {
        const logDate = new Date(r.occurredAt);
        logDate.setHours(0, 0, 0, 0);

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

  // 정렬 로직
  const sortedRows = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          // 숫자 비교
        } else {
          aValue = String(aValue);
          bValue = String(bValue);
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  // [개선] Summary 계산 (입고량 vs 사용량 vs 기타)
  const summary = useMemo(() => {
    const targetData = filtered;

    // 입고 수량 (양수)
    const inQty = targetData
      .filter((r) => r.type === "IN")
      .reduce((a, b) => a + b.qty, 0);

    // 공정 투입 수량 (음수 -> 양수 변환)
    const useQty = targetData
      .filter((r) => r.type === "USE")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

    // 기타/반품 수량
    const etcQty = targetData
      .filter((r) => r.type !== "IN" && r.type !== "USE")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

    return { inQty, useQty, etcQty };
  }, [filtered]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // [개선] 테이블 컬럼 확장
  const columns = [
    { key: "occurredAt", label: "일시", width: 150 },
    {
      key: "type",
      label: "구분",
      width: 90,
      render: (v) => <TypeBadge $type={v}>{TYPES[v]}</TypeBadge>
    },
    { key: "materialName", label: "자재명", width: 130 },
    { key: "lotNo", label: "LOT 번호", width: 150 },
    { key: "qty", label: "이동수량", width: 90, render: (v) => v.toLocaleString() },
    { key: "unit", label: "단위", width: 60 },
    { key: "fromLocation", label: "출발지 (From)", width: 140 }, // 추가
    { key: "toLocation", label: "도착지 (To)", width: 140 },     // 추가
    { key: "workOrderNo", label: "작업지시서", width: 140 },     // 추가
    { key: "operator", label: "작업자", width: 90 },
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
        <h2>자재 입출고 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiArrowDownCircle />}
          label="총 입고 수량"
          value={summary.inQty.toLocaleString()}
          color="var(--run)" // 초록 계열 (긍정/증가)
        />
        <SummaryCard
          icon={<FiArrowUpCircle />}
          label="총 공정 투입"
          value={summary.useQty.toLocaleString()}
          color="var(--main)" // 파랑 계열 (중립/활동)
        />
        <SummaryCard
          icon={<FiAlertCircle />}
          label="반품 / 기타 출고"
          value={summary.etcQty.toLocaleString()}
          color="var(--error)" // 빨강 계열 (주의/감소)
        />
      </SummaryGrid>

      <FilterBar>
        <SearchDate width="m" onChange={handleDateChange} placeholder="일자 검색" />
        <SearchBar
          width="l"
          placeholder="자재명 / LOT / 작업지시번호"
          onChange={setKeyword}
          onSearch={() => { }}
        />
      </FilterBar>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={sortedRows}
          selectable={false}
          onRowClick={onRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && <MaterialLogDetail row={selected} />}
      </SideDrawer>
    </Wrapper>
  );
}

// ... 스타일 컴포넌트 ... (기존과 동일)
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Header = styled.div`
  h2 { font-size: var(--fontHd); font-weight: var(--bold); }
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;
const FilterBar = styled.div`
  display: flex; align-items: center; gap: 10px;
`;
const TableWrap = styled.div`
  width: 100%; overflow-x: auto;
`;

// [추가] 구분 뱃지 스타일
const TypeBadge = styled.span`
  font-weight: bold;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  color: ${props => props.$type === 'IN' ? 'var(--run)' : props.$type === 'USE' ? 'var(--main)' : 'var(--font2)'};
  background: ${props => props.$type === 'IN' ? 'var(--bgRun)' : props.$type === 'USE' ? 'var(--bgMain)' : '#eee'};
`;