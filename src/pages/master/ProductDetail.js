import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";

/* =========================
   제품 상세
========================= */
export default function ProductDetail({ product }) {
  /* =========================
     Hooks (❗ 조건 없이 최상단)
  ========================= */
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const bomData = useMemo(() => {
    if (!product) return [];
    return [
      {
        id: 1,
        materialCode: "MAT-001",
        materialName: "납판",
        qty: 10,
        process: "조립",
      },
      {
        id: 2,
        materialCode: "MAT-002",
        materialName: "전해액",
        qty: 5,
        process: "충전",
      },
    ];
  }, [product]);

  /* =========================
     컬럼
  ========================= */
  const bomColumns = [
    { key: "materialCode", label: "자재 코드", width: 140 },
    { key: "materialName", label: "자재명", width: 160 },
    { key: "qty", label: "소요 수량", width: 100 },
    { key: "process", label: "공정", width: 120 },
  ];

  /* =========================
     정렬
  ========================= */
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedBomData = useMemo(() => {
    if (!sortConfig.key) return bomData;

    return [...bomData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    });
  }, [bomData, sortConfig]);

  /* =========================
     선택 안 됐을 때 (마지막)
  ========================= */
  if (!product) {
    return <Empty>제품을 선택하세요.</Empty>;
  }

  return (
    <Wrapper>
      {/* ===== 헤더 ===== */}
      <Header>
        <div>
          <h3>{product.productName}</h3>
          <span>{product.productCode}</span>
        </div>
        <Badge>{product.productType}</Badge>
      </Header>

      {/* ===== 요약 ===== */}
      <SummaryGrid>
        <SummaryItem>
          <label>유형</label>
          <strong>{product.productType}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>사용 여부</label>
          <strong>{product.useYn}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>등록일</label>
          <strong>{product.createdAt}</strong>
        </SummaryItem>
      </SummaryGrid>

      {/* ===== BOM ===== */}
      <Card>
        <SectionTitle>BOM 구성</SectionTitle>
        <Table
          columns={bomColumns}
          data={sortedBomData}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
        />
      </Card>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const Badge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.15);
  color: var(--main);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
`;

const SummaryItem = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
  }
`;

const Card = styled.section`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
`;
