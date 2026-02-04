import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import TableStyle from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import { BomAPI } from "../../api/AxiosAPI";

export default function ProductDetail({ product, onClose, onEdit }) {
  const [bomData, setBomData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // 제품이 바뀔 때마다 실제 DB에서 BOM 조회
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
    { key: "materialName", label: "자재명", width: 80 },
    { key: "qty", label: "소요량", width: 80 },
    { key: "unit", label: "단위", width: 50 },
    { key: "process", label: "투입 공정", width: 100 },
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
    return <p>제품을 선택하세요.</p>;
  }

  return (
    <Container>
      <Header>
        <h3>제품 상세 조회</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>제품 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제품명</label>
              <Value>{product.productName}</Value>
            </FullItem>
            <FullItem>
              <label>제품코드</label>
              <Value>{product.productCode}</Value>
            </FullItem>
            <Item>
              <label>전압(V)</label>
              <Value>{product.voltage}</Value>
            </Item>
            <Item>
              <label>용량(Ah)</label>
              <Value>{product.capacityAh}</Value>
            </Item>
          </Grid>
        </Section>
        <Section>
          <SectionTitle>BOM 구성 정보</SectionTitle>
          <TableStyle
            columns={bomColumns}
            data={sortedBomData}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={false}
          />
        </Section>
      </Content>
      <Footer>
        <Button variant="ok" size="m" onClick={onEdit}>
          수정
        </Button>
        <Button variant="cancel" size="m" onClick={onClose}>
          닫기
        </Button>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
    margin-bottom: 20px;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 10px;
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
  gap: 12px;
`;
const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;
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
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: var(--fontXs);
    font-weight: var(--medium);
    color: var(--font2);
    padding: 2px;
  }
`;
const FullItem = styled(Item)`
  grid-column: 1 / -1;
`;
const Value = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
`;

const Footer = styled.div`
  margin-top: auto;
  background: white;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
`;
