import styled from "styled-components";
import { useState, useMemo } from "react";
import Table from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import BOMDetail from "./BOMDetail";

/* =========================
   제품 3종 고정
========================= */
const PRODUCTS = [
  { id: 1, code: "PROD-12V-S", name: "12V 배터리 소형" },
  { id: 2, code: "PROD-12V-M", name: "12V 배터리 중형" },
  { id: 3, code: "PROD-12V-L", name: "12V 배터리 대형" },
];

/* =========================
   BOM 데이터
========================= */
const BASE_BOM = [
  {
    id: 1,
    materialCode: "MAT-CASE",
    materialName: "배터리 케이스",
    qty: 1,
    unit: "EA",
    process: "조립공정",
  },
  {
    id: 2,
    materialCode: "MAT-PLATE-P",
    materialName: "납극판 (+)",
    qty: 12,
    unit: "EA",
    process: "전극공정",
  },
  {
    id: 3,
    materialCode: "MAT-PLATE-N",
    materialName: "납극판 (-)",
    qty: 12,
    unit: "EA",
    process: "전극공정",
  },
  {
    id: 4,
    materialCode: "MAT-SEP",
    materialName: "격리막 (Separator)",
    qty: 24,
    unit: "EA",
    process: "적층공정",
  },
  {
    id: 5,
    materialCode: "MAT-ELEC",
    materialName: "전해액 (황산)",
    qty: 450,
    unit: "ml",
    process: "충전공정",
  },
];

const BOM_BY_PRODUCT = {
  "PROD-12V-S": BASE_BOM,
  "PROD-12V-M": BASE_BOM.map((b) => ({ ...b, qty: Math.round(b.qty * 1.3) })),
  "PROD-12V-L": BASE_BOM.map((b) => ({ ...b, qty: Math.round(b.qty * 1.6) })),
};

export default function BOM() {
  const [keyword, setKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [editingRow, setEditingRow] = useState(null);

  const products = useMemo(() => {
    if (!keyword) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [keyword]);

  const bomData = BOM_BY_PRODUCT[selectedProduct.code];

  const columns = [
    { key: "materialCode", label: "자재코드", width: 160 },
    { key: "materialName", label: "자재명", width: 200 },
    { key: "qty", label: "소요량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "process", label: "투입 공정", width: 140 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>BOM 관리</h2>
      </Header>

      <Body>
        {/* 좌측 제품 목록 */}
        <Left>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="제품 검색"
          />
          <ProductList>
            {products.map((p) => (
              <ProductItem
                key={p.code}
                $active={p.code === selectedProduct.code}
                onClick={() => setSelectedProduct(p)}
              >
                {p.name}
              </ProductItem>
            ))}
          </ProductList>
        </Left>

        {/* 우측 BOM */}
        <Right>
          <Selected>
            <span>선택된 품목</span>
            <strong>{selectedProduct.name}</strong>
          </Selected>

          <Table
            columns={columns}
            data={bomData}
            selectable={false}
            onRowClick={(row) => setEditingRow(row)}
          />
        </Right>
      </Body>

      {/* BOM 수정 */}
      <BOMDetail data={editingRow} onClose={() => setEditingRow(null)} />
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Body = styled.div`
  display: flex;
  gap: 20px;
`;

const Left = styled.div`
  width: 260px;
  background: white;
  border-radius: 16px;
  padding: 14px;
`;

const ProductList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProductItem = styled.div`
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#eef2ff" : "transparent")};

  &:hover {
    background: #f4f6fb;
  }
`;

const Right = styled.div`
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 16px;
`;

const Selected = styled.div`
  margin-bottom: 12px;

  span {
    font-size: 12px;
    opacity: 0.6;
  }
  strong {
    display: block;
    margin-top: 4px;
    font-size: 15px;
  }
`;
