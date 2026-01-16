import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";

export default function InventoryDetail({ inventory }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     입출고 이력
  ========================= */
  const historyData = useMemo(() => {
    if (!inventory) return [];
    return [
      {
        id: 1,
        type: "IN",
        qty: 500,
        ref: "LOT-202601-001",
        time: "2026-01-05 14:00",
      },
      {
        id: 2,
        type: "OUT",
        qty: 200,
        ref: "출하-202601-01",
        time: "2026-01-05 16:30",
      },
    ];
  }, [inventory]);

  const sortedHistory = useMemo(() => {
    if (!sortConfig.key) return historyData;

    return [...historyData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [historyData, sortConfig]);

  if (!inventory) {
    return <Empty>재고를 선택하세요.</Empty>;
  }

  const columns = [
    { key: "type", label: "구분", width: 100 },
    { key: "qty", label: "수량", width: 100 },
    { key: "ref", label: "참조", width: 180 },
    { key: "time", label: "시각", width: 160 },
  ];

  return (
    <Wrapper>
      <Header>
        <h3>완제품 재고 상세</h3>
      </Header>

      <Summary>
        <Item>
          <label>제품</label>
          <strong>{inventory.productName}</strong>
        </Item>
        <Item>
          <label>재고 수량</label>
          <strong>{inventory.stockQty}</strong>
        </Item>
        <Item>
          <label>안전 재고</label>
          <strong>{inventory.safeQty}</strong>
        </Item>
        <Item>
          <label>상태</label>
          <strong>{inventory.status}</strong>
        </Item>
      </Summary>

      <Section>
        <h4>입 / 출고 이력</h4>
        <Table
          columns={columns}
          data={sortedHistory}
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
  grid-template-columns: repeat(2, 1fr);
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
