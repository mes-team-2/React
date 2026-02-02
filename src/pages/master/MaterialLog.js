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

  // 날짜 변환 함수
  const toDateOnly = (d) => {
    if (!d) return null;

    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  // 타입 변환 함수
  const convertTypeForServer = (type) => {
    if (type === "IN") return "INBOUND";
    if (type === "USE") return "CONSUME";
    return null;
  };

  // 데이터 가져오기(페이지)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await InventoryAPI2.getMaterialTxList({
          page,
          keyword,
          type: convertTypeForServer(typeFilter),
          ...(dateRange.start && { startDate: toDateOnly(dateRange.start) }),
          ...(dateRange.end && { endDate: toDateOnly(dateRange.end) }),
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

  const [totalSummary, setTotalSummary] = useState({
    inQty: 0,
    outUseQty: 0,
    rate: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await InventoryAPI2.getMaterialTxSummary({
        type: convertTypeForServer(typeFilter),
        startDate: toDateOnly(dateRange.start),
        endDate: toDateOnly(dateRange.end),
        keyword,
      });
      setTotalSummary(res.data);
      console.log("inQty:", res.data?.inQty);
      console.log("outQty:", res.data?.outUseQty);
      console.log("rate:", res.data?.rate);
    };

    fetchSummary();
  }, [keyword, typeFilter, dateRange]);

  // SelectBar 옵션 정의
  const LOG_TYPE_OPTIONS = [
    { value: "ALL", label: "전체 구분" },
    { value: "IN", label: "자재입고" },
    { value: "USE", label: "생산투입" },
  ];

  // 정렬 로직
  const sortedRows = useMemo(() => {
    let sortableItems = [...rows];
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
  }, [rows, sortConfig]);

  //  정렬 핸들러
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDateChange = (start, end) => {
    console.log("start:", start);
    console.log("end:", end);
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

  return (
    <Wrapper>
      <Header>
        <h2>자재 입출고 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<IoArrowBackCircleOutline />}
          label="입고된 자재 수량"
          value={totalSummary.inQty.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<IoArrowForwardCircleOutline />}
          label="생산 투입"
          value={totalSummary.outUseQty.toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiArchive />}
          label="입출고 비율 (투입/입고)"
          value={`${totalSummary.rate}%`}
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
