import React from 'react';
import styled from "styled-components";
import { FiBox, FiActivity, FiCalendar } from "react-icons/fi";
import Status from "../../components/Status";

export default function MaterialLotDetail({ row, onClose }) {
  if (!row) return null;

  // 상태값 매핑 (Status 컴포넌트용)
  let statusKey = "DEFAULT";
  if (row.status === "WAITING") statusKey = "LOT_WAIT";
  else if (row.status === "RUNNING") statusKey = "LOT_RUN";
  else if (row.status === "EMPTY") statusKey = "LOT_ERR";

  return (
    <Container>
      <Header>
        <h3>자재 LOT 상세 조회</h3>
        {onClose && <Button variant="cancel" size="s" onClick={onClose}>닫기</Button>}
      </Header>

      <Content>
        <Section>
          <SectionTitle>LOT 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>LOT 번호</label>
              <Value>{row.lot_no}</Value>
            </FullItem>

            <Item>
              <label>LOT 상태</label>
              <div>
                <Status status={statusKey} type="wide" />
              </div>
            </Item>
            <Item>
              <label>최초 입고일</label>
              <Value>{row.inbound_date}</Value>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>자재코드</label>
              <Value>{row.code}</Value>
            </FullItem>
            <FullItem>
              <label>자재명</label>
              <Value>{row.name}</Value>
            </FullItem><FullItem>
              <label>단위</label>
              <Value>{row.unit}</Value>
            </FullItem>
          </Grid>

        </Section>

        <Section>
          <SectionTitle>재고 현황</SectionTitle>
          <Grid>
            <FullItem>
              <label>현재고(A)</label>
              <Value>{row.current.toLocaleString()} <Unit>EA</Unit></Value>
            </FullItem>
            <FullItem>
              <label>생산 투입중(B)</label>
              <Value>{row.production.toLocaleString()} <Unit>EA</Unit></Value>
            </FullItem>
            <FullItem>
              <label>가용 재고(A-B)</label>
              <Value>
                {row.available.toLocaleString()} <Unit>EA</Unit>
              </Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>이력 정보</SectionTitle>
          <Grid>

            <Item>
              <label>최근 상태 변경일</label>
              <Value>{row.date}</Value>
            </Item>
          </Grid>
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

const SmallItem = styled(Item)`
  grid-column: 1 / -2;
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


const HighlightValue = styled(Value)`
  color: var(--main); font-weight: var(--bold); font-size: var(--fontMd);
`;

const Unit = styled.span`
  font-size: var(--fontXs); color: var(--font2); font-weight: normal; margin-left: 4px;
`;

const Footer = styled.div`
  margin-top: auto; display: flex; justify-content: flex-end;
  padding-top: 20px; border-top: 1px solid var(--border);
`;

const Button = styled.button`
  padding: 10px 24px; border-radius: 8px;
  background: var(--font2); color: white; border: none;
  font-weight: var(--bold); cursor: pointer;
  &:hover { opacity: 0.9; }
`;