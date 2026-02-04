import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import SideDrawer from "../../components/SideDrawer";
import ProcessLogDetail from "./ProcessLogDetail";
import Status from "../../components/Status";
import { LogAPI } from "../../api/AxiosAPI";

export default function ProcessLog() {
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  // 날짜 범위 상태
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 데이터 로드 (백엔드 API 호출)
  const loadData = async () => {
    try {
      const params = {
        keyword: keyword || null,
        startDate: dateRange.start || null,
        endDate: dateRange.end || null,
      };
      const res = await LogAPI.getProcessLogs(params);
      setData(res.data);
    } catch (err) {
      console.error("공정 이력 조회 실패", err);
    }
  };

  // 날짜나 키워드가 바뀌면 조회 (원하면 검색 버튼 클릭 시로 변경 가능)
  useEffect(() => {
    loadData();
  }, [dateRange]);

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

  // 클라이언트 측 정렬 (이미 백엔드에서 최신순 정렬해서 줌)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";

      // 숫자일 경우 숫자 정렬
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      // 문자열 정렬
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Wrapper>
      <Header>
        <h2>공정 이력 조회</h2>
      </Header>

      <FilterBar>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* 날짜 선택 컴포넌트 연결 */}
          <SearchDate onChange={(start, end) => setDateRange({ start, end })} />
          <SearchBar
            width="300px"
            placeholder="LOT 번호, 공정, 설비 검색..."
            value={keyword}
            onChange={setKeyword}
            onSearch={loadData} // 엔터/클릭 시 재조회
          />
        </div>
      </FilterBar>

      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={(row) => {
          setSelectedLog(row);
          setOpen(true);
        }}
      />

      {/* 우측 사이드 드로어 (상세 정보) */}
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
`;
const Header = styled.div`
  h2 {
    font-size: 24px;
    font-weight: 700;
  }
`;
const FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
`;
