import styled from "styled-components";
import Button from "../../components/Button";
import Barcode from 'react-barcode';
import Status from "../../components/Status";

export default function MaterialLogDetail({ row, onClose }) {
  if (!row) return <Empty>이력을 선택하세요.</Empty>;

  // 수량 포맷팅 (콤마 추가)
  const formattedQty = row.qty ? row.qty.toLocaleString() : "-";
  const formattedRemainQty = row.remainQty ? row.remainQty.toLocaleString() : "-";

  const statusKey = row.type === "IN" ? "MATIN" : "MATOUT";

  // 임시 데이터
  const type = row.type === "IN" ? "입고" : row.type === "OUT" ? "출고" : "생산투입";
  const fromLocation = row.fromLocation || "자재 창고 1";
  const toLocation = row.toLocation || "전극 공정 라인 1";
  const manager = row.operator || "Kim Harin";
  const beforeQty = 1500; // 임시
  const afterQty = 1000; // 임시

  return (
    <Wrap>
      <Header>
        <h3>자재 입출고 이력 상세 조회</h3>
        {onClose && <Button variant="cancel" size="s" onClick={onClose}>닫기</Button>}
      </Header>

      <Content>
        {/* LOT 정보 섹션 */}
        <Section>
          <SectionTitle>LOT정보</SectionTitle>
          <LotInfoGrid>
            <Item>
              <LotNo>{row.lotNo}</LotNo>
            </Item>
            <BarcodeWrapper>
              <Barcode value={row.lotNo} width={1} height={60} fontSize={12} />
            </BarcodeWrapper>
          </LotInfoGrid>
        </Section>

        {/* 입출고 정보 섹션 */}
        <Section>
          <SectionTitle>입출고정보</SectionTitle>
          <DataGrid>
            <Item>
              <label>구분</label>

              <Status status={statusKey} type="wide" />

            </Item>
            <Item>
              <label>일시</label>
              <Field><strong>{row.occurredAt}</strong></Field>
            </Item>
            <Item>
              <label>이동 수량</label>
              <Field><strong>{formattedQty}</strong></Field>
            </Item>
            <Item>
              <label>재고 증감 (Before → After)</label>
              <Field><strong>{beforeQty.toLocaleString()} → {afterQty.toLocaleString()}</strong></Field>
            </Item>
            <Item>
              <label>출발 (From)</label>
              <Field><strong>{fromLocation}</strong></Field>
            </Item>
            <Item>
              <label>도착 (To)</label>
              <Field><strong>{toLocation}</strong></Field>
            </Item>
          </DataGrid>
        </Section>

        {/* 자재 정보 섹션 */}
        <Section>
          <SectionTitle>자재정보</SectionTitle>
          <DataGrid>
            <FullWidthItem>
              <label>자재코드</label>
              <Field><strong>{row.materialCode}</strong></Field>
            </FullWidthItem>
            <FullWidthItem>
              <label>자재명</label>
              <Field><strong>{row.materialName}</strong></Field>
            </FullWidthItem>
          </DataGrid>
        </Section>

        {/* 참조 정보 섹션 */}
        <Section>
          <SectionTitle>참조정보</SectionTitle>
          <DataGrid>
            <FullWidthItem>
              <label>담당자</label>
              <Field><strong>{manager}</strong></Field>
            </FullWidthItem>
            <FullWidthItem>
              <label>비고</label>
              <Field><strong>{row.note || "긴급 생산 건 투입"}</strong></Field>
            </FullWidthItem>
          </DataGrid>
        </Section>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.div`
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

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--font2);
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

const LotInfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
`;

const LotNo = styled.div`
  font-size: var(--fontSm);
  font-weight: var(--medium);
  color: var(--font);
`;

const BarcodeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const DataGrid = styled.div`
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

const FullWidthItem = styled(Item)`
  grid-column: 1 / -1;
`;

const Field = styled.div`
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