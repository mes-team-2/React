import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { FaBoxOpen, FaTimes, FaPrint, FaQrcode } from "react-icons/fa";
import SearchBar from "../../components/SearchBar";
import SelectBar from "../../components/SelectBar";
import SearchDate from "../../components/SearchDate";
import QRCodeCreate from "../../components/QRCodeCreate";
import { ProductLotAPI, InventoryAPI } from "../../api/AxiosAPI";

export default function QRCodePage() {
  const [items, setItems] = useState([]); // 전체 통합 데이터
  const [filteredItems, setFilteredItems] = useState([]); // 필터링된 데이터

  const [inputBuffer, setInputBuffer] = useState("");

  // 필터 상태
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [productNameFilter, setProductNameFilter] = useState("ALL");
  const [materialNameFilter, setMaterialNameFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [prodRes, matRes] = await Promise.all([
        ProductLotAPI.search
          ? ProductLotAPI.search({})
          : Promise.resolve({ data: [] }),
        InventoryAPI?.getMaterialList
          ? InventoryAPI.getMaterialList({})
          : Promise.resolve({ data: [] }),
      ]);

      if (prodRes.data && prodRes.data.length > 0) {
        console.log("🔥 [제품 데이터 확인]", prodRes.data[0]);
      }
      if (matRes.data && matRes.data.length > 0) {
        console.log("🔥 [자재 데이터 확인]", matRes.data[0]);
      }

      // 데이터 표준화
      const products = (prodRes.data || []).map((p) => ({
        id: `PROD-${p.lotNo}`,
        type: "PRODUCT",
        name: p.productName,
        code: p.lotNo, // QR에 들어갈 값
        category: "제품 LOT",
        qty: p.currentQty,
        desc: `제품코드: ${p.productCode}`,
        date: p.createdAt || "-",
        rawData: p,
      }));

      const materials = (matRes.data || []).map((m) => ({
        id: `MAT-${m.lotNo}`,
        type: "MATERIAL",
        name: m.materialName,
        code: m.lotNo, // QR에 들어갈 값
        category: "자재 LOT",
        qty: m.currentQty,
        desc: `자재코드: ${m.materialCode}`,
        date: m.createdAt || "-",
        rawData: m,
      }));

      // 합치기
      setItems([...products, ...materials]);
    } catch (err) {
      console.error("QR 데이터 로드 실패:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productOptions = useMemo(() => {
    const uniqueNames = [...new Set(items.map((item) => item.name))];
    const options = uniqueNames.map((name) => ({
      value: name,
      label: name,
    }));
    return [{ value: "ALL", label: "전체 품목" }, ...options];
  }, [items]);

  useEffect(() => {
    let result = [...items];

    if (productNameFilter !== "ALL") {
      result = result.filter((item) => item.name === productNameFilter);
    }

    // 키워드 검색 (LOT번호)
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter((item) => item.code.toLowerCase().includes(k));
    }

    setFilteredItems(result);
  }, [items, productNameFilter, keyword, dateRange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (inputBuffer.length > 0) {
          handleScan(inputBuffer);
          setInputBuffer("");
        }
      } else {
        // 일반 문자열만 버퍼에 추가
        if (e.key.length === 1) {
          setInputBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputBuffer, items]);

  const handleScan = (code) => {
    // 스캔된 코드와 일치하는 항목 찾기
    const found = items.find(
      (item) => item.code.trim().toUpperCase() === code.trim().toUpperCase(),
    );

    if (found) {
      alert(`스캔 성공: ${found.name} (${found.code})`);
    } else {
      alert(`해당 QR코드(${code})에 대한 정보를 찾을 수 없습니다.`);
    }
  };

  return (
    <Wrapper>
      <Header>
        <h2>QR Code System</h2>
      </Header>
      <Content>
        <Section>
          <SectionTitle>
            제품 LOT ({filteredItems.filter((i) => i.type === "PRODUCT").length}
            )
          </SectionTitle>
          <FilterBar>
            <SelectBar
              width="l"
              placeholder="제품 선택"
              options={productOptions}
              value={productNameFilter}
              onChange={(e) => setProductNameFilter(e.target.value)}
            />
            <SearchBar
              width="l"
              placeholder="LOT 번호 검색"
              value={keyword}
              onChange={setKeyword}
              onSearch={() => {}}
            />
          </FilterBar>

          <ProductGrid>
            {filteredItems.map((item) => (
              <ProductCard key={item.id} $type={item.type}>
                <CardHeader>
                  <ProductName>{item.name}</ProductName>
                  <CategoryBadge $type={item.type}>
                    {item.category}
                  </CategoryBadge>
                </CardHeader>

                <QRWrapper>
                  <QRCodeCreate
                    value={item.code}
                    date={item.date}
                    size={"m"}
                    showText={true}
                    showDate={true}
                    showDownload={true}
                  />
                </QRWrapper>
              </ProductCard>
            ))}
          </ProductGrid>
        </Section>

        <Section>
          <SectionTitle>
            자재 LOT (
            {filteredItems.filter((i) => i.type === "MATERIAL").length})
          </SectionTitle>
          <FilterBar>
            <SelectBar
              width="l"
              placeholder="자재 선택"
              options={productOptions}
              value={productNameFilter}
              onChange={(e) => setProductNameFilter(e.target.value)}
            />
            <SearchBar
              width="l"
              placeholder="LOT 번호 검색"
              value={keyword}
              onChange={setKeyword}
              onSearch={() => {}}
            />
          </FilterBar>

          <ProductGrid>
            {filteredItems
              .filter((item) => item.type === "MATERIAL")
              .map((item) => (
                <ProductCard key={item.id} $type={item.type}>
                  <CardHeader>
                    <ProductName>{item.name}</ProductName>
                    <CategoryBadge $type={item.type}>
                      {item.category}
                    </CategoryBadge>
                  </CardHeader>

                  <QRWrapper>
                    <QRCodeCreate
                      value={item.code}
                      size={"m"}
                      showText={true}
                      showDate={true}
                      showDownload={true}
                      date={item.date}
                    />
                  </QRWrapper>
                </ProductCard>
              ))}
          </ProductGrid>
        </Section>
      </Content>
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
    margin: 0;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
  gap: 30px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--background2);
    border-radius: 3px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;
  margin-top: 20px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--main);
    border-radius: 2px;
  }
`;
const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProductGrid = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const ProductCard = styled.div`
  background: white;
  padding: 20px;
  min-width: 230px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ProductName = styled.div`
  font-weight: var(--bold);
  font-size: var(--fontMd);
  color: var(--font);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  background: ${(props) =>
    props.$type === "PRODUCT" ? "var(--run)" : "var(--waiting)"};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
`;

const QRWrapper = styled.div`
  padding: 10px;
  background: white;
`;
