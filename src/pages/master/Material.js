import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import MaterialDetail from "./MaterialDetail";
import SideDrawer from "../../components/SideDrawer";
import MaterialCreate from "./MaterialCreate";
import Status from "../../components/Status";
import { InventoryAPI } from "../../api/AxiosAPI";

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

/* =========================
   차트 색상
========================= */
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function Material() {
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // 1. 데이터 조회
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

  // 2. 차트 데이터 가공
  const inventoryStatusData = useMemo(() => {
    let safe = 0,
      warning = 0,
      danger = 0;
    data.forEach((item) => {
      if (item.stockStatus === "SAFE") safe++;
      else if (item.stockStatus === "WARNING" || item.stockStatus === "CAUTION")
        warning++;
      else danger++;
    });
    return [
      { name: "충분", value: safe },
      { name: "부족", value: warning },
      { name: "위험", value: danger },
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

  // 3. 필터 및 정렬
  const filteredData = useMemo(() => {
    if (!keyword.trim()) return data;
    const lower = keyword.toLowerCase();
    return data.filter(
      (item) =>
        item.materialName.toLowerCase().includes(lower) ||
        item.materialCode.toLowerCase().includes(lower),
    );
  }, [keyword, data]);

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
  }, [keyword]);

  /* =========================
     4. 컬럼 정의 (여기서 매핑 처리!)
  ========================= */
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
      render: (value) => <Status status={value} />,
    },
    { key: "createdAt", label: "자재등록일자", width: 180 },
    { key: "inboundAt", label: "입고일자", width: 180 },
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
                <XAxis dataKey="name" fontSize={12} tick={{ dy: 5 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="outbound"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Card>
      </ChartGrid>

      <FilterBar>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="자재명 / 자재코드 검색"
        />
        <CreateButton onClick={() => setCreateOpen(true)}>
          + 신규 자재 등록
        </CreateButton>
      </FilterBar>

      <TableContainer>
        <Table
          columns={columns}
          data={sortedData}
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

/* Styled Components (기존 유지) */
const CreateButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--main);
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #333;
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
  padding: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  h4 {
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: 600;
    color: #555;
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
  justify-content: space-between;
  align-items: center;
`;
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;
