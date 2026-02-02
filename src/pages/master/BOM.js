import styled from "styled-components";
import { useState, useMemo, useEffect, useCallback } from "react";
import Table from "../../components/TableStyle";
import BOMDetail from "./BOMDetail";
import { WorkOrderAPI, BomAPI, InventoryAPI } from "../../api/AxiosAPI";

export default function BOM() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mergedData, setMergedData] = useState([]);
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

  // 2. 데이터 로드 및 병합 (중복 제거 핵심 로직)
  const loadData = useCallback(async () => {
    if (!selectedProduct) return;

    // [중요] 기존 데이터를 비워서 화면 잔상 제거
    setMergedData([]);

    try {
      const [bomRes, matRes] = await Promise.all([
        BomAPI.getList(selectedProduct.productCode),
        InventoryAPI.getMaterialList(),
      ]);

      const bomList = bomRes.data;
      const allMaterials = matRes.data;

      // ---------------------------------------------------------
      // Step 1. 자재 마스터 중복 제거 (Map 사용)
      // DB에 중복된 자재가 있어도 materialCode가 같으면 하나만 남깁니다.
      // ---------------------------------------------------------
      const uniqueMaterialMap = new Map();
      allMaterials.forEach((m) => {
        // 이미 맵에 있으면 건너뜀 (첫 번째 발견된 것만 사용)
        if (!uniqueMaterialMap.has(m.materialCode)) {
          uniqueMaterialMap.set(m.materialCode, m);
        }
      });

      // ---------------------------------------------------------
      // Step 2. BOM 데이터 매핑 (빠른 조회를 위해 Map 변환)
      // ---------------------------------------------------------
      const bomMap = new Map();
      bomList.forEach((b) => {
        bomMap.set(b.materialCode, b);
      });

      // ---------------------------------------------------------
      // Step 3. 병합 (Unique 자재 목록 기준)
      // ---------------------------------------------------------
      const finalData = [];

      uniqueMaterialMap.forEach((mat, code) => {
        if (bomMap.has(code)) {
          // Case A: BOM에 설정된 자재 -> BOM 정보 사용
          finalData.push({
            ...bomMap.get(code),
            isBom: true, // 정렬용 플래그
            productCode: selectedProduct.productCode,
          });
        } else {
          // Case B: BOM에 없는 자재 -> 0으로 초기화해서 표시
          finalData.push({
            id: null, // 신규 등록용
            materialCode: mat.materialCode,
            materialName: mat.materialName,
            qty: 0,
            unit: mat.unit,
            process: "",
            isBom: false,
            productCode: selectedProduct.productCode,
          });
        }
      });

      // BOM에 설정된 항목이 상단에 오도록 정렬
      finalData.sort((a, b) => (b.isBom === a.isBom ? 0 : b.isBom ? 1 : -1));

      setMergedData(finalData);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  }, [selectedProduct]);

  // 제품 변경 시 데이터 다시 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 저장 완료 후 호출될 핸들러
  const handleSaveComplete = () => {
    setEditingRow(null);
    loadData(); // 데이터 새로고침
  };

  // 검색 필터 (제품명)
  const [keyword, setKeyword] = useState("");
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
            data={mergedData}
            selectable={false}
            onRowClick={(row) => setEditingRow(row)}
          />
        </Right>
      </Body>

      <BOMDetail
        data={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={handleSaveComplete}
      />
    </Wrapper>
  );
}

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
