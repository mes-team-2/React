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
          const bomItem = bomMap.get(code);
          // [수정] BOM 목록에서는 소요량이 0보다 큰 것만 표시
          if (bomItem.qty > 0) {
            finalData.push({
              ...bomItem,
              isBom: true,
              productCode: selectedProduct.productCode,
            });
          }
        } else {
          // BOM에 없는 자재(qty=0)는 리스트에 추가하지 않음 (숨김 처리)
          // 만약 "수정" 모달에 넘겨주기 위해 전체 데이터가 필요하다면 별도로 관리하거나
          // 수정 모달(BOMDetail)에서 전체 자재를 다시 불러오므로 여기서는 필터링해도 됨.
        }
      });

      setMergedData(finalData);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  }, [selectedProduct]);

  // 제품 변경 시 데이터 다시 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveComplete = () => {
    setEditingRow(null);
    loadData();
  };

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
                  // 수정 모달 열 때 현재 화면에 보이는 데이터(mergedData)를 넘겨줍니다.
                  // (BOMDetail 내부에서 전체 자재 목록을 다시 불러와 매핑하므로 괜찮습니다.)
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

// 스타일 컴포넌트 생략 (기존 유지)
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
