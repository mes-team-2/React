import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import SummaryCard from "../../components/SummaryCard";
import SearchBar from "../../components/SearchBar";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import TraceabilityDetail from "./TraceabilityDetail";
import Pagination from "../../components/Pagination";
import SearchDate from "../../components/SearchDate";
import { LogAPI2 } from "../../api/AxiosAPI2";

import {
  FiSearch,
  FiLink,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiClipboard,
} from "react-icons/fi";
import SelectBar from "../../components/SelectBar";

const processOptions = [
  { value: "ALL", label: "전체 공정" },

  { value: "PROC-010", label: "전극공정(Electrode)" },
  { value: "PROC-020", label: "조립공정(Assembly)" },
  { value: "PROC-030", label: "활성화공정(Formation)" },
  { value: "PROC-040", label: "팩공정(Pack)" },
  { value: "PROC-050", label: "검사공정(Inspection)" },
  { value: "PROC-060", label: "포장공정(Packaging)" },
];

const machineOptions = [
  { value: "ALL", label: "전체 설비" },

  { value: "MAC-A-01", label: "Electrode M/C #1" },
  { value: "MAC-A-02", label: "Assembly Line #1" },
  { value: "MAC-A-03", label: "Formation Sys #1" },
  { value: "MAC-A-04", label: "Pack Line #1" },
  { value: "MAC-A-05", label: "Inspector #1" },

  { value: "MAC-B-01", label: "Electrode M/C #2" },
  { value: "MAC-B-02", label: "Assembly Line #2" },
  { value: "MAC-B-03", label: "Formation Sys #2" },
  { value: "MAC-B-04", label: "Pack Line #2" },
  { value: "MAC-B-05", label: "Inspector #2" },
];

const materialOptions = [
  { value: "ALL", label: "전체 자재" },

  { value: "납(Pb)", label: "납(Pb)" },
  { value: "양극판", label: "양극판" },
  { value: "음극판", label: "음극판" },
  { value: "분리판", label: "분리판" },
  { value: "전해액", label: "전해액" },
  { value: "케이스", label: "케이스" },
  { value: "커버", label: "커버" },
  { value: "단자", label: "단자" },
  { value: "라벨", label: "라벨" },
  { value: "포장지", label: "포장지" },
];

const formatDateOnly = (dateTime) => {
  if (!dateTime) return "";

  const d = new Date(dateTime);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const toLocalDateTime = (date, isEnd = false) => {
  if (!date) return null;

  const d = new Date(date);

  if (isEnd) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
};

export default function Traceability() {
  // const [rows] = useState(() => makeTraceRows());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [materialFilter, setMaterialFilter] = useState("ALL");
  const [processFilter, setProcessFilter] = useState("ALL");
  const [machineFilter, setMachineFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // 🔹 pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 🔹 sorting (핵심)
  const [sortKey, setSortKey] = useState("testedAt");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  const [summary, setSummary] = useState({
    total: 0,
    ok: 0,
    ng: 0,
    lotCnt: 0,
    linkCnt: 0,
  });

  const buildParams = () => {
    const params = {
      page: page - 1, // 백엔드 0부터면
      sort: `${sortKey},${sortOrder}`,
    };

    if (keyword.trim()) params.keyword = keyword.trim();
    if (materialFilter !== "ALL") params.material = materialFilter;
    if (processFilter !== "ALL") params.process = processFilter;
    if (machineFilter !== "ALL") params.machine = machineFilter;
    if (startDate) params.start = toLocalDateTime(startDate);
    if (endDate) params.end = toLocalDateTime(endDate, true);

    return params;
  };

  // 목록용 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = buildParams();

        const res = await LogAPI2.getTraceLogs(params);
        console.log("🔥 trace useEffect 실행");
        // 백엔드 Page 응답 기준
        setRows(res.data.content);
        setTotalPages(res.data.totalPages);

        // totalPages를 서버에서 내려주면 여기서 setTotalPages
        // setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("traceability 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    keyword,
    materialFilter,
    processFilter,
    machineFilter,
    page,
    sortKey,
    sortOrder,
    startDate,
    endDate,
  ]);

  // 합계용 호출
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = buildParams();

        // ❗ summary는 page/sort 제거
        delete params.page;
        delete params.sort;

        const res = await LogAPI2.getTraceSummaryLogs(params);

        setSummary(res.data);
      } catch (err) {
        console.error("summary 조회 실패", err);
      }
    };

    fetchSummary();
  }, [
    keyword,
    materialFilter,
    processFilter,
    machineFilter,
    startDate,
    endDate,
  ]);

  /* =========================
     HANDLERS
  ========================= */
  const handleSort = (key) => {
    setPage(1);
    setSortOrder((prev) =>
      sortKey === key && prev === "asc" ? "desc" : "asc",
    );
    setSortKey(key);
  };

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  const columns = [
    { key: "lot", label: "LOT", width: 150 },
    { key: "productName", label: "제품", width: 120 },
    {
      key: "testedAt",
      label: "생산일",
      width: 150,
      render: (v) => formatDateOnly(v),
    },
    { key: "totalQty", label: "총수량", width: 100 },
    { key: "goodQty", label: "양품", width: 90 },
    { key: "badQty", label: "불량", width: 90 },
    { key: "yieldRate", label: "수율(%)", width: 90 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>Traceability 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiLayers />}
          label="LOT 수"
          value={summary.countLot}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiClipboard />}
          label="총 수량 합계"
          value={summary.allQty}
          color="var(--stop)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="OK"
          value={summary.allGoodQty}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="NG"
          value={summary.allBadQty}
          color="var(--error)"
        />
      </SummaryGrid>

      <FilterBar>
        <SearchDate
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            setPage(1);
          }}
          placeholder="날짜 선택"
        />
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={(v) => {
              setKeyword(v);
              setPage(1);
            }}
            placeholder="LOT / 작업지시 / 자재 LOT / 제품명 검색"
          />
        </SearchWrap>

        <SelectBar
          width="m"
          options={machineOptions}
          value={machineFilter}
          onChange={(e) => {
            setMachineFilter(e.target.value);
            setPage(1);
          }}
          placeholder="설비 선택"
        />
        <SelectBar
          width="m"
          options={materialOptions}
          value={materialFilter}
          onChange={(e) => {
            setMaterialFilter(e.target.value);
            setPage(1);
          }}
          placeholder="설비 선택"
        />
        <SelectBar
          width="m"
          options={processOptions}
          value={processFilter}
          onChange={(e) => {
            setProcessFilter(e.target.value);
            setPage(1);
          }}
          placeholder="설비 선택"
        />
      </FilterBar>

      <TableWrap>
        <Table
          columns={columns}
          data={rows}
          selectable={false}
          // onRowClick={onRowClick}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <TraceabilityDetail row={selected} />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
`;

const SearchWrap = styled.div`
  flex: 1;
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  min-width: 140px;
`;

const TableWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
