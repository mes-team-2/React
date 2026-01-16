import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

export default function BOMDetail({ bom }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     자재 구성
  ========================= */
  const materialData = useMemo(() => {
    if (!bom) return [];
    return [
      { id: 1, material: "납판", requiredQty: 600, scrapRate: 2.5 },
      { id: 2, material: "전해액", requiredQty: 300, scrapRate: 1.2 },
      { id: 3, material: "케이스", requiredQty: 100, scrapRate: 0.5 },
      { id: 4, material: "터미널", requiredQty: 80, scrapRate: 0.8 },
    ];
  }, [bom]);

  /* =========================
     정렬
  ========================= */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return materialData;

    return [...materialData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [materialData, sortConfig]);

  if (!bom) {
    return <Empty>BOM을 선택하세요.</Empty>;
  }

  /* =========================
     컬럼
  ========================= */
  const columns = [
    { key: "material", label: "자재명", width: 180 },
    { key: "requiredQty", label: "소요 수량", width: 140 },
    { key: "scrapRate", label: "스크랩률(%)", width: 140 },
  ];

  return (
    <Wrapper>
      <Header>
        <h3>BOM 상세</h3>
      </Header>

      <Summary>
        <Item>
          <label>제품</label>
          <strong>{bom.productName}</strong>
        </Item>
        <Item>
          <label>자재 수</label>
          <strong>{bom.materialCount}</strong>
        </Item>
        <Item>
          <label>총 소요량</label>
          <strong>{bom.totalRequiredQty}</strong>
        </Item>
      </Summary>

      {/* ===== 차트 ===== */}
      <Card>
        <h4>자재 구성 비율</h4>
        <ChartBox>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={materialData} dataKey="requiredQty" outerRadius={90}>
                {materialData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>

      {/* ===== 테이블 ===== */}
      <Section>
        <h4>자재 상세</h4>
        <Table
          columns={columns}
          data={sortedData}
          sortConfig={sortConfig}
          onSort={(key) =>
            setSortConfig((p) => ({
              key,
              direction:
                p.key === key && p.direction === "asc" ? "desc" : "asc",
            }))
          }
          selectable={false}
        />
      </Section>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  h3 {
    font-size: 20px;
    font-weight: 700;
  }
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 14px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const ChartBox = styled.div`
  height: 220px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const Section = styled.div`
  h4 {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
  }
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  opacity: 0.6;
`;
