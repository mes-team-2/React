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
import Status from "../../components/Status";

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

// 불량 코드 한글 매핑 상수
const DEFECT_NAMES = {
  SCRATCH: "스크래치",
  THICKNESS_ERROR: "두께 불량",
  MISALIGNMENT: "정렬 불량",
  MISSING_PART: "부품 누락",
  LOW_VOLTAGE: "전압 미달",
  HIGH_TEMP: "고온 발생",
  WELDING_ERROR: "용접 불량",
  LABEL_ERROR: "라벨 부착 불량",
  DIMENSION_ERROR: "치수 불량",
  FOREIGN_MATERIAL: "이물질 혼입",
  ETC: "기타",
  NONE: "양품",
};

// 코드 -> 한글 변환 헬퍼 함수
const getDefectName = (code) => DEFECT_NAMES[code] || code;

// YYYY-MM-DD 문자열 반환
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
        label: getDefectName(d.defectType), // 프론트에 출력되는 불량유형명
      }));
    return [...baseOption, ...dynamicOptions];
  }, [defectCodeList]);

  // 데이터 조회 / 백엔드에서 '전체 데이터'를 한 번에 가져옴
  // 필요한 데이터만 가져오면 좋은데 백엔드 필터가 500 에러 남
  // 백엔드 수정하기 어려워서 일단 무식하게 다 가져와서 프론트에서 처리한다는 마인드 ㅇㅇ
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

  // 통계 조회
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
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

  // 프론트엔드 필터링 & 정렬
  const processedData = useMemo(() => {
    let data = [...allRows];

    if (dateRange.start && dateRange.end) {
      const startStr = formatDateStr(dateRange.start);
      const endStr = formatDateStr(dateRange.end);

      data = data.filter((row) => {
        if (!row.inspectedAt) return false;
        const rowDate = row.inspectedAt.substring(0, 10);
        return rowDate >= startStr && rowDate <= endStr;
      });
    }

    if (resultFilter !== "ALL") {
      data = data.filter((row) => row.result === resultFilter);
    }

    // 불량코드 필터 (영어 코드로 비교)
    if (defectFilter !== "ALL") {
      data = data.filter((row) => row.defectCode === defectFilter);
    }

    if (keyword) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (row) =>
          (row.lotNo && row.lotNo.toLowerCase().includes(k)) ||
          (row.workOrderNo && row.workOrderNo.toLowerCase().includes(k)) ||
          (row.productName && row.productName.toLowerCase().includes(k)) ||
          (row.machine && row.machine.toLowerCase().includes(k)) ||
          (row.inspector && row.inspector.toLowerCase().includes(k)) ||
          (row.processStep && row.processStep.toLowerCase().includes(k)) ||
          // 검색어로 한글 불량명을 입력했을 때도 검색되게 추가
          (row.defectCode && getDefectName(row.defectCode).includes(k)),
      );
    }

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

  // 페이지네이션
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
    { key: "inspectedAt", label: "검사일시", width: 150 },
    {
      key: "result",
      label: "판정",
      width: 150,
      render: (val) => <Status status={val} />,
    },
    {
      key: "defectCode",
      label: "불량유형",
      width: 120,
      render: (code) => (code ? getDefectName(code) : "-"),
    },
    { key: "lotNo", label: "LOT", width: 160 },
    { key: "productName", label: "제품명", width: 160 },
    { key: "workOrderNo", label: "작업지시", width: 140 },
    { key: "processStep", label: "공정", width: 150 },
    { key: "machine", label: "설비", width: 120 },
    {
      key: "voltage",
      label: "전압",
      width: 80,
      render: (val) => (val ? `${val}V` : "-"),
    },
    {
      key: "humidity",
      label: "습도",
      width: 80,
      render: (val) => (val ? `${val}%` : "-"),
    },
    {
      key: "temperature",
      label: "온도",
      width: 80,
      render: (val) => (val ? `${val}°C` : ""),
    },
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
          value={getDefectName(dashboard?.topDefectType) || "-"}
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
                  <XAxis
                    dataKey="defectType"
                    tickFormatter={(val) => getDefectName(val)}
                    interval={0} // 모든 라벨 표시
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => getDefectName(label)} />
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

      <Table
        columns={columns}
        data={currentTableData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={onRowClick}
      />

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
