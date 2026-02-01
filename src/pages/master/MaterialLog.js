import styled from "styled-components";
import { useMemo, useState } from "react";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import MaterialLogDetail from "./MaterialLogDetail";
import SearchDate from "../../components/SearchDate";
import Status from "../../components/Status";
import Pagination from "../../components/Pagination";
import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";

import { FiArchive, FiLogIn, FiLogOut, FiPieChart } from "react-icons/fi";

const MATERIAL_LOGS = [
  {
    id: 1,
    occurredAt: "2026-01-20 09:12",
    materialCode: "MAT-LEAD",
    materialName: "납판",
    lotNo: "LOT-202601-001",
    type: "IN",
    qty: 500,
    remainQty: 500,
    unit: "EA",
    fromLocation: "협력사(ABC메탈)",
    toLocation: "자재창고 A-01",
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
    remainQty: 380,
    unit: "EA",
    fromLocation: "자재창고 A-01",
    toLocation: "생산 1라인",
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
    operator: "WK-104",
    toLocation: "위험물 창고 B-02",
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
    operator: "WK-104",
    note: "",
  },
  // ... (데이터 부족 시 페이지네이션 확인용 더미 데이터 추가)
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: i + 10,
    occurredAt: `2026-01-${22 + (i % 5)} 10:00`,
    materialCode: "MAT-TEST",
    materialName: "테스트 자재",
    lotNo: `LOT-202601-${String(i + 20).padStart(3, '0')}`,
    type: i % 2 === 0 ? "IN" : "USE",
    qty: i % 2 === 0 ? 100 : -50,
    remainQty: 100,
    unit: "EA",
    fromLocation: "창고",
    toLocation: "라인",
    operator: "WK-TEST",
    note: "",
  })),
];

export default function MaterialLog() {
  const [rows] = useState(MATERIAL_LOGS);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // 날짜 검색상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // 테이블 정렬 상태 관리
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 한 페이지당 20개

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

  // 정렬 로직 (필터링된 데이터를 정렬)
  const sortedRows = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // 숫자일 경우 비교 처리 (문자열 숫자가 있다면 Number() 변환 필요)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          // 그대로 비교
        } else {
          // 문자열 비교
          aValue = String(aValue);
          bValue = String(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  // 데이터 슬라이싱 (현재 페이지 데이터만 추출)
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedRows.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRows, page]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  // Summary 계산
  const summary = useMemo(() => {
    const targetData = filtered;
    const total = targetData.length;

    // 입고 수량
    const inQty = targetData
      .filter((r) => r.type === "IN")
      .reduce((a, b) => a + b.qty, 0);

    // 출고/투입 수량
    const outUseQty = targetData
      .filter((r) => r.type !== "IN")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

    // [계산] 입출고 비율 (투입 / 입고 * 100)
    // 입고가 0일 경우 0% 처리하여 에러 방지
    const rate = inQty === 0 ? 0 : ((outUseQty / inQty) * 100).toFixed(1);

    return { total, inQty, outUseQty, rate };
  }, [filtered]);

  //  정렬 핸들러
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 필터 변경 시 페이지 리셋
  const handleKeywordChange = (v) => {
    setKeyword(v);
    setPage(1);
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(1);
  };

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };


  const columns = [
    { key: "occurredAt", label: "일시", width: 150 },
    {
      key: "type",
      label: "구분",
      width: 150,
      render: (value) => {

        const statusKey = value === "IN" ? "MATIN" : "MATOUT";
        return <Status status={statusKey} type="basic" />;
      }
    },
    { key: "materialName", label: "자재명", width: 130 },
    { key: "lotNo", label: "LOT 번호", width: 150 },
    {
      key: "qty", label: "이동수량", width: 90, render: (val) => (
        <QtyText $isPositive={val > 0}>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </QtyText>
      )
    },

    { key: "unit", label: "단위", width: 60 },
    { key: "fromLocation", label: "출발지 (From)", width: 140 },
    { key: "toLocation", label: "도착지 (To)", width: 140 },

    { key: "operator", label: "작업자", width: 90 },
  ];



  return (
    <Wrapper>
      <Header>
        <h2>자재 입출고 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<IoArrowBackCircleOutline />}
          label="입고된 자재 수량"
          value={summary.inQty.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<IoArrowForwardCircleOutline />}
          label="공정 투입"
          value={summary.outUseQty.toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiArchive />}
          label="입출고 비율 (투입/입고)"
          value={`${summary.rate}%`}
          color="var(--main)"
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
          data={paginatedData}
          selectable={false}
          onRowClick={onRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
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
  gap: 20px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const QtyText = styled.span`
  font-weight: var(--bold);
  color: ${props => props.$isPositive ? 'var(--main)' : 'var(--error)'};
`;