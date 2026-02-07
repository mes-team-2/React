import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { FaBoxOpen, FaTimes, FaPrint, FaQrcode } from "react-icons/fa";
import SearchBar from "../../components/SearchBar";
import SelectBar from "../../components/SelectBar";
import SearchDate from "../../components/SearchDate";
import QRCodeCreate from "../../components/QRCodeCreate";
import { ProductLotAPI, InventoryAPI } from "../../api/AxiosAPI";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

// 화면 표시용 날짜 포맷 (yyyy-MM-dd HH:mm)
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-"; // 유효하지 않은 날짜 처리

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// 날짜 범위 비교 헬퍼 함수
const isDateInRange = (targetDateStr, startDateStr, endDateStr) => {
  if (!targetDateStr || targetDateStr === "-") return false;
  if (!startDateStr || !endDateStr) return true;

  try {
    // 문자열을 날짜 객체로 변환 (시간은 00:00:00으로 통일)
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);

    // 날짜 비교
    return target >= start && target <= end;
  } catch (e) {
    console.error("날짜 비교 오류:", e);
    return false;
  }
};

export default function QRCodePage() {
  const [items, setItems] = useState([]); // 제품 데이터
  const [items2, setItems2] = useState([]); // 자재 데이터
  const [filteredItems, setFilteredItems] = useState([]); // 필터링된 제품
  const [filteredItems2, setFilteredItems2] = useState([]); // 필터링된 자재

  const [inputBuffer, setInputBuffer] = useState("");

  // 날짜 필터 상태
  const [productDateRange, setProductDateRange] = useState({
    start: null,
    end: null,
  });
  const [materialDateRange, setMaterialDateRange] = useState({
    start: null,
    end: null,
  });

  // 제품용 필터
  const [keyword, setKeyword] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("ALL");

  // 자재용 필터
  const [materialKeyword, setMaterialKeyword] = useState("");
  const [materialNameFilter, setMaterialNameFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [prodRes, matRes] = await Promise.all([
        ProductLotAPI.search
          ? ProductLotAPI.search({})
          : Promise.resolve({ data: [] }),
        InventoryAPI2?.getMaterialLotList
          ? InventoryAPI2.getMaterialLotList({})
          : Promise.resolve({ data: [] }),
      ]);

      if (prodRes.data && prodRes.data.length > 0) {
        console.log("🔥 [제품 데이터]", prodRes.data[0]);
      }
      if (matRes.data?.content && matRes.data.content.length > 0) {
        console.log("🔥 [자재 데이터]", matRes.data.content[0]);
      }

      // 데이터 표준화
      const products = (prodRes.data || []).map((p) => ({
        id: `PROD-${p.lotNo}`,
        type: "PRODUCT",
        name: p.productName,
        code: p.lotNo,
        category: "제품 LOT",
        qty: p.currentQty,
        desc: `제품코드: ${p.productCode}`,
        date: formatDate(p.createdAt || "-"),
        rawData: p, // 원본 데이터 보존 (createdAt 사용 위함)
      }));

      const materials = (matRes.data?.content || []).map((m) => ({
        id: `MAT-${m.lotNo}`,
        type: "MATERIAL",
        name: m.materialName,
        code: m.lotNo,
        category: "자재 LOT",
        qty: m.currentQty,
        desc: `자재코드: ${m.materialCode}`,
        date: formatDate(m.inboundDate || "-"),
        rawData: m, // 원본 데이터 보존 (inboundDate 사용 위함)
      }));

      setItems(products);
      setItems2(materials);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setItems([]);
      setItems2([]);
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

  const materialOptions = useMemo(() => {
    const uniqueNames = [...new Set(items2.map((item) => item.name))];
    const options = uniqueNames.map((name) => ({
      value: name,
      label: name,
    }));
    return [{ value: "ALL", label: "전체 자재" }, ...options];
  }, [items2]);

  // 제품 필터링 로직
  useEffect(() => {
    let result = [...items];

    if (productNameFilter !== "ALL") {
      result = result.filter((item) => item.name === productNameFilter);
    }

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter((item) => item.code.toLowerCase().includes(k));
    }

    // 날짜 필터 (원본 rawData.createdAt 사용)
    if (productDateRange.start && productDateRange.end) {
      console.log("제품 날짜 필터링:", productDateRange);
      result = result.filter((item) =>
        isDateInRange(
          item.rawData.createdAt,
          productDateRange.start,
          productDateRange.end,
        ),
      );
    }

    setFilteredItems(result);
  }, [items, productNameFilter, keyword, productDateRange]);

  // 자재 필터링 로직
  useEffect(() => {
    let result = [...items2];

    if (materialNameFilter !== "ALL") {
      result = result.filter((item) => item.name === materialNameFilter);
    }

    if (materialKeyword.trim()) {
      const k = materialKeyword.toLowerCase();
      result = result.filter((item) => item.code.toLowerCase().includes(k));
    }

    // 날짜 필터 (원본 rawData.inboundDate 사용)
    if (materialDateRange.start && materialDateRange.end) {
      console.log("자재 날짜 필터링:", materialDateRange);
      result = result.filter((item) =>
        isDateInRange(
          item.rawData.inboundDate,
          materialDateRange.start,
          materialDateRange.end,
        ),
      );
    }

    setFilteredItems2(result);
  }, [items2, materialKeyword, materialNameFilter, materialDateRange]);

  // 스캐너 핸들링
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (inputBuffer.length > 0) {
          handleScan(inputBuffer);
          setInputBuffer("");
        }
      } else {
        if (e.key.length === 1) {
          setInputBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputBuffer, items, items2]);

  const handleScan = (code) => {
    const allItems = [...items, ...items2];
    const found = allItems.find(
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
          <SectionTitle>제품 LOT ({filteredItems.length})</SectionTitle>
          <FilterBar>
            <SearchDate
              width="m"
              onChange={(s, e) => {
                console.log("제품 날짜 선택:", s, e);
                setProductDateRange({ start: s, end: e });
              }}
            />
            <SelectBar
              width="m"
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
          <SectionTitle>자재 LOT ({filteredItems2.length})</SectionTitle>
          <FilterBar>
            <SearchDate
              width="m"
              onChange={(s, e) => {
                console.log("자재 날짜 선택:", s, e);
                setMaterialDateRange({ start: s, end: e });
              }}
            />
            <SelectBar
              width="m"
              placeholder="자재 선택"
              options={materialOptions}
              value={materialNameFilter}
              onChange={(e) => setMaterialNameFilter(e.target.value)}
            />
            <SearchBar
              width="l"
              placeholder="LOT 번호 검색"
              value={materialKeyword}
              onChange={setMaterialKeyword}
              onSearch={() => {}}
            />
          </FilterBar>

          <ProductGrid>
            {filteredItems2.map((item2) => (
              <ProductCard key={item2.id} $type={item2.type}>
                <CardHeader>
                  <ProductName>{item2.name}</ProductName>
                  <CategoryBadge $type={item2.type}>
                    {item2.category}
                  </CategoryBadge>
                </CardHeader>

                <QRWrapper>
                  <QRCodeCreate
                    value={item2.code}
                    size={"m"}
                    type="MATERIAL"
                    showText={true}
                    showDate={true}
                    showDownload={true}
                    date={item2.date}
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
  font-size: var(--fontXxs);
  background: ${(props) =>
    props.$type === "PRODUCT" ? "var(--run)" : "var(--waiting)"};
  color: var(--font3);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: var(--medium);
`;

const QRWrapper = styled.div`
  padding: 10px;
  background: var(--background);
`;
