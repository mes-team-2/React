import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import Table from "../../components/TableStyle";
import BOMDetail from "./BOMDetail";
import { WorkOrderAPI, BomAPI } from "../../api/AxiosAPI";

export default function BOM() {
  const [keyword, setKeyword] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [bomData, setBomData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

  // 1. 제품 목록 조회
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await WorkOrderAPI.getProductList();
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProduct(res.data[0]);
        }
      } catch (err) {
        console.error("제품 목록 로드 실패", err);
      }
    };
    fetchProducts();
  }, []);

  // 2. BOM 조회 (백엔드 데이터 그대로 사용)
  const loadBom = async () => {
    if (!selectedProduct) return;
    try {
      const res = await BomAPI.getList(selectedProduct.productCode);
      // 백엔드에서 이미 process(note) 값이 채워져 오므로 그대로 사용합니다.
      setBomData(res.data);
    } catch (err) {
      console.error("BOM 로드 실패", err);
    }
  };

  useEffect(() => {
    loadBom();
  }, [selectedProduct]);

  // 검색 필터
  const filteredProducts = useMemo(() => {
    if (!keyword) return products;
    return products.filter((p) =>
      p.productName.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [keyword, products]);

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
        <Left>
          <ProductList>
            {filteredProducts.map((p) => (
              <ProductItem
                key={p.productCode}
                $active={selectedProduct?.productCode === p.productCode}
                onClick={() => setSelectedProduct(p)}
              >
                {p.productName}
              </ProductItem>
            ))}
          </ProductList>
        </Left>

        <Right>
          <Selected>
            <span>선택된 품목</span>
            <strong>{selectedProduct?.productName || "-"}</strong>
          </Selected>

          <Table
            columns={columns}
            data={bomData}
            selectable={false}
            onRowClick={(row) => setEditingRow(row)}
          />
        </Right>
      </Body>

      <BOMDetail
        data={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={() => {
          setEditingRow(null);
          loadBom(); // 저장 후 목록 갱신
        }}
      />
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
