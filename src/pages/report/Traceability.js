import styled from "styled-components";
import { useMemo, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import SearchBar from "../../components/SearchBar";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import TraceabilityDetail from "./TraceabilityDetail";
import Pagination from "../../components/Pagination";

import {
  FiSearch,
  FiLink,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
} from "react-icons/fi";

const PROCESS = ["극판 적층", "COS 용접", "전해액 주입/화성", "최종 성능 검사"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTraceRows() {
  const rows = [];
  let id = 1;

  for (let i = 0; i < 80; i++) {
    const lotNo = `LOT-202601-${String(rand(1, 90)).padStart(3, "0")}`;
    const woNo = `WO-202601-00${rand(1, 8)}`;
    const serial = `SN-${Date.now().toString().slice(-6)}-${String(i).padStart(3, "0")}`;

    const ok = Math.random() > 0.08;
    const defect = ok ? "" : ["LOW_OCV", "LEAK", "PRESS_FAIL"][rand(0, 2)];

    rows.push({
      id: id++,
      lotNo,
      workOrderNo: woNo,
      serialNo: serial,
      productCode: "BAT-12V-60Ah",
      productName: "자동차 납축전지 12V",
      lastProcess: PROCESS[rand(0, PROCESS.length - 1)],
      testResult: ok ? "OK" : "NG",
      defectCode: defect,
      producedAt: `2026-01-${String(rand(10, 22)).padStart(2, "0")} ${String(
        rand(8, 18),
      ).padStart(2, "0")}:${String(rand(0, 59)).padStart(2, "0")}`,
      // 자재 LOT 예시(역추적)
      materialLots: [
        `MATLOT-AL-${String(rand(1, 30)).padStart(3, "0")}`,
        `MATLOT-PB-${String(rand(1, 30)).padStart(3, "0")}`,
        `MATLOT-EL-${String(rand(1, 30)).padStart(3, "0")}`,
      ],
    });
  }
  return rows;
}

export default function Traceability() {
  const [rows] = useState(() => makeTraceRows());
  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 페이지당 20개씩

  const filtered = useMemo(() => {
    let data = rows;
    if (resultFilter !== "ALL")
      data = data.filter((r) => r.testResult === resultFilter);

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          r.lotNo.toLowerCase().includes(k) ||
          r.workOrderNo.toLowerCase().includes(k) ||
          r.serialNo.toLowerCase().includes(k) ||
          r.productCode.toLowerCase().includes(k) ||
          r.defectCode.toLowerCase().includes(k) ||
          r.materialLots.some((m) => m.toLowerCase().includes(k)),
      );
    }
    return data;
  }, [rows, keyword, resultFilter]);

  // 페이지네이션 데이터 슬라이싱
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, page]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const summary = useMemo(() => {
    const total = filtered.length;
    const ok = filtered.filter((r) => r.testResult === "OK").length;
    const ng = total - ok;
    const linkCnt = filtered.reduce(
      (a, b) => a + (b.materialLots?.length || 0),
      0,
    );
    const lotCnt = new Set(filtered.map((r) => r.lotNo)).size;
    return { total, ok, ng, linkCnt, lotCnt };
  }, [filtered]);

  // 필터 변경 시 페이지 초기화
  const handleKeywordChange = (v) => {
    setKeyword(v);
    setPage(1); // 검색 시 1페이지로
  };

  const handleFilterChange = (e) => {
    setResultFilter(e.target.value);
    setPage(1); // 필터 변경 시 1페이지로
  };

  const columns = [
    { key: "producedAt", label: "생산일시", width: 170 },
    { key: "lotNo", label: "제품 LOT", width: 160 },
    { key: "serialNo", label: "시리얼", width: 180 },
    { key: "workOrderNo", label: "작업지시", width: 140 },
    { key: "lastProcess", label: "최종 공정", width: 150 },
    { key: "testResult", label: "검사", width: 80 },
    { key: "defectCode", label: "불량코드", width: 120 },
    {
      key: "materialLots",
      label: "연결 자재 LOT",
      width: 200,
      render: (v) =>
        Array.isArray(v)
          ? v.slice(0, 2).join(", ") + (v.length > 2 ? "…" : "")
          : "-",
    },
  ];

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>Traceability 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiSearch />}
          label="조회 결과"
          value={summary.total.toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="OK"
          value={summary.ok.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="NG"
          value={summary.ng.toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiLayers />}
          label="LOT 수"
          value={summary.lotCnt.toLocaleString()}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiLink />}
          label="자재 LOT 링크"
          value={summary.linkCnt.toLocaleString()}
          color="var(--main)"
        />
      </SummaryGrid>

      <FilterBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="제품LOT/시리얼/작업지시/자재LOT/불량코드 검색"
          />
        </SearchWrap>

        <Select
          value={resultFilter}
          onChange={handleFilterChange}
        >
          <option value="ALL">전체</option>
          <option value="OK">OK</option>
          <option value="NG">NG</option>
        </Select>
      </FilterBar>

      <TableWrap>
        <Table
          columns={columns}
          data={paginatedData}
          selectable={false}
          onRowClick={onRowClick}
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
    font-size: 22px;
    font-weight: 700;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
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
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
