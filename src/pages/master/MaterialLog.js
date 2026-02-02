import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import MaterialLogDetail from "./MaterialLogDetail";
import SearchDate from "../../components/SearchDate";
import Status from "../../components/Status";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";

import { FiArchive } from "react-icons/fi";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

// const MATERIAL_LOGS = [
//   {
//     id: 1,
//     occurredAt: "2026-01-20 09:12",
//     materialCode: "MAT-LEAD",
//     materialName: "납판",
//     lotNo: "LOT-202601-001",
//     type: "IN",
//     qty: 500,
//     remainQty: 500,
//     unit: "EA",
//     fromLocation: "협력사(ABC메탈)",
//     toLocation: "자재창고 A-01",
//     operator: "WK-101",
//     note: "정기 입고",
//   },
//   {
//     id: 2,
//     occurredAt: "2026-01-20 11:40",
//     materialCode: "MAT-LEAD",
//     materialName: "납판",
//     lotNo: "LOT-202601-001",
//     type: "USE",
//     qty: -120,
//     remainQty: 380,
//     unit: "EA",
//     fromLocation: "자재창고 A-01",
//     toLocation: "생산 1라인",
//     operator: "WK-103",
//     note: "",
//   },
//   {
//     id: 3,
//     occurredAt: "2026-01-21 14:05",
//     materialCode: "MAT-ELEC",
//     materialName: "전해액",
//     lotNo: "LOT-202601-014",
//     type: "IN",
//     qty: 1000,
//     remainQty: 1000,
//     unit: "L",
//     fromLocation: "협력사(케미칼X)",
//     operator: "WK-104",
//     toLocation: "위험물 창고 B-02",
//     note: "",
//   },
//   {
//     id: 4,
//     occurredAt: "2026-01-21 16:30",
//     materialCode: "MAT-ELEC",
//     materialName: "전해액",
//     lotNo: "LOT-202601-014",
//     type: "USE",
//     qty: -300,
//     remainQty: 700,
//     unit: "L",
//     fromLocation: "위험물 창고 B-02",
//     toLocation: "생산 2라인",
//     operator: "WK-104",
//     note: "",
//   },
//   // ... (데이터 부족 시 페이지네이션 확인용 더미 데이터 추가)
//   ...Array.from({ length: 20 }).map((_, i) => ({
//     id: i + 10,
//     occurredAt: `2026-01-${22 + (i % 5)} 10:00`,
//     materialCode: "MAT-TEST",
//     materialName: "테스트 자재",
//     lotNo: `LOT-202601-${String(i + 20).padStart(3, '0')}`,
//     type: i % 2 === 0 ? "IN" : "USE",
//     qty: i % 2 === 0 ? 100 : -50,
//     remainQty: 100,
//     unit: "EA",
//     fromLocation: "창고",
//     toLocation: "라인",
//     operator: "WK-TEST",
//     note: "",
//   })),
// ];

export default function MaterialLog() {
  // 데이터 관리
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // 날짜 검색상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // 테이블 정렬 상태 관리
  // 입출고 유형 필터 상태
  const [typeFilter, setTypeFilter] = useState("ALL");

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await InventoryAPI2.getMaterialTxList({
          page,
          keyword,
          type: typeFilter === "ALL" ? null : typeFilter,
          ...(dateRange.start && { startDate: dateRange.start }),
          ...(dateRange.end && { endDate: dateRange.end }),
        });
        const data = res.data;

        console.log(
          "전체 txType들:",
          data.content.map((i) => i.txType),
        );

        setRows(
          data.content.map((item, idx) => ({
            id: `${item.txTime}-${idx}`,
            occurredAt: item.txTime?.replace(" ", "T"),
            type:
              item.txType?.trim().toUpperCase() === "INBOUND" ? "IN" : "USE",
            materialName: item.materialName,
            lotNo: item.materialNo,
            qty: Number(item.qty),
            unit: item.unit,
            materialCode: "-",
            fromLocation: "-",
            toLocation: "-",
            operator: "-",
          })),
        );

        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, keyword, typeFilter, dateRange]);

  // 데이터 필터 조작

  // SelectBar 옵션 정의
  const LOG_TYPE_OPTIONS = [
    { value: "ALL", label: "전체 구분" },
    { value: "IN", label: "자재입고" },
    { value: "USE", label: "생산투입" },
  ];

  // 필터 로직 (키워드 + 날짜 + 유형)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const k = keyword.toLowerCase();

      // 키워드
      const matchesKeyword =
        !keyword ||
        (r.materialCode || "").toLowerCase().includes(k) ||
        (r.materialName || "").toLowerCase().includes(k) ||
        (r.lotNo || "").toLowerCase().includes(k);

      // 날짜
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

      // 타입
      const matchesType = typeFilter === "ALL" || r.type === typeFilter;

      return matchesKeyword && matchesDate && matchesType;
    });
  }, [rows, keyword, dateRange, typeFilter]);

  // 정렬 로직
  const sortedRows = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
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

  const summary = useMemo(() => {
    // 현재 검색 결과(filtered) 기준으로 통계를 냄
    const targetData = filtered;
    const total = targetData.length;

    const inQty = targetData
      .filter((r) => r.type === "IN")
      .reduce((a, b) => a + b.qty, 0);

    const outUseQty = targetData
      .filter((r) => r.type !== "IN")
      .reduce((a, b) => a + Math.abs(b.qty), 0);

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
    setPage(0);
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(0);
  };

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  // 각 컬럼 설정
  const columns = [
    { key: "occurredAt", label: "일시", width: 150 },
    {
      key: "type",
      label: "구분",
      width: 150,
      render: (value) => {
        const statusKey = value === "IN" ? "MATIN" : "MATOUT";
        return <Status status={statusKey} type="basic" />;
      },
    },
    { key: "materialName", label: "자재명", width: 130 },
    { key: "lotNo", label: "LOT 번호", width: 150 },
    {
      key: "qty",
      label: "이동수량",
      width: 90,
      render: (val) => (
        <QtyText $isPositive={val > 0}>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </QtyText>
      ),
    },

    { key: "unit", label: "단위", width: 60 },
    { key: "fromLocation", label: "출발지 (From)", width: 140 },
    { key: "toLocation", label: "도착지 (To)", width: 140 },

    { key: "operator", label: "작업자", width: 90 },
  ];

  console.log("rows:", rows.length);
  console.log("filtered:", filtered.length);
  console.log("sortedRows:", sortedRows.length);
  console.log(rows.map((r) => `[${r.type}]`));
  console.log("typeFilter:", typeFilter);
  console.log("keyword:", `[${keyword}]`);
  console.log("dateRange:", dateRange);

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
          label="생산 투입"
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
        <SearchDate
          width="m"
          onChange={handleDateChange}
          placeholder="일자 검색"
        />
        <SelectBar
          width="140px"
          options={LOG_TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          placeholder="구분 선택"
        />
        <SearchBar
          width="l"
          placeholder="자재명 / 코드 / LOT 검색"
          onChange={setKeyword} // 키워드 상태 업데이트
          onSearch={() => {}}
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
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && <MaterialLogDetail row={selected} />}
      </SideDrawer>
    </Wrapper>
  );
}

// 스타일
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
  color: ${(props) => (props.$isPositive ? "var(--main)" : "var(--error)")};
`;
