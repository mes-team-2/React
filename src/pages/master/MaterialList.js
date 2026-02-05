import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import Button from "../../components/Button";
import Status from "../../components/Status";
import MaterialDetail from "./MaterialDetail";
import SideDrawer from "../../components/SideDrawer";
import MaterialCreate from "./MaterialCreate";
import { InventoryAPI } from "../../api/AxiosAPI";
import SelectBar from "../../components/SelectBar";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 차트 색상
const COLORS = ["var(--run)", "var(--waiting)", "var(--error)"];

// 날짜 포맷 함수 (yyyy-MM-dd HH:mm)
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

export default function MaterialList() {
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // 날짜 검색상태
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("ALL"); // 재고 상태 필터링을 위한 State

  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // SelectBar 옵션 정의
  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 상태" },
    { value: "SAFE", label: "안전" },
    { value: "CAUTION", label: "주의" },
    { value: "DANGER", label: "경고(품절)" },
  ];

  // 데이터 조회
  const fetchMaterials = async () => {
    try {
      const response = await InventoryAPI.getMaterialList();
      if (response.status === 200) {
        console.log(response.data);
        setData(response.data);
      }
    } catch (e) {
      console.error("자재 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [createOpen]);

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
  };

  // 차트 데이터도 프론트엔드 계산 로직으로 변경
  // 백엔드 stockStatus 무시하고 수량 기반으로 직접 집계
  const inventoryStatusData = useMemo(() => {
    let safe = 0,
      warning = 0,
      danger = 0;

    data.forEach((item) => {
      const currentStock = Number(item.stockQty || 0);
      const safeStock = Number(item.safeQty || 0);

      if (currentStock === 0) {
        danger++; // 재고 0 -> 위험
      } else if (currentStock >= safeStock) {
        safe++; // 재고 >= 안전재고 -> 안전
      } else {
        warning++; // 재고 < 안전재고 -> 주의
      }
    });

    return [
      { name: "안전", value: safe },
      { name: "주의", value: warning },
      { name: "경고", value: danger },
    ];
  }, [data]);

  const stockByMaterialData = useMemo(() => {
    const sorted = [...data]
      .sort((a, b) => b.stockQty - a.stockQty)
      .slice(0, 5);
    return sorted.map((item) => ({
      name: item.materialName,
      stock: item.stockQty,
    }));
  }, [data]);

  const txTrendData = [
    { date: "01-01", inbound: 300, outbound: 200 },
    { date: "01-02", inbound: 200, outbound: 260 },
    { date: "01-03", inbound: 420, outbound: 320 },
    { date: "01-04", inbound: 360, outbound: 280 },
    { date: "01-05", inbound: 520, outbound: 430 },
  ];

  // 필터 및 정렬 로직
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 검색어 필터
      const lower = keyword.toLowerCase();
      const matchesKeyword =
        !keyword.trim() ||
        item.materialName.toLowerCase().includes(lower) ||
        item.materialCode.toLowerCase().includes(lower);

      // 날짜 필터
      let matchesDate = true;
      if (item.inboundAt) {
        const itemDate = new Date(item.inboundAt);
        itemDate.setHours(0, 0, 0, 0);

        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (itemDate < startDate) matchesDate = false;
        }

        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(0, 0, 0, 0);
          if (itemDate > endDate) matchesDate = false;
        }
      } else {
        if (dateRange.start || dateRange.end) matchesDate = false;
      }

      // 상태 필터
      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        const currentStock = Number(item.stockQty || 0);
        const safeStock = Number(item.safeQty || 0);
        let itemStatus = "CAUTION"; // 기본값

        if (currentStock === 0) itemStatus = "DANGER";
        else if (currentStock >= safeStock) itemStatus = "SAFE";

        // 필터값과 계산된 상태가 다르면 제외
        if (itemStatus !== statusFilter) matchesStatus = false;
      }

      return matchesKeyword && matchesDate && matchesStatus;
    });
  }, [keyword, data, dateRange, statusFilter]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => {
    setSelectedIds([]);
  }, [keyword, dateRange]);

  // 컬럼 정의
  const columns = [
    { key: "no", label: "No", width: 50 },
    { key: "materialCode", label: "자재 코드", width: 180 },
    { key: "materialName", label: "자재명", width: 180 },
    { key: "stockQty", label: "재고", width: 100 },
    { key: "safeQty", label: "안전재고", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    {
      key: "stockStatus",
      label: "재고상태",
      width: 150,
      render: (_, row) => {
        // 숫자 변환
        const currentStock = Number(row.stockQty || 0);
        const safeStock = Number(row.safeQty || 0);

        let calcStatus = "CAUTION"; // 기본값 (주의)

        // 재고가 0이면 -> DANGER
        if (currentStock === 0) {
          calcStatus = "DANGER";
        }
        // 재고가 안전재고보다 많거나 같으면 -> SAFE
        else if (currentStock >= safeStock) {
          calcStatus = "SAFE";
        }
        // 재고가 안전재고보다 적으면 (0보다는 큼) -> CAUTION (WARNING)
        else {
          calcStatus = "CAUTION";
        }

        return <Status status={calcStatus} />;
      },
    },
    {
      key: "inboundAt",
      label: "입고일자",
      width: 180,
      render: (val) => formatDate(val),
    },
    {
      key: "createdAt",
      label: "자재등록일자",
      width: 180,
      render: (val) => formatDate(val),
    },
  ];

  const handleRowClick = (item) => {
    const materialObj = { ...item, materialId: item.no };
    setSelectedMaterial(materialObj);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>자재 / 재고관리</h2>
      </Header>

      <ChartGrid>
        <Card>
          <h4>자재 재고 상태</h4>
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                >
                  {inventoryStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
        <Card>
          <h4>자재별 재고 현황</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={stockByMaterialData}>
                <XAxis dataKey="name" fontSize={10} tick={{ dy: 5 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="var(--main)" radius={[9, 9, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
        <Card>
          <h4>자재 입 / 출고 추이 (주간)</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={txTrendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="inbound"
                  stroke="var(--main)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="outbound"
                  stroke="var(--error)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      <FilterBar>
        <InputGroup>
          <SearchDate
            width="m"
            onChange={handleDateChange}
            placeholder="입고일자 검색"
          />
          <SelectBar
            width="s"
            placeholder="상태 선택"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <SearchBar
            width="l"
            placeholder="자재명 / 자재코드 검색"
            onChange={setKeyword} // 키워드 상태 업데이트
            onSearch={() => {}}
          />
        </InputGroup>
        <Button variant="ok" size="m" onClick={() => setCreateOpen(true)}>
          + 신규 자재 등록
        </Button>
      </FilterBar>

      <TableContainer>
        <TableStyle
          columns={columns}
          data={sortedData}
          selectable={false}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onRowClick={handleRowClick}
        />
      </TableContainer>

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <MaterialDetail
          material={selectedMaterial}
          onClose={() => setOpen(false)}
          onRefresh={fetchMaterials}
        />
      </SideDrawer>

      <SideDrawer open={createOpen} onClose={() => setCreateOpen(false)}>
        <MaterialCreate
          onClose={() => {
            setCreateOpen(false);
            fetchMaterials();
          }}
        />
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
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
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
  box-sizing: border-box;
  svg:focus,
  svg *:focus {
    outline: none;
  }
`;
const FilterBar = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;
