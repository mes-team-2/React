import styled from "styled-components";
import { useMemo, useState } from "react";
import TableStyle from "../../components/TableStyle";


export default function FgInventoryDetail({ inventory }) {
  const [lotSort, setLotSort] = useState({ key: null, direction: "asc" });
  const [histSort, setHistSort] = useState({ key: null, direction: "desc" });

  // LOT 정보 데이터 
  const lotList = useMemo(() => {
    if (!inventory) return [];
    return [
      { id: 1, lotNo: "LOT-260128-01", qty: 450, date: "2026-01-28", workOrder: "WO-260128-05", worker: "김생산" },
      { id: 2, lotNo: "LOT-260127-05", qty: 200, date: "2026-01-27", workOrder: "WO-260127-02", worker: "박조립" },
      { id: 3, lotNo: "LOT-260125-11", qty: 150, date: "2026-01-25", workOrder: "WO-260125-01", worker: "이공정" },
      { id: 4, lotNo: "LOT-260120-99", qty: 50, date: "2026-01-20", workOrder: "WO-260120-03", worker: "최반장" },
      { id: 5, lotNo: "LOT-260115-02", qty: 0, date: "2026-01-15", workOrder: "WO-260115-01", worker: "김생산" },
    ];
  }, [inventory]);

  // LOT 정렬 로직
  const sortedLotList = useMemo(() => {
    if (!lotSort.key) return lotList;
    return [...lotList].sort((a, b) => {
      const aVal = a[lotSort.key];
      const bVal = b[lotSort.key];
      if (typeof aVal === "string") {
        return lotSort.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return lotSort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [lotList, lotSort]);


  // 제품 상세 정보
  const detailInfo = useMemo(() => {
    if (!inventory) return null;
    const totalStock = lotList.reduce((acc, cur) => acc + cur.qty, 0);
    return {
      ...inventory,
      productCode: "BAT-12V-100A",
      regDate: "2025-11-01",
      inDate: "2026-01-28",
      unit: "EA",
      stockQty: totalStock,
    };
  }, [inventory]);


  // 입출고 이력 데이터 
  const historyList = useMemo(() => {
    if (!inventory) return [];
    return [
      { id: 101, time: "2026-01-28 14:00", type: "생산입고", qty: 450, location: "A-101", lotNo: "LOT-260128-01" },
      { id: 102, time: "2026-01-28 16:30", type: "제품출하", qty: -100, location: "현대모비스", lotNo: "LOT-260120-99" },
      { id: 103, time: "2026-01-27 09:00", type: "생산입고", qty: 200, location: "B-202", lotNo: "LOT-260127-05" },
      { id: 104, time: "2026-01-26 11:20", type: "창고이동", qty: 0, location: "A-101 -> B-202", lotNo: "LOT-260125-11" },
      { id: 105, time: "2026-01-25 15:45", type: "반품입고", qty: 10, location: "R-001", lotNo: "LOT-260115-02" },
    ];
  }, [inventory]);

  // 이력 정렬 로직
  const sortedHistoryList = useMemo(() => {
    if (!histSort.key) return historyList;
    return [...historyList].sort((a, b) => {
      const aVal = a[histSort.key];
      const bVal = b[histSort.key];
      if (typeof aVal === "string") {
        return histSort.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return histSort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [historyList, histSort]);

  if (!detailInfo) {
    return <Empty>재고를 선택하세요.</Empty>;
  }

  // LOT 테이블 컬럼 정의
  const lotColumns = [
    { key: "lotNo", label: "LOT 번호", width: 140, },
    { key: "qty", label: "재고", width: 80, render: (val) => val.toLocaleString() },
    { key: "date", label: "생산일", width: 100 },
    { key: "workOrder", label: "작업지시", width: 120, },
    { key: "worker", label: "담당자", width: 80 },
  ];

  // 입출고 이력 테이블 컬럼 정의
  const historyColumns = [
    { key: "time", label: "일시", width: 140 },
    { key: "type", label: "구분", width: 100, },
    {
      key: "qty",
      label: "수량",
      width: 80,
      render: (val) => <QtyText $isPositive={val >= 0}>{val > 0 ? `+${val}` : val}</QtyText>
    },
    { key: "location", label: "입·출고지", width: 140 },
    { key: "lotNo", label: "LOT 번호", width: 140, },
  ];

  return (
    <Container>
      <Header>
        <h3>제품 재고 상세 조회</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>제품 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제품코드</label>
              <Value>{detailInfo.productCode}</Value>
            </FullItem>
            <FullItem>
              <label>제품명</label>
              <Value>{detailInfo.productName}</Value>
            </FullItem>
            <FullItem>
              <label>총 재고</label>
              <Value>
                <strong>{detailInfo.stockQty.toLocaleString()}</strong>
                <Unit>{detailInfo.unit}</Unit>
              </Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>LOT 정보</SectionTitle>
          <TableStyle
            columns={lotColumns}
            data={sortedLotList}
            sortConfig={lotSort}
            onSort={(key) =>
              setLotSort((p) => ({
                key,
                direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
              }))
            }
            selectable={false}
          />
        </Section>

        <Section>
          <SectionTitle>입출고 이력</SectionTitle>
          <TableStyle
            columns={historyColumns}
            data={sortedHistoryList}
            sortConfig={histSort}
            onSort={(key) =>
              setHistSort((p) => ({
                key,
                direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
              }))
            }
            selectable={false}
          />
        </Section>
      </Content>
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
  padding-right: 15px;

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
  gap: 15px;
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
    content: '';
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
  gap: 10px;
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
  gap: 5px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  height: 38px;
  
  font-size: var(--fontSm);
  color: var(--font);
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  opacity: 0.6;
`;

const MonoText = styled.span`
  font-family: monospace;
  color: var(--font);
`;


const QtyText = styled.span`
  font-weight: var(--bold);
  color: ${props => props.$isPositive ? 'var(--run)' : 'var(--error)'};
`;
const Unit = styled.span`
  font-size: var(--fontXs); 
  color: var(--font2); 
  font-weight: var(--normal); 
`;