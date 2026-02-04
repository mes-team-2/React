import styled from "styled-components";
import { useState, useMemo, useEffect, useCallback } from "react";
import Table from "../../components/TableStyle";
import BOMDetail from "./BOMDetail";
import { WorkOrderAPI, BomAPI, InventoryAPI } from "../../api/AxiosAPI";
import Button from "../../components/Button";

export default function BOM() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mergedData, setMergedData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

  // 제품 목록 조회
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

  // 데이터 로드 및 병합
  const loadData = useCallback(async () => {
    if (!selectedProduct) return;

    // 기존 데이터를 비워서 화면 잔상 제거
    setMergedData([]);

    try {
      const [bomRes, matRes] = await Promise.all([
        BomAPI.getList(selectedProduct.productCode),
        InventoryAPI.getMaterialList(),
      ]);

      const bomList = bomRes.data;
      const allMaterials = matRes.data;

      const uniqueMaterialMap = new Map();
      allMaterials.forEach((m) => {
        if (!uniqueMaterialMap.has(m.materialCode)) {
          uniqueMaterialMap.set(m.materialCode, m);
        }
      });

      const bomMap = new Map();
      bomList.forEach((b) => {
        bomMap.set(b.materialCode, b);
      });

      const finalData = [];

      uniqueMaterialMap.forEach((mat, code) => {
        if (bomMap.has(code)) {
          finalData.push({
            ...bomMap.get(code),
            isBom: true, // 정렬용 플래그
            productCode: selectedProduct.productCode,
          });
        } else {
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
          <Selected>완제품 목록 </Selected>
          <ProductList>
            {filteredProducts.map((p) => (
              <Product
                key={p.productCode}
                $active={selectedProduct?.productCode === p.productCode}
                onClick={() => setSelectedProduct(p)}
              >
                <ProductItem>{p.productName}</ProductItem>
                <ProductCode>{p.productCode}</ProductCode>
              </Product>
            ))}
          </ProductList>
        </Left>

        <Right>
          <Selected>
            선택된 품목 : {selectedProduct?.productName || "-"}
            <Button
              variant="ok"
              size="m"
              onClick={() => {
                if (selectedProduct) {
                  setEditingRow({
                    ...selectedProduct,
                    bomList: mergedData,
                  });
                }
              }}
            >
              수정{" "}
            </Button>
          </Selected>

          <Table columns={columns} data={mergedData} selectable={false} />
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
  gap: 20px;
`;
const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;
const Body = styled.div`
  display: flex;
  gap: 20px;
`;
const Left = styled.div`
  width: 180px;
  background: white;
  padding: 20px 0;
`;
const ProductList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Product = styled.div`
  padding: 7px 10px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;

  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #fdfbfb 0%, var(--main2) 100%)"
      : "transparent"};

  &:hover {
    transform: translateY(-1px);
    background: ${(props) =>
      props.$active
        ? "linear-gradient(135deg, #fdfbfb 0%, var(--main2) 100%)"
        : "var(--background)"};
  }
`;

const ProductItem = styled.div`
  font-size: var(--fontXxs);
  font-weight: var(--medium);
`;

const ProductCode = styled.div`
  font-size: var(--fontMini);
  font-weight: var(--normal);
  color: var(--font2);
`;

const Right = styled.div`
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 20px 0;
`;
const Selected = styled.div`
  margin-bottom: 15px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--fontMd);
  font-weight: var(--medium);
`;
