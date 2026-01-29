import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";

export default function FgInventoryDetail({ inventory }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });


  const detailInfo = useMemo(() => {
    if (!inventory) return null;

    return {
      ...inventory,
      productCode: "BAT-12V-100A", // 예시 코드
      regDate: "2025-11-01", // 제품 등록일
      inDate: "2026-01-28", // 입고일
      unit: "EA",
      mfgDate: "2026-01-20 14:00", // 제조일자
      process: "조립 (Assembly)", // 공정
      line: "Line #2", // 라인
      workOrder: "WO-260120-05", // 작업지시번호
      worker: "김생산 (OP-102)" // 작업자
    };
  }, [inventory]);

  const historyData = useMemo(() => {
    if (!inventory) return [];
    return [
      {
        id: 1,
        type: "생산입고",
        qty: 500,
        ref: "WO-260120-05",
        time: "2026-01-05 14:00",
        worker: "김생산"
      },
      {
        id: 2,
        type: "출하출고",
        qty: -200,
        ref: "DO-260105-01",
        time: "2026-01-05 16:30",
        worker: "이물류"
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

  if (!detailInfo) {
    return <Empty>재고를 선택하세요.</Empty>;
  }

  // 상태값 매핑 헬퍼 함수
  const getStockStatus = (qty, safeQty) => {
    if (qty < 0) return 'DANGER';
    if (qty < safeQty) return 'CAUTION';
    return 'SAFE';
  };

  const columns = [
    { key: "time", label: "일시", width: 140 },
    { key: "type", label: "구분", width: 100 },
    {
      key: "qty",
      label: "수량",
      width: 80,
      render: (val) => (
        <span>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </span>
      )
    },
    { key: "ref", label: "작업지시", width: 150 },
    { key: "worker", label: "담당자", width: 80 },
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
              <label>제품등록일자</label>
              <Value>{detailInfo.regDate}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>재고 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>입고일자</label>
              <Value>{detailInfo.inDate}</Value>
            </FullItem>
            <Item>
              <label>재고 수량</label>
              <Value>
                <strong>{detailInfo.stockQty?.toLocaleString()}</strong>
                <Unit>EA</Unit>
              </Value>
            </Item>
            <Item>
              <label>안전 재고</label>
              <Value>
                <strong>{detailInfo.safeQty?.toLocaleString()}</strong>
                <Unit>EA</Unit>
              </Value>
            </Item>
            <Item>
              <label>단위</label>
              <Value>{detailInfo.unit}</Value>
            </Item>
            <Item>
              <label>재고상태</label>

              <Status type="wide"
                status={getStockStatus(detailInfo.stockQty, detailInfo.safeQty)}
              />

            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>생산 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제조일자</label>
              <Value>{detailInfo.mfgDate}</Value>
            </FullItem>

            <Item>
              <label>생산공정</label>
              <Value>{detailInfo.process}</Value>
            </Item>
            <Item>
              <label>생산라인</label>
              <Value>{detailInfo.line}</Value>
            </Item>
            <Item>
              <label>작업지시</label>
              <Value>{detailInfo.workOrder}</Value>
            </Item>
            <Item>
              <label>담당자</label>
              <Value>{detailInfo.worker}</Value>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>입 / 출고 이력</SectionTitle>
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
  gap: 20px;
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


const Section = styled.div`
  h4 {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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

  
  strong {
    font-weight: var(--normal);
    color: var(--font);
    font-size: var(--fontXs);
  }
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  opacity: 0.6;
`;

const Unit = styled.span`
  font-size: var(--fontXs); 
  color: var(--font2); 
  font-weight: normal; 
  margin-left: 4px;
`;
