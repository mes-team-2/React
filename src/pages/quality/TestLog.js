import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import TestLogDetail from "./TestLogDetail";
import Pagination from "../../components/Pagination";
import { LogAPI2 } from "../../api/AxiosAPI2";
import SelectBar from "../../components/SelectBar";

import {
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiPercent,
  FiAlertTriangle,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import SearchDate from "../../components/SearchDate";

// [유틸] YYYY-MM-DD 문자열 반환
const formatDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TestLog() {
  // 전체 원본 데이터 (필터링 전)
  const [allRows, setAllRows] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  // 불량코드 옵션용 리스트
  const [defectCodeList, setDefectCodeList] = useState([]);

  const [loading, setLoading] = useState(false);

  // 필터 상태
  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [defectFilter, setDefectFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // 정렬 및 페이지 상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 페이지당 항목 수

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // SelectBar 값 추출 헬퍼
  const extractValue = (e) => {
    if (!e) return "";
    if (e.target && typeof e.target.value !== "undefined")
      return e.target.value;
    if (e.value !== undefined) return e.value;
    return e;
  };

  const handleKeywordChange = (v) => {
    const val = extractValue(v);
    setKeyword(val);
    if (val === "") setPage(1);
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(1);
  };

  const resultOptions = [
    { value: "ALL", label: "전체 판정" },
    { value: "OK", label: "OK" },
    { value: "NG", label: "NG" },
  ];

  const defectOptions = useMemo(() => {
    const baseOption = [{ value: "ALL", label: "불량코드 전체" }];
    if (!defectCodeList || defectCodeList.length === 0) return baseOption;
    const dynamicOptions = defectCodeList
      .filter((d) => d && d.defectType)
      .map((d) => ({
        value: d.defectType,
        label: `${d.defectType}`,
      }));
    return [...baseOption, ...dynamicOptions];
  }, [defectCodeList]);

  // 1. [데이터 조회] 백엔드에서 '전체 데이터'를 한 번에 가져옴 (size: 2000)
  // 이유: 백엔드 필터가 500 에러를 내므로, 일단 다 가져와서 프론트에서 처리
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 백엔드에 필터 조건을 보내지 않음 (500 에러 방지)
        // size를 크게 설정하여 전체 데이터를 확보
        const params = {
          page: 0,
          size: 2000,
        };

        const res = await LogAPI2.getTestLogs(params);
        const content = res.data.content || [];

        const mapped = content.map((item, idx) => ({
          id: idx,
          inspectedAt: item.endedAt?.replace("T", " ").slice(0, 16), // YYYY-MM-DD HH:mm
          productCode: item.productName,
          productName: item.productName,
          workOrderNo: item.workOrderNo,
          lotNo: item.lotNo,
          processStep: item.processStepName,
          machine: item.machineName,
          voltage: item.voltage,
          humidity: item.humidity,
          temperature: item.temperature,
          leak: false,
          result: item.isOk ? "OK" : "NG",
          defectCode: item.defectType,
          inspector: item.workerCode,
          note: "",
        }));

        setAllRows(mapped);
      } catch (e) {
        console.error("데이터 조회 실패", e);
        setAllRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // 의존성 배열 비움 (처음에 한 번만 로드)

  // 2. [통계 조회] (대시보드용)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // 통계 API는 에러가 안 난다면 필터 없이 호출하거나, 필요시 제거
        const params = {};
        const res = await LogAPI2.getTestSummaryLogs(params);
        setDashboard(res.data);
        if (res.data && res.data.defects) {
          setDefectCodeList(res.data.defects);
        }
      } catch (e) {
        console.error("대시보드 조회 실패", e);
      }
    };
    fetchDashboard();
  }, []);

  // 3. [프론트엔드 필터링 & 정렬] - 핵심 로직
  const processedData = useMemo(() => {
    let data = [...allRows];

    // (1) 날짜 필터 (문자열 비교)
    if (dateRange.start && dateRange.end) {
      const startStr = formatDateStr(dateRange.start);
      const endStr = formatDateStr(dateRange.end);

      data = data.filter((row) => {
        if (!row.inspectedAt) return false;
        const rowDate = row.inspectedAt.substring(0, 10); // YYYY-MM-DD 추출
        return rowDate >= startStr && rowDate <= endStr;
      });
    }

    // (2) 판정 필터
    if (resultFilter !== "ALL") {
      data = data.filter((row) => row.result === resultFilter);
    }

    // (3) 불량코드 필터 (전체 데이터 대상)
    if (defectFilter !== "ALL") {
      data = data.filter((row) => row.defectCode === defectFilter);
    }

    // (4) 검색어 필터
    if (keyword) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (row) =>
          (row.lotNo && row.lotNo.toLowerCase().includes(k)) ||
          (row.workOrderNo && row.workOrderNo.toLowerCase().includes(k)) ||
          (row.productName && row.productName.toLowerCase().includes(k)) ||
          (row.machine && row.machine.toLowerCase().includes(k)) ||
          (row.inspector && row.inspector.toLowerCase().includes(k)),
      );
    }

    // (5) 정렬
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal, "ko", { numeric: true })
            : bVal.localeCompare(aVal, "ko", { numeric: true });
        }
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return data;
  }, [allRows, dateRange, resultFilter, defectFilter, keyword, sortConfig]);

  // 4. [페이지네이션] 필터링된 데이터(processedData)를 자름
  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;

  const currentTableData = useMemo(() => {
    const startIdx = (page - 1) * itemsPerPage;
    return processedData.slice(startIdx, startIdx + itemsPerPage);
  }, [processedData, page]);

  // 필터 변경 시 1페이지로 리셋
  useEffect(() => {
    setPage(1);
  }, [resultFilter, defectFilter, keyword, dateRange]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  // 테이블 컬럼 정의
  const columns = [
    { key: "inspectedAt", label: "검사일시", width: 170 },
    { key: "result", label: "판정", width: 80 },
    { key: "defectCode", label: "불량코드", width: 120 },
    { key: "lotNo", label: "LOT", width: 160 },
    { key: "workOrderNo", label: "작업지시", width: 140 },
    { key: "processStep", label: "공정", width: 150 },
    { key: "machine", label: "설비", width: 120 },
    { key: "voltage", label: "전압", width: 80 },
    { key: "humidity", label: "습도", width: 80 },
    { key: "temperature", label: "온도", width: 80 },
    { key: "inspector", label: "검사자", width: 110 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>검사 이력</h2>
      </Header>

      {/* 요약 카드 */}
      <SummaryGrid>
        <SummaryCard
          icon={<FiClipboard />}
          label="검사 건수"
          value={(dashboard?.totalCount ?? 0).toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="OK"
          value={(dashboard?.okCount ?? 0).toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="NG"
          value={(dashboard?.ngCount ?? 0).toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiPercent />}
          label="OK 비율"
          value={`${dashboard?.okRate ?? 0}%`}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiAlertTriangle />}
          label="최다 불량"
          value={dashboard?.topDefectType ?? "-"}
          color="var(--error)"
        />
      </SummaryGrid>

      {/* 차트 영역 */}
      <ChartGrid>
        <ChartCard>
          <h4>일자별 OK/NG 추이</h4>
          <ChartBox>
            {dashboard && (
              <ResponsiveContainer>
                <LineChart data={dashboard.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ok"
                    stroke="var(--run)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ng"
                    stroke="var(--error)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>불량 유형 분포</h4>
          <ChartBox>
            {dashboard && dashboard.defects && (
              <ResponsiveContainer>
                <BarChart data={dashboard.defects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="defectType" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="var(--error)"
                    radius={[9, 9, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartBox>
        </ChartCard>
      </ChartGrid>

      {/* 필터 영역 */}
      <FilterBar>
        <SearchDate onChange={handleDateChange} placeholder="입고일자 검색" />

        <SelectBar
          width="s"
          value={resultFilter}
          options={resultOptions}
          onChange={(e) => {
            setResultFilter(extractValue(e));
            // page는 useEffect에서 자동 리셋됨
          }}
        />

        <SelectBar
          width="m"
          value={defectFilter}
          options={defectOptions}
          onChange={(e) => {
            setDefectFilter(extractValue(e));
          }}
        />

        <SearchBar
          width="l"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder="LOT / 작업지시 / 제품 / 설비 / 검사자 검색"
        />
      </FilterBar>

      {/* 테이블 영역 */}
      <TableWrap>
        <Table
          columns={columns}
          data={currentTableData} // 필터링 + 페이징 처리된 데이터 전달
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
        />
      </TableWrap>

      {/* 페이지네이션 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <TestLogDetail row={selected} defectMap={defectOptions} />
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
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  h4 {
    font-size: var(--fontSm);
    margin-bottom: 20px;
    font-weight: var(--medium);
    color: var(--font);
  }
`;

const ChartBox = styled.div`
  height: 220px;
  padding-right: 20px;
  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
`;

const TableWrap = styled.div`
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
