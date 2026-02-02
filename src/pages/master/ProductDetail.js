import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SummaryCard from "../../components/SummaryCard";
import { BomAPI } from "../../api/AxiosAPI"; // [New] API Import

import { FaBoxOpen, FaWarehouse, FaCheckCircle, FaClock } from "react-icons/fa";

export default function ProductDetail({ product }) {
  const [bomData, setBomData] = useState([]); // [New] BOM State
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // [New] 제품이 바뀔 때마다 실제 DB에서 BOM 조회
  useEffect(() => {
    const fetchBom = async () => {
      if (!product?.productCode) return;
      try {
        const res = await BomAPI.getList(product.productCode);
        setBomData(res.data);
      } catch (err) {
        console.error("BOM 조회 실패", err);
      }
    };
    fetchBom();
  }, [product]);

  const bomColumns = [
    { key: "materialCode", label: "자재 코드", width: 140 },
    { key: "materialName", label: "자재명", width: 160 },
    { key: "qty", label: "소요 수량", width: 100 },
    { key: "process", label: "투입 공정", width: 120 },
  ];

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

  if (!product) {
    return <Empty>제품을 선택하세요.</Empty>;
  }

  return (
    <Wrapper>
      <Header>
        <div>
          <h3>{product.productName}</h3>
          <span>{product.productCode}</span>
        </div>
      </Header>

      {/* ===== 요약 카드 (2 x 2) ===== */}
      <SummaryGrid>
        <SummaryCard
          icon={<FaBoxOpen />}
          label="제품 유형"
          value={product.type || "완제품"}
        />
        <SummaryCard
          icon={<FaWarehouse />}
          label="재고 수량"
          // [수정] "EA" 제거, 데이터 없으면 0
          value={product.stockQty?.toLocaleString() ?? 0}
        />
        <SummaryCard
          icon={<FaCheckCircle />}
          label="단위" // [수정] 상태 -> 단위
          value={product.unit || "EA"}
        />
        <SummaryCard
          icon={<FaClock />}
          label="최근 갱신일"
          value={product.updatedAt}
        />
      </SummaryGrid>

      {/* ===== BOM 구성 ===== */}
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
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
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
