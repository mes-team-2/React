import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SelectBar from "../../components/SelectBar";
import SideDrawer from "../../components/SideDrawer";
import Pagination from "../../components/Pagination";
import ProcessLogDetail from "./ProcessLogDetail";
import { LogAPI } from "../../api/AxiosAPI";

export default function ProcessLog() {
  const [data, setData] = useState([]);

  // 필터 상태
  const [keyword, setKeyword] = useState("");
  const [processFilter, setProcessFilter] = useState("all");
  const [lotFilter, setLotFilter] = useState("all");

  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const lotOptions = useMemo(() => {
    const uniqueLots = Array.from(
      new Set(data.map((item) => item.lotNo)),
    ).filter(Boolean);
    const options = uniqueLots.map((lot) => ({
      value: lot,
      label: lot,
    }));
    return [{ value: "all", label: "전체 LOT" }, ...options];
  }, [data]);

  // 공정 선택 옵션
  const processOptions = [
    { value: "all", label: "전체 공정" },
    { value: "전극", label: "전극공정" },
    { value: "조립", label: "조립공정" },
    { value: "활성화", label: "활성화공정" },
    { value: "팩", label: "팩공정" },
    { value: "검사", label: "검사공정" },
  ];

  // 데이터 로드
  const loadData = async () => {
    try {
      const params = { keyword: null };
      const res = await LogAPI.getProcessLogs(params);
      setData(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("공정 이력 조회 실패", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 데이터 가공 파이프라인
  const processedData = useMemo(() => {
    let result = [...data];

    // 공정명 필터
    if (processFilter !== "all") {
      result = result.filter((item) =>
        (item.processStep || "").includes(processFilter),
      );
    }

    // LOT 번호 필터
    if (lotFilter !== "all") {
      result = result.filter((item) => item.lotNo === lotFilter);
    }

    // 검색어 필터
    if (keyword) {
      const lowerKey = keyword.toLowerCase();
      result = result.filter((item) => {
        // 기존 LOT, 공정명 제거하고 작업자(workerName) 추가
        const machine = (item.machineName || "").toLowerCase(); // 설비명
        const worker = (item.workerName || "").toLowerCase(); // 작업자명

        // 설비명 또는 작업자명에 검색어가 포함되면 통과
        return machine.includes(lowerKey) || worker.includes(lowerKey);
      });
    }

    // 정렬
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, keyword, processFilter, lotFilter, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // 현재 페이지 데이터 슬라이싱
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // 핸들러들
  const handleProcessFilterChange = (e) => {
    setProcessFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleLotFilterChange = (e) => {
    setLotFilter(e.target.value);
    setCurrentPage(1);
  };

  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 160 },
    { key: "processStep", label: "공정명", width: 140 },
    { key: "machineName", label: "설비명", width: 160 },
    { key: "goodQty", label: "양품", width: 80 },
    { key: "badQty", label: "불량", width: 80 },
    { key: "workerName", label: "작업자", width: 100 },
    { key: "startTime", label: "시작 시간", width: 160 },
    { key: "endTime", label: "종료 시간", width: 160 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>공정 이력 조회</h2>
      </Header>

      <FilterBar>
        <FilterGroup>
          <SelectBar
            width="l"
            placeholder="LOT 선택"
            options={lotOptions}
            value={lotFilter}
            onChange={handleLotFilterChange}
          />

          <SelectBar
            width="s"
            placeholder="공정 선택"
            options={processOptions}
            value={processFilter}
            onChange={handleProcessFilterChange}
          />

          <SearchBar
            width="l"
            placeholder="설비 / 작업자 검색"
            value={keyword}
            onChange={setKeyword}
            onSearch={loadData}
          />
        </FilterGroup>
      </FilterBar>

      <Table
        columns={columns}
        data={currentData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={(row) => {
          setSelectedLog(row);
          setOpen(true);
        }}
        selectable={false}
      />

      {processedData.length > 0 && (
        <PaginationWrapper>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </PaginationWrapper>
      )}

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <ProcessLogDetail log={selectedLog} />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
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
  gap: 12px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
  padding-bottom: 20px;
`;
