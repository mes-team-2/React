import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import LotDetail from "./LotDetail";
import MaterialDetail from "../master/MaterialDetail"; // 참고용 (LOT 화면에서는 미사용)
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


const LOT_STATUS_COLORS = {
  사용중: "var(--main)",
  보관: "var(--run)",
  소진: "var(--stop)",
  HOLD: "var(--waiting)",
};

export default function Lot() {

  // 상태관리
  const [viewMode, setViewMode] = useState("LOT");
  const [keyword, setKeyword] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [lotOpen, setLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const handleKeywordChange = (v) => {
    if (typeof v === "string") return setKeyword(v);
    if (v?.target?.value !== undefined) return setKeyword(v.target.value);
    setKeyword("");
  };

  /* =========================
     LOT 더미 데이터
  ========================= */
  const lotData = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => {
        const materialCode =
          i % 4 === 0
            ? "MAT-CASE"
            : i % 4 === 1
              ? "MAT-LEAD"
              : i % 4 === 2
                ? "MAT-ELEC"
                : "MAT-SEP";

        const materialName =
          materialCode === "MAT-CASE"
            ? "배터리 케이스"
            : materialCode === "MAT-LEAD"
              ? "납판"
              : materialCode === "MAT-ELEC"
                ? "전해액"
                : "분리막";

        //  차트용 수량 데이터 시뮬레이션
        const initialQty = 1000; // 생산 실적 (Actual)
        const plannedQty = 1000 + (i % 3 === 0 ? 100 : 0); // 생산 계획 (Plan) - 가끔 계획이 더 많음
        const remainQty = Math.max(0, initialQty - i * 45); // 현재 잔량

        const status = i % 3 === 0 ? "사용중" : i % 3 === 1 ? "보관" : "소진";

        // 날짜 생성 (최근 7일치 데이터가 나오도록 조정)
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - (i % 7));
        const dateStr = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`;

        return {
          id: i + 1,
          lotNo: `LOT-202601-${String(i + 1).padStart(3, "0")}`,
          materialCode,
          materialName,
          inboundAt: dateStr,
          remainQty,
          initialQty,
          plannedQty,
          status,
          workOrderNo: `WO-202601-00${(i % 5) + 1}`,
          createdAt: `${dateStr} 09:00`,
        };
      }),
    [],
  );


  // 자재 목록 (Select)
  const materialOptions = useMemo(() => {
    const map = {};
    lotData.forEach((lot) => {
      map[lot.materialCode] = lot.materialName;
    });
    return Object.entries(map).map(([code, name]) => ({
      code,
      name,
    }));
  }, [lotData]);

  // LOT 필터링
  const filteredLots = useMemo(() => {
    let rows = lotData;

    if (viewMode === "MATERIAL" && selectedMaterial) {
      rows = rows.filter((lot) => lot.materialCode === selectedMaterial);
    }

    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      rows = rows.filter(
        (lot) =>
          lot.lotNo.toLowerCase().includes(lower) ||
          lot.materialCode.toLowerCase().includes(lower) ||
          lot.materialName.toLowerCase().includes(lower) ||
          lot.workOrderNo.toLowerCase().includes(lower),
      );
    }

    return rows;
  }, [lotData, viewMode, selectedMaterial, keyword]);

  // 정렬
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const sortedLots = useMemo(() => {
    if (!sortConfig.key) return filteredLots;

    return [...filteredLots].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredLots, sortConfig]);

  /* =========================
     ViewMode 변경 시 초기화
  ========================= */
  useEffect(() => {
    setKeyword("");
    setSortConfig({ key: null, direction: "asc" });
    if (viewMode === "LOT") setSelectedMaterial("");
  }, [viewMode]);

  /* =========================
     차트 (LOT 기준일 때만)
  ========================= */
  const statusChart = useMemo(() => {
    const map = {};
    lotData.forEach((lot) => {
      map[lot.status] = (map[lot.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [lotData]);

  const dailyPerformanceChart = useMemo(() => {
    const map = {};
    // 날짜순 정렬을 위해
    const sortedData = [...lotData].sort((a, b) => a.inboundAt.localeCompare(b.inboundAt));

    sortedData.forEach((lot) => {
      const date = lot.inboundAt.slice(5, 10); // MM/DD
      if (!map[date]) map[date] = { date, plan: 0, actual: 0 };

      map[date].plan += lot.plannedQty;  // 계획 수량 누적
      map[date].actual += lot.initialQty; // 실적 수량 누적
    });
    return Object.values(map);
  }, [lotData]);

  // 컬럼 
  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "materialCode", label: "제품코드", width: 140 },
    { key: "materialName", label: "제품명", width: 160 },
    { key: "initialQty", label: "생산수량", width: 100 }, // 잔량 대신 생산량 표시 (필요시 잔량도 표기가능)
    { key: "status", label: "상태", width: 110 },
    { key: "workOrderNo", label: "작업지시", width: 160 },
    { key: "inboundAt", label: "생산일", width: 140 },
  ];

  // Row 클릭 핸들러
  const handleRowClick = (row) => {
    setSelectedLot(row);
    setLotOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>LOT 및 생산 관리</h2>
      </Header>

      {viewMode === "LOT" && (
        <ChartGrid>
          <Card>
            <h4>일자별 생산 계획 vs 실적</h4>
            <ChartBox>
              <ResponsiveContainer>
                <LineChart data={dailyPerformanceChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="plan"
                    name="계획수량"
                    stroke="var(--main)" // 파란색 계열
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="생산실적"
                    stroke="var(--run)" // 초록색 계열
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>

          <Card>
            <h4>LOT 상태 분포</h4>
            <ChartBox>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusChart}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {statusChart.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={LOT_STATUS_COLORS[entry.name] || "#6366f1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>
        </ChartGrid>
      )}

      <FilterBar>
        <ViewSelect
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <option value="LOT">전체 LOT</option>
          <option value="MATERIAL">자재 LOT 보기</option>
        </ViewSelect>

        {viewMode === "MATERIAL" && (
          <MaterialSelect
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
          >
            <option value="">자재 선택</option>
            {materialOptions.map((m) => (
              <option key={m.code} value={m.code}>
                {m.name} ({m.code})
              </option>
            ))}
          </MaterialSelect>
        )}

        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="LOT 번호 / 자재 / 작업지시 검색"
          />
        </SearchWrap>
      </FilterBar>

      <Table
        columns={columns}
        data={sortedLots}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectable={false}
        onRowClick={handleRowClick}
      />

      <SideDrawer open={lotOpen} onClose={() => setLotOpen(false)}>
        <LotDetail lot={selectedLot} />
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
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;



const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: 600;
  }
`;

const ChartBox = styled.div`
  height: 220px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ViewSelect = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-size: 13px;
  background: white;
`;

const MaterialSelect = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-size: 13px;
  background: white;
  min-width: 200px;
`;

const SearchWrap = styled.div`
  flex: 1;
`;